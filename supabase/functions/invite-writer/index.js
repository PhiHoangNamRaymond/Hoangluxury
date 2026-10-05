// Một file duy nhất: có thể dán toàn bộ vào index.ts của Dashboard editor.
// verify_jwt=false ở gateway KHÔNG bỏ xác thực: mỗi POST được getUser(token)
// kiểm tra và tra role/active từ DB trước khi dùng khóa server.
// Hai việc: action "create" tạo tài khoản mới, action "reset" đặt lại mật khẩu.
// Không gửi email nào — admin tự chuyển mật khẩu cho người viết.
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createInviteHandler({ client, allowedOrigins, logger = (event) => console.info(JSON.stringify(event)) }) {
  const origins = String(allowedOrigins || "").split(",").map((value) => value.trim()).filter((value) => {
    try {
      const url = new URL(value);
      return url.origin === value && (url.protocol === "https:" ||
        (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)));
    } catch { return false; }
  });
  return async (request) => {
    const requestId = crypto.randomUUID();
    let actorId = null;
    const origin = request.headers.get("origin");
    const headers = { "Content-Type": "application/json", "Cache-Control": "no-store", Vary: "Origin",
      "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-retry-count, traceparent, tracestate, baggage" };
    if (origin && origins.includes(origin)) headers["Access-Control-Allow-Origin"] = origin;
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Request-ID"] = requestId;
    const reply = (status, body) => {
      // No email, name, password, bearer token, request body or raw exception in logs.
      try { logger({ event: "blog_account", request_id: requestId, actor_id: actorId, status }); } catch { /* logs must not break the response */ }
      return new Response(JSON.stringify(body), { status, headers });
    };
    if (origin && !origins.includes(origin)) return reply(403, { ok: false, error: "Tên miền gọi API chưa được cho phép." });
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return reply(405, { ok: false, error: "Method not allowed" });
    if (!client || !origins.length) return reply(503, { ok: false, error: "Chức năng quản lý tài khoản chưa được cấu hình trên server." });
    const match = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i);
    if (!match) return reply(401, { ok: false, error: "Chưa đăng nhập." });
    try {
      const { data, error } = await client.auth.getUser(match[1]);
      if (error || !data?.user) return reply(401, { ok: false, error: "Phiên đăng nhập không hợp lệ." });
      actorId = data.user.id;
      const { data: profile, error: profileError } = await client.from("profiles").select("role, active").eq("id", data.user.id).maybeSingle();
      if (profileError) return reply(503, { ok: false, error: "Không kiểm tra được quyền. Hãy thử lại." });
      if (profile?.role !== "admin" || !profile.active) return reply(403, { ok: false, error: "Chỉ admin đang hoạt động mới quản lý được tài khoản." });
      if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
        return reply(415, { ok: false, error: "API chỉ nhận application/json." });
      }
      const reader = request.body?.getReader();
      let bytes = 0;
      let chunks = [];
      let timer;
      const deadline = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("body_timeout")), 5000); });
      try { if (reader) {
        while (true) {
          const { done, value } = await Promise.race([reader.read(), deadline]);
          if (done) break;
          bytes += value.byteLength;
          if (bytes > 8192) { void reader.cancel().catch(() => {}); return reply(413, { ok: false, error: "Dữ liệu quá lớn." }); }
          chunks.push(value);
        }
      } } catch {
        void reader?.cancel().catch(() => {});
        return reply(408, { ok: false, error: "Hết thời gian nhận dữ liệu." });
      } finally { clearTimeout(timer); }
      const buffer = new Uint8Array(bytes);
      let offset = 0;
      for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
      let body;
      try { body = JSON.parse(new TextDecoder().decode(buffer)); }
      catch { return reply(400, { ok: false, error: "JSON không hợp lệ." }); }

      // Mật khẩu do admin đặt, đi thẳng vào Auth; server không lưu lại ở đâu khác.
      const password = typeof body?.password === "string" ? body.password : "";
      if (password.length < 15 || password.length > 128 || CONTROL_CHARS.test(password)) {
        return reply(400, { ok: false, error: "Mật khẩu cần 15–128 ký tự và không chứa ký tự điều khiển." });
      }

      if (body?.action === "reset") {
        const userId = typeof body?.userId === "string" ? body.userId : "";
        if (!UUID.test(userId)) return reply(400, { ok: false, error: "Thiếu tài khoản cần đặt lại mật khẩu." });
        const { error: resetError } = await client.auth.admin.updateUserById(userId, { password });
        if (resetError) return reply(400, { ok: false, error: "Không đặt lại được mật khẩu. Kiểm tra tài khoản còn tồn tại trong Auth users." });
        return reply(200, { ok: true });
      }

      const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
      const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
      const role = body?.role || "writer";
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || fullName.length > 160 || !["writer", "admin"].includes(role)) {
        return reply(400, { ok: false, error: "Email, họ tên hoặc vai trò không hợp lệ." });
      }
      const { data: permitted, error: limitError } = await client.rpc("consume_blog_invite", { actor: actorId });
      if (limitError) return reply(503, { ok: false, error: "Chưa thiết lập giới hạn bảo mật. Chạy migration 04 rồi thử lại." });
      if (permitted !== true) return reply(429, { ok: false, error: "Đã đạt giới hạn tạo tài khoản. Thử lại sau một giờ." });
      // email_confirm: tài khoản dùng được ngay, Supabase không gửi thư xác nhận nào.
      const { data: created, error: createError } = await client.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { full_name: fullName },
      });
      if (createError) {
        const already = /already|registered|exists/i.test(createError.message);
        return reply(already ? 409 : createError.status === 429 ? 429 : 400, {
          ok: false, error: already ? "Email này đã có tài khoản. Dùng nút đặt lại mật khẩu thay vì tạo mới."
            : "Không tạo được tài khoản. Kiểm tra Auth logs trong Supabase.",
        });
      }
      if (!created?.user?.id) return reply(500, { ok: false, error: "Không nhận được ID tài khoản vừa tạo." });
      const { error: activationError } = await client.from("profiles").update({ full_name: fullName, role, active: true })
        .eq("id", created.user.id).select("id").single();
      if (activationError) return reply(500, { ok: false,
        error: "Đã tạo tài khoản nhưng chưa gán được quyền. Admin cần kiểm tra tài khoản trong Supabase; không tạo lại liên tục." });
      return reply(200, { ok: true, email });
    } catch {
      return reply(500, { ok: false, error: "Không hoàn tất được thao tác. Kiểm tra Function logs và Auth users trước khi thử lại." });
    }
  };
}

// Deno/Supabase runtime. Nhánh này không chạy khi Node import để kiểm thử.
if (typeof Deno !== "undefined") {
  const { createClient } = await import("npm:@supabase/supabase-js@2.117.2");
  const key = Deno.env.get("BLOG_SERVER_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const url = Deno.env.get("SUPABASE_URL");
  const client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  Deno.serve(createInviteHandler({ client, allowedOrigins: Deno.env.get("BLOG_ALLOWED_ORIGINS") || "https://hoangluxury.travel,https://www.hoangluxury.travel" }));
}
