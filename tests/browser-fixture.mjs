// Manual browser fixture: localhost/in-memory only, never live Supabase/email.
// node tests/browser-fixture.mjs ; Ctrl+C stops and discards all test data.
import { createServer as createHttpServer } from "node:http";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "node:url";
import { createInviteHandler } from "../supabase/functions/invite-writer/index.js";

const origin = "http://127.0.0.1:5187";
const api = "http://127.0.0.1:5188";
const password = "Test-only-password-123!";
const people = [
  { id: "00000000-0000-0000-0000-000000000001", email: "admin@example.invalid", full_name: "Test Admin", role: "admin", active: true },
  { id: "00000000-0000-0000-0000-000000000002", email: "writer@example.invalid", full_name: "Test Writer", role: "writer", active: true },
];
const passwords = new Map(people.map((person) => [person.id, password]));
const tokens = new Map();
function session(person) {
  const payload = { sub: person.id, aud: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600 };
  const token = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url")}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.test-signature`;
  tokens.set(token, person);
  return { access_token: token, refresh_token: `fixture-refresh-${person.id}`, token_type: "bearer", expires_in: 3600,
    expires_at: payload.exp, user: { id: person.id, email: person.email, aud: "authenticated", role: "authenticated", user_metadata: { full_name: person.full_name }, app_metadata: {} } };
}
const rows = [
  { id: "10000000-0000-0000-0000-000000000001", slug: "fixture-sapa-guide", title: "Fixture Sapa Guide", excerpt: "A test article, not real travel content.", body: "## Safe content\n\n**Comfortable journeys.**\n\n<a href=\"javascript:alert(1)\">Unsafe link</a><script>alert(2)</script>", destinations: ["Sapa"], topics: ["Travel Tips"], featured: true, status: "published", publish_at: null },
  { id: "10000000-0000-0000-0000-000000000002", slug: "fixture-draft", title: "Fixture Private Draft", excerpt: "Must not appear in public.", body: "Private body", destinations: [], topics: [], featured: false, status: "draft", publish_at: null },
  { id: "10000000-0000-0000-0000-000000000003", slug: "fixture-future", title: "Fixture Future", excerpt: "Not due yet.", body: "Scheduled", destinations: [], topics: [], featured: false, status: "published", publish_at: "2099-01-01T00:00:00Z" },
].map((row) => ({ ...row, author_id: people[0].id, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z", cover_path: "", cover_alt: "", reading_minutes: 1 }));
const isLive = (row) => row.status === "published" && (!row.publish_at || Date.parse(row.publish_at) <= Date.now());
const fakeAdmin = {
  rpc: async () => ({ data: true }), // Real limiter is covered by PostgreSQL tests.
  auth: { getUser: async (token) => ({ data: { user: tokens.has(token) ? session(tokens.get(token)).user : null } }),
    admin: { inviteUserByEmail: async (email, options) => {
      if (people.some((person) => person.email === email)) return { error: { message: "already registered" } };
      const person = { id: crypto.randomUUID(), email, full_name: options.data.full_name, role: "writer", active: false };
      people.push(person);
      passwords.set(person.id, password);
      return { data: { user: { id: person.id } } };
    } } },
  from: () => {
    let id; let patch;
    const query = { select: () => query, eq: (_, value) => { id = value; return query; },
      update: (value) => { patch = value; return query; },
      maybeSingle: async () => ({ data: people.find((person) => person.id === id) }),
      single: async () => { const person = people.find((item) => item.id === id); Object.assign(person, patch); return { data: { id } }; } };
    return query;
  },
};
const invite = createInviteHandler({ client: fakeAdmin, allowedOrigins: origin });
const mock = createHttpServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Access-Control-Allow-Headers", request.headers["access-control-request-headers"] || "authorization,apikey,content-type,x-client-info,prefer,accept,range,range-unit,x-supabase-api-version");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  response.setHeader("Content-Type", "application/json");
  if (request.method === "OPTIONS") { response.writeHead(204); response.end(); return; }
  const url = new URL(request.url, api);
  const text = (await Array.fromAsync(request)).map((chunk) => chunk.toString()).join("");
  const body = text ? JSON.parse(text) : {};
  const current = tokens.get(String(request.headers.authorization || "").replace(/^Bearer /, ""));
  const json = (value, status = 200) => { response.writeHead(status); response.end(status === 204 ? undefined : JSON.stringify(value)); };
  if (url.pathname === "/auth/v1/token") {
    const person = people.find((item) => item.email === body.email) || people.find((item) => `fixture-refresh-${item.id}` === body.refresh_token);
    if (!person || (body.password && body.password !== passwords.get(person.id))) return json({ message: "Invalid login credentials", error_code: "invalid_credentials" }, 400);
    return json(session(person));
  }
  if (url.pathname === "/auth/v1/user") {
    if (!current) return json({ message: "invalid session" }, 401);
    if (request.method === "PUT" && body.password) passwords.set(current.id, body.password);
    return json(session(current).user);
  }
  if (url.pathname === "/auth/v1/logout") return json(null, 204);
  if (url.pathname === "/auth/v1/recover") return json({});
  if (url.pathname === "/functions/v1/invite-writer") {
    const result = await invite(new Request(`${api}${url.pathname}`, { method: request.method, headers: request.headers, body: text }));
    response.writeHead(result.status); response.end(await result.text()); return;
  }
  if (url.pathname === "/rest/v1/rpc/public_article_authors") return json(people.filter((person) => rows.some((row) => row.author_id === person.id && isLive(row))).map(({ id, full_name }) => ({ id, full_name })));
  if (url.pathname.startsWith("/rest/v1/")) {
    const profiles = url.pathname.endsWith("profiles");
    if (profiles && !current) return json({ message: "denied" }, 403);
    const table = profiles ? people : rows;
    const mayWrite = current?.active && (current.role === "admin" || !profiles);
    const allowed = (row) => profiles ? row.id === current.id || current.role === "admin"
      : isLive(row) || row.author_id === current?.id || current?.role === "admin";
    let selected = table.filter(allowed);
    for (const [field, value] of url.searchParams) {
      if (value.startsWith("eq.")) selected = selected.filter((row) => String(row[field]) === value.slice(3));
    }
    if (["POST", "PATCH", "DELETE"].includes(request.method)) {
      if (!mayWrite) return json({ message: "denied" }, 403);
      if (request.method === "POST") {
        const next = { ...body, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), reading_minutes: 1 };
        if (next.author_id !== current.id) return json({ message: "denied" }, 403);
        table.push(next); selected = [next];
      } else {
        selected = selected.filter((row) => current.role === "admin" || row.author_id === current.id);
        if (request.method === "PATCH") selected.forEach((row) => Object.assign(row, body));
        else selected.forEach((row) => table.splice(table.indexOf(row), 1));
      }
    }
    const offset = Number(url.searchParams.get("offset") || 0);
    selected = selected.slice(offset, offset + Number(url.searchParams.get("limit") || 1000));
    const fields = (url.searchParams.get("select") || "*").split(",");
    const result = selected.map((row) => {
      const projected = fields.includes("*") ? { ...row } : Object.fromEntries(fields.filter((key) => key in row).map((key) => [key, row[key]]));
      if (!profiles && fields.some((field) => field.startsWith("profiles!"))) projected.profiles = people.find((person) => person.id === row.author_id);
      return projected;
    });
    return json(String(request.headers.accept).includes("vnd.pgrst.object") ? result[0] : result);
  }
  return json({ message: "Unknown fixture endpoint" }, 404);
});
await new Promise((resolve) => mock.listen(5188, "127.0.0.1", resolve));
// Scope overrides to this process only. Real env files remain untouched.
process.env.VITE_SUPABASE_URL = api;
process.env.VITE_SUPABASE_ANON_KEY = "sb_publishable_fixture_only";
const vite = await createViteServer({ root: fileURLToPath(new URL("..", import.meta.url)), server: { host: "127.0.0.1", port: 5187, strictPort: true } });
await vite.listen();
console.log(`Offline browser fixture: ${origin}/blog/ and ${origin}/admin/`);
console.log("Test login only: admin@example.invalid / Test-only-password-123!");
const stop = async () => { await vite.close(); mock.close(); process.exit(0); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
