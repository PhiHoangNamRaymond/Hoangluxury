// Chặn quốc gia trong public/.htaccess (25/11/2026): đọc đúng các điều kiện đang có trong
// file rồi thử bằng regex JS tương đương (Apache không chạy trong test).
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const htaccess = await readFile(new URL("../public/.htaccess", import.meta.url), "utf8");
const lines = htaccess.split(/\r?\n/);
const ruleIndex = lines.findIndex((line) => line.startsWith("RewriteRule ^ /unavailable/"));
const conds = lines.slice(ruleIndex - 3, ruleIndex).map((line) => line.match(/^RewriteCond %\{([A-Za-z_:-]+)\} (!?)(\S+)/));
const toRegex = (pattern) => new RegExp(pattern, "i");
const redirects = (country, path) => conds.every(([, variable, negate, pattern]) => {
  const value = variable === "HTTP:CF-IPCountry" ? country : path;
  const match = toRegex(pattern).test(value);
  return negate ? !match : match;
});

test("visitors from VN, CN, HK, LA, KH, MM are sent to /unavailable/ with no-store; others are not", () => {
  assert.ok(ruleIndex > 0, "rule present");
  assert.match(lines[ruleIndex], /\[R=302,L,E=HLT_GEO_BLOCK:1\]/);
  assert.match(htaccess, /Header always set Cache-Control "no-store" env=HLT_GEO_BLOCK/);
  for (const country of ["VN", "CN", "HK", "LA", "KH", "MM", "vn"]) {
    for (const path of ["/", "/routes/hanoi-to-sapa-private-transfer/", "/booking/", "/admin/", "/index.html"]) {
      assert.equal(redirects(country, path), true, `${country} ${path}`);
    }
  }
  for (const country of ["US", "DE", "SG", "TH", "JP", "AU", "", "XX"]) assert.equal(redirects(country, "/"), false, country);
});

test("the notice page, its files and static assets are never redirected (no loop, no cached redirects)", () => {
  for (const path of ["/unavailable/", "/unavailable/index.html", "/unavailable/hoang-luxury-travel-official-logo.png",
    "/assets/index-abc.js", "/assets/index-abc.css", "/favicon-32.png", "/robots.txt", "/sitemap.xml", "/.well-known/acme-challenge/x"]) {
    assert.equal(redirects("VN", path), false, path);
  }
});
