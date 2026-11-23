import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const cwd = fileURLToPath(new URL("..", import.meta.url));
test("secret files and customer captures ignored; deployment source remains reviewable", () => {
  const ignored = [".env.local", "cloudflare/.dev.vars", "cloudflare/.dev.vars.production", "cloudflare/.wrangler/state/test", ".npmrc", "private-data/bookings.csv", "exports/bookings.xlsx", "diagnostics/session.har", "service-account-prod.json", "client_secret_google.json"];
  const kept = [".env.example", "cloudflare/.dev.vars.example", "cloudflare/wrangler.toml", "vercel.json", "public/.htaccess", "supabase/01-schema.sql", "package-lock.json"];
  const output = execFileSync("git", ["check-ignore", "--no-index", "--stdin"], { cwd, input: [...ignored, ...kept].join("\n") + "\n", encoding: "utf8" }).trim().split(/\r?\n/);
  for (const name of ignored) assert.ok(output.includes(name), `not ignored: ${name}`);
  for (const name of kept) assert.ok(!output.includes(name), `source hidden: ${name}`);
});
