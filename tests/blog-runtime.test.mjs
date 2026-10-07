// Offline tests only: mocked fetch/client, no email or remote database writes.
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { renderMarkdown } from "../src/lib/markdown.js";
import { readAuthFlow, passwordError } from "../src/lib/auth-flow.js";
import { publicConfigError } from "../src/lib/public-config.js";
import { fetchPublicBlog, normalizePublicArticle, validBlogSlug } from "../src/lib/public-blog.js";
import { blogImageExtension, blogImageError, blogImageMaxBytes, formatBytes } from "../src/lib/blog-upload.js";
import { filterBlogArticles } from "../src/config/blog.js";
import { createInviteHandler } from "../supabase/functions/invite-writer/index.js";

test("Markdown strips executable HTML, unsafe links, SVG and CSS but keeps formatting", () => {
  const window = new JSDOM("").window;
  try {
    const html = renderMarkdown(`## Safe heading\n\n**Bold** [Safe](https://example.com)\n\n<script>alert(1)</script>
<img src="https://example.com/a.jpg" onerror="alert(2)" style="position:fixed" srcset="bad 2x">
<a href="javascript:alert(3)" target="_blank">Bad</a><iframe src="https://example.com"></iframe>
<svg onload="alert(4)"></svg><form><input name="token"></form>`, createDOMPurify(window));
    const document = new JSDOM(html).window.document;
    assert.equal(document.querySelector("h2").textContent, "Safe heading");
    assert.equal(document.querySelector("strong").textContent, "Bold");
    assert.equal(document.querySelector("a").href, "https://example.com/");
    assert.equal(document.querySelectorAll("script,iframe,svg,form,input,[onerror],[style],[srcset],[target]").length, 0);
    assert.equal(document.querySelectorAll('a[href^="javascript:"]').length, 0);
  } finally { window.close(); }
});

test("password callbacks detect invitation, recovery and expired links without retaining tokens", () => {
  assert.equal(readAuthFlow("https://example.com/admin/?flow=invite#access_token=SECRET").flow, "");
  assert.ok(readAuthFlow("https://example.com/admin/#type=recovery&access_token=SECRET").error);
  const token = "a".repeat(64);
  assert.deepEqual(readAuthFlow(`https://example.com/admin/?type=recovery&token_hash=${token}`).callback, { type: "recovery", token_hash: token });
  assert.equal(readAuthFlow(`https://example.com/blog/?type=recovery&token_hash=${token}`).callback, null);
  assert.equal(readAuthFlow("https://example.com/admin/?flow=recovery").flow, "");
  assert.equal(readAuthFlow("https://example.com/admin/?flow=evil").flow, "");
  assert.ok(readAuthFlow("https://example.com/admin/#error=access_denied&error_code=otp_expired").error);
  assert.ok(passwordError("short", "short"));
  assert.ok(passwordError("long-password-1", "long-password-2"));
  assert.equal(passwordError("long-password-1", "long-password-1"), "");
});

test("uploads reject SVG, unsupported and oversized images", () => {
  assert.equal(blogImageExtension({ type: "image/jpeg", size: 100 }), ".jpg");
  assert.equal(blogImageError({ type: "image/jpeg", size: blogImageMaxBytes }), "");
  // Người viết phải biết ảnh nặng bao nhiêu và giới hạn là bao nhiêu, không chỉ "quá lớn".
  const tooBig = blogImageError({ type: "image/png", size: 8_700_000 });
  assert.match(tooBig, /8,3 MB/);
  assert.match(tooBig, /5 MB/);
  assert.equal(blogImageError({ type: "image/png", size: 0 }), "Tệp rỗng, không có dữ liệu ảnh.");
  assert.match(blogImageError({ type: "image/svg+xml", size: 100 }), /SVG/);
  assert.equal(blogImageError(undefined), blogImageError({ type: "text/html", size: 10 }));
  assert.deepEqual([formatBytes(900), formatBytes(2048), formatBytes(5 * 1024 * 1024)], ["900 B", "2 KB", "5,0 MB"]);
  for (const file of [{ type: "image/svg+xml", size: 100 }, { type: "text/html", size: 100 },
    { type: "image/png", size: 5242881 }, { type: "image/png", size: 0 }]) assert.throws(() => blogImageExtension(file));
});

test("frontend configuration rejects secret/service-role keys and accepts only public keys", () => {
  const jwt = (role) => `header.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.signature`;
  assert.equal(publicConfigError("", ""), "");
  assert.equal(publicConfigError("https://project.supabase.co", "sb_publishable_fixture"), "");
  assert.equal(publicConfigError("https://project.supabase.co", jwt("anon")), "");
  assert.ok(publicConfigError("https://project.supabase.co", "sb_secret_fixture"));
  assert.ok(publicConfigError("https://project.supabase.co", jwt("service_role")));
  assert.ok(publicConfigError("https://project.supabase.co", jwt("authenticated")));
  assert.ok(publicConfigError("https://project.supabase.co", ""));
  assert.ok(publicConfigError("http://public-host.invalid", "sb_publishable_fixture"));
});

function mockPublicClient(rows, failure = false) {
  const requests = [];
  const client = createClient("https://blog-test.invalid", "public-test-key", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async (input, options = {}) => {
      const url = new URL(input);
      requests.push({ url, authorization: new Headers(options.headers).get("authorization") });
      if (failure) return new Response(JSON.stringify({ message: "DB unavailable" }), { status: 503, headers: { "Content-Type": "application/json" } });
      let data;
      if (url.pathname.endsWith("public_article_authors")) data = [{ id: "writer", full_name: "Author Name" }];
      else {
        assert.equal(url.searchParams.get("status"), "eq.published");
        data = rows.filter((row) => row.status === "published" && (!row.publish_at || Date.parse(row.publish_at) <= Date.now()));
        const slug = url.searchParams.get("slug");
        if (slug) data = data.filter((row) => row.slug === slug.slice(3));
        const start = Number(url.searchParams.get("offset") || 0);
        const limit = Number(url.searchParams.get("limit") || data.length);
        data = data.slice(start, start + limit);
        const fields = (url.searchParams.get("select") || "").split(",");
        data = data.map((row) => Object.fromEntries(fields.filter((key) => key in row).map((key) => [key, row[key]])));
      }
      return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
    } },
  });
  return { client, requests };
}
const row = { id: "one", slug: "sapa-story", title: "Sapa Guide", status: "published", excerpt: "Visit Sapa",
  body: "## Published", created_at: "2026-01-01T00:00:00Z", publish_at: null, author_id: "writer", reading_minutes: 2,
  destinations: ["Sapa"], topics: ["Travel Tips"], cover_path: "writer/image.jpg", cover_alt: "Mountains", featured: true };

test("public queries omit draft/future, paginate and expose only public author name", async () => {
  const rows = Array.from({ length: 105 }, (_, index) => ({ ...row, id: `${index}`, slug: `story-${index}` }));
  const { client, requests } = mockPublicClient([...rows, { ...row, status: "draft" }, { ...row, publish_at: "2099-01-01T00:00:00Z" }]);
  const { articles } = await fetchPublicBlog(client, { imageUrl: (path) => `https://image.invalid/${path}` });
  assert.equal(articles.length, 105);
  assert.equal(articles[0].author, "Author Name");
  assert.equal(articles[0].readingMinutes, 2);
  assert.equal(articles[0].body, ""); // Feed không tải body; chỉ detail mới tải.
  assert.equal(requests.length, 3);
  assert.ok(requests.every((request) => request.authorization === "Bearer public-test-key"));
  assert.ok(requests.filter((request) => request.url.pathname.endsWith("articles")).every((request) => !request.url.searchParams.get("select").split(",").includes("body")));
  assert.equal(requests.some((request) => request.url.pathname.endsWith("profiles")), false);
});

test("public detail resolves published slug; draft/future/missing/invalid never appear", async () => {
  const { client, requests } = mockPublicClient([row, { ...row, slug: "draft-story", status: "draft" }, { ...row, slug: "future-story", publish_at: "2099-01-01T00:00:00Z" }]);
  assert.equal((await fetchPublicBlog(client, { slug: row.slug })).article.title, row.title);
  for (const slug of ["draft-story", "future-story", "missing-story", "../private"]) {
    assert.equal((await fetchPublicBlog(client, { slug })).article, null);
  }
  assert.equal(validBlogSlug("x".repeat(121)), false);
  assert.equal(requests.filter((request) => request.url.searchParams.get("slug")?.includes("../")).length, 0);
});

test("public failures are errors, not a misleading empty feed", async () => {
  const { client } = mockPublicClient([], true);
  await assert.rejects(fetchPublicBlog(client));
  assert.deepEqual((await fetchPublicBlog(null)).articles, []);
});

test("article normalization and combined search filters work", () => {
  const article = normalizePublicArticle(row);
  assert.equal(article.author, "Hoang Travel Team");
  assert.equal(filterBlogArticles([article], { destination: "Sapa", topic: "Travel Tips" }, "guide").length, 1);
  assert.equal(filterBlogArticles([article], { destination: "Ha Giang" }).length, 0);
});

const PASSWORD = "Qx7mRt2PvLd9KwNs";

function inviteFixture(overrides = {}) {
  const calls = [];
  const client = {
    rpc: async () => ({ data: overrides.limited ? false : true, error: overrides.limitError }),
    auth: {
      getUser: async (token) => { calls.push(["getUser", token]); return overrides.invalidToken ? { error: new Error("bad") } : { data: { user: { id: "caller", user_metadata: { role: "admin" } } } }; },
      admin: {
        createUser: async (options) => { calls.push(["create", options]); return { data: { user: { id: "created" } }, error: overrides.createError }; },
        updateUserById: async (id, patch) => { calls.push(["reset", id, patch]); return { data: { user: { id } }, error: overrides.resetError }; },
      },
    },
    from: () => {
      const query = {
        select: () => query, eq: () => query,
        maybeSingle: async () => ({ data: { role: overrides.role || "admin", active: overrides.active !== false }, error: overrides.profileError }),
        update: (patch) => { calls.push(["activate", patch]); return query; },
        single: async () => ({ data: { id: "created" }, error: overrides.activationError }),
      };
      return query;
    },
  };
  const serve = createInviteHandler({ client, allowedOrigins: "https://hoangluxury.travel,http://localhost:5173", logger: () => {} });
  const request = (body = { email: "Writer@Example.com", fullName: "Writer", role: "writer", password: PASSWORD }, headers = {}) => new Request("https://edge.invalid", {
    method: "POST", headers: { Origin: "http://localhost:5173", Authorization: "Bearer actual-jwt", "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return { serve, calls, request };
}

test("account creation rejects absent/invalid JWT, writers and inactive admins before touching Auth", async () => {
  for (const [overrides, headers, status] of [[{}, { Authorization: "" }, 401], [{ invalidToken: true }, {}, 401],
    [{ role: "writer" }, {}, 403], [{ active: false }, {}, 403], [{ profileError: new Error("DB") }, {}, 503]]) {
    const { serve, request, calls } = inviteFixture(overrides);
    assert.equal((await serve(request(undefined, headers))).status, status);
    assert.equal(calls.some(([name]) => name === "create" || name === "reset"), false);
  }
});

test("account allowlist, preflight and validation reject weak passwords and bad payloads", async () => {
  const { serve, request, calls } = inviteFixture();
  assert.equal((await serve(request(undefined, { Origin: "https://evil.invalid" }))).status, 403);
  assert.equal((await serve(new Request("https://edge.invalid", { method: "OPTIONS", headers: { Origin: "http://localhost:5173" } }))).status, 204);
  assert.equal((await serve(new Request("https://edge.invalid"))).status, 405);
  for (const body of ["broken json", { email: "ok@example.com", password: PASSWORD, role: "super-admin" },
    { email: "bad", password: PASSWORD }, { email: "ok@example.com" }, { email: "ok@example.com", password: "short" },
    { email: "ok@example.com", password: `bad ${PASSWORD}` }, { action: "reset", userId: "not-a-uuid", password: PASSWORD },
    "x".repeat(9000)]) {
    assert.ok([400, 413].includes((await serve(request(body))).status));
  }
  assert.equal(calls.some(([name]) => name === "create" || name === "reset"), false);
});

test("account creation verifies real JWT, confirms the email itself and assigns role in DB", async () => {
  const { serve, request, calls } = inviteFixture();
  const response = await serve(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "http://localhost:5173");
  assert.deepEqual(await response.json(), { ok: true, email: "writer@example.com" });
  assert.deepEqual(calls[0], ["getUser", "actual-jwt"]);
  assert.deepEqual(calls[1][1], { email: "writer@example.com", password: PASSWORD, email_confirm: true, user_metadata: { full_name: "Writer" } });
  assert.deepEqual(calls[2], ["activate", { full_name: "Writer", role: "writer", active: true }]);
});

test("password reset needs an admin and a real account id, and never creates a user", async () => {
  const id = "3f6b1c2d-4e5a-4b7c-8d9e-0a1b2c3d4e5f";
  const { serve, request, calls } = inviteFixture();
  const response = await serve(request({ action: "reset", userId: id, password: PASSWORD }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.deepEqual(calls[1], ["reset", id, { password: PASSWORD }]);
  assert.equal(calls.some(([name]) => name === "create"), false);

  for (const [overrides, status] of [[{ role: "writer" }, 403], [{ resetError: new Error("gone") }, 400]]) {
    const other = inviteFixture(overrides);
    assert.equal((await other.serve(other.request({ action: "reset", userId: id, password: PASSWORD }))).status, status);
  }
});

test("account creation does not report success for duplicate, rate limit or partial activation", async () => {
  for (const [overrides, status] of [[{ createError: { message: "already registered" } }, 409],
    [{ createError: { message: "rate limit", status: 429 } }, 429], [{ limited: true }, 429],
    [{ limitError: new Error("no rpc") }, 503], [{ activationError: new Error("DB") }, 500]]) {
    const { serve, request } = inviteFixture(overrides);
    const response = await serve(request());
    assert.equal(response.status, status);
    assert.equal((await response.json()).ok, false);
  }
});

test("public bundles have no Markdown glob and separate anonymous client is configured", async () => {
  for (const path of ["src/config/blog.js", "src/BlogArticlePage.jsx"]) {
    assert.equal((await readFile(new URL(`../${path}`, import.meta.url), "utf8")).includes("import.meta.glob"), false);
  }
  const source = await readFile(new URL("../src/lib/supabase.js", import.meta.url), "utf8");
  assert.match(source, /export const publicSupabase/);
  assert.match(source, /persistSession: false, autoRefreshToken: false, detectSessionInUrl: false/);
});
