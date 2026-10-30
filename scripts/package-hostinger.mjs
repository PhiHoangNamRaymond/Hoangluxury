// Windows packaging for the user's Hostinger/File Manager workflow. Packages
// only dist, includes .htaccess, and never overwrites an earlier release.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = resolve(root, 'dist');
const title = 'Private Car Transfer From Hanoi Or Noi Bai Airport Hoang Luxury Travel Official Code';
if (process.platform !== 'win32') throw new Error('This packager uses Windows ZIP support. Build and ZIP the contents of dist, including .htaccess, on your platform.');
for (const required of ['index.html', '.htaccess', 'robots.txt', 'sitemap.xml', 'booking/index.html', 'feedback/index.html', 'admin/index.html']) {
  if (!(await stat(resolve(dist, required))).isFile()) throw new Error(`Missing build file: ${required}. Run npm run build first.`);
}

const files = [];
async function checkFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    const name = relative(dist, full).replaceAll('\\', '/');
    if ((await lstat(full)).isSymbolicLink()) throw new Error(`Do not package symlinks: ${name}`);
    if (/(^|\/)(?:\.env[^/]*|\.git|node_modules|src|secrets|credentials|package(?:-lock)?\.json|README\.md|SECURITY\.md)(\/|$)|\.(?:map|sql|gs|pem|key|zip|backup|dump)$/i.test(name)) throw new Error(`Unsafe/unexpected public build file: ${name}`);
    if (entry.isDirectory()) await checkFiles(full);
    else files.push(name);
  }
}
await checkFiles(dist);
const stamp = new Date().toISOString().replaceAll(':', '-');
const output = resolve(root, 'releases', stamp);
await mkdir(output, { recursive: true });
const archive = resolve(output, `${title}.zip`);
const command = `$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$base = [System.IO.Path]::GetFullPath($env:HLT_RELEASE_DIST).TrimEnd([char]92, [char]47)
$zip = [System.IO.Compression.ZipFile]::Open($env:HLT_RELEASE_ZIP, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($file in [System.IO.Directory]::EnumerateFiles($base, '*', [System.IO.SearchOption]::AllDirectories)) {
    $name = $file.Substring($base.Length + 1).Replace([char]92, [char]47)
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file, $name, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally { $zip.Dispose() }
$check = [System.IO.Compression.ZipFile]::OpenRead($env:HLT_RELEASE_ZIP)
try { ConvertTo-Json -InputObject @($check.Entries | ForEach-Object { $_.FullName }) -Compress } finally { $check.Dispose() }`;
const entries = JSON.parse(execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], {
  env: { ...process.env, HLT_RELEASE_DIST: dist, HLT_RELEASE_ZIP: archive }, encoding: 'utf8',
}).trim());
// Windows .NET CreateFromDirectory may use backslashes, which Linux hosts
// treat as literal filenames. Check EVERY entry, not just the root files.
if (!Array.isArray(entries) || entries.some(name => name.includes('\\')) ||
    JSON.stringify([...entries].sort()) !== JSON.stringify([...files].sort())) {
  throw new Error('ZIP paths differ from the build or contain Windows separators. Do not upload this archive.');
}
const count = entries.length;
const bytes = await readFile(archive);
const manifest = { title, domain: 'https://hoangluxury.travel', createdAt: new Date().toISOString(), fileCount: count,
  archiveBytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'),
  upload: 'Extract the ZIP contents directly inside the domain public_html. Do not upload the source repository or env files.' };
await writeFile(resolve(output, 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ archive, fileCount: count, megabytes: (bytes.length / 1024 / 1024).toFixed(1), sha256: manifest.sha256 }, null, 2));
