// Read-only, high-confidence check. Never prints matched values. Not a complete
// credential scanner; supplement with GitHub secret scanning / gitleaks.
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const cwd = fileURLToPath(new URL("..", import.meta.url));
const files = [...new Set(execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {cwd}).toString().split("\0"))];
const findings=[];
let checked=0;
function hasSecret(text) {
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]+-----END/.test(text)) return true;
  for (const match of text.matchAll(/sb_secret_[A-Za-z0-9_-]{24,}/g)) {
    if (match[0] !== "sb_secret_ThisIsOnlyAnOfflineTestValue") return true;
  }
  for (const jwt of text.matchAll(/eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)) {
    try { if(JSON.parse(Buffer.from(jwt[1],"base64url").toString()).role === "service_role") return true; } catch { /* not a JWT */ }
  }
  return false;
}
for(const path of files) {
  if(!path || /^(?:assets|dist|node_modules)\//.test(path) || !/\.(?:[cm]?js|jsx|json|sql|gs|md|toml|ya?ml|html|txt)$|(?:^|\/)\.env(?:\.|$)/i.test(path)) continue;
  try {
    const text=await readFile(new URL(path.replaceAll("\\","/"), new URL("..",import.meta.url)),"utf8");
    checked++;
    if(hasSecret(text)) findings.push(path);
  } catch(error) { if(error.code !== "ENOENT") throw error; } // Deleted tracked files.
}
console.log(`Checked ${checked} source/config files for known Supabase server keys and private keys.`);
if(findings.length) { console.error("Possible secrets in these files (values redacted):",findings); process.exitCode=1; }
else console.log("No matching secrets found. Ignored env files and Git history are NOT covered.");
