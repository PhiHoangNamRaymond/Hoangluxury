// Adapter tùy chọn cho Vercel; Hostinger dùng Supabase Edge Function trực tiếp.
import { createClient } from "@supabase/supabase-js";
import { createInviteHandler } from "../supabase/functions/invite-writer/index.js";

export default async function handler(request, response) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.BLOG_SERVER_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  const serve = createInviteHandler({ client, allowedOrigins: process.env.BLOG_ALLOWED_ORIGINS || "https://hoangluxury.travel,https://www.hoangluxury.travel,http://localhost:5173,http://127.0.0.1:5173" });
  const method = request.method || "GET";
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (value) headers.set(name, Array.isArray(value) ? value.join(",") : value);
  }
  const result = await serve(new Request("https://hoangluxury.travel/api/invite-writer", {
    method, headers, ...(["GET", "HEAD"].includes(method) ? {} : { body: typeof request.body === "string" ? request.body : JSON.stringify(request.body || {}) }),
  }));
  response.status(result.status);
  result.headers.forEach((value, name) => response.setHeader(name, value));
  response.end(await result.text());
}
