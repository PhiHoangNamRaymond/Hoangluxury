const productionOrigins = "https://hoangluxury.travel,https://www.hoangluxury.travel";
const message = "Unable to process request. Please contact us via WhatsApp.";
const validEndpoint = (value) => /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(value || "");

export function browserName(agent = "") {
  if (/Edg(?:e|A|iOS)?\//i.test(agent)) return "Edge";
  if (/OPR\/|Opera|OPiOS\//i.test(agent)) return "Opera";
  if (/SamsungBrowser\//i.test(agent)) return "Samsung Internet";
  if (/Firefox\/|FxiOS\//i.test(agent)) return "Firefox";
  if (/Chrome\/|CriOS\//i.test(agent)) return "Chrome";
  if (/Safari\//i.test(agent) && /Version\//i.test(agent)) return "Safari";
  return "Unknown";
}
/* Log lỗi gửi form (tab Errors trong Sheet). Khách gặp lỗi có thể chưa có / đã hết
   mã Turnstile nên log không đòi CAPTCHA; bù lại chỉ nhận đúng các trường liệt kê,
   giá trị trong danh sách cố định, không có chữ tự do hay dữ liệu khách. Apps Script
   còn giới hạn số dòng mỗi giờ và gom email báo. */
const errorLogFields = ["form", "sourceForm", "category", "status", "device", "page", "occurredAt", "reportId"];
export function validErrorLog(data, now = Date.now()) {
  for (const key of data.keys()) if (!errorLogFields.includes(key)) return false;
  const occurred = Date.parse(data.get("occurredAt") || "");
  return ["booking", "feedback"].includes(data.get("sourceForm")) &&
    ["validation", "server", "network", "unknown"].includes(data.get("category")) &&
    /^(?:\d{3})?$/.test(data.get("status") ?? "") &&
    ["PC", "Mobile"].includes(data.get("device")) &&
    /^\/[A-Za-z0-9/_-]{0,199}$/.test(data.get("page") || "") &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(data.get("occurredAt") || "") &&
    occurred > now - 8 * 864e5 && occurred < now + 5 * 60e3 &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(data.get("reportId") || "");
}
const locationText = (value) => typeof value === "string" && value.length <= 120 && !/[\u0000-\u001f\u007f]/.test(value) ? value : "Unknown";

async function boundedText(response, max = 32768) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks = []; let size = 0;
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; reader.cancel().catch(() => {}); },5000);
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max) throw new Error("Body too large");
      chunks.push(value);
    }
    if (timedOut) throw new Error("Body timeout");
  } finally { clearTimeout(timer); await reader.cancel().catch(() => {}); }
  const bytes = new Uint8Array(size); let at = 0;
  for (const chunk of chunks) { bytes.set(chunk, at); at += chunk.length; }
  return new TextDecoder().decode(bytes);
}

export function createFormsHandler({ endpoint, proxySecret, turnstileSecret, allowedOrigins = productionOrigins, fetcher = fetch, visitorLocation }) {
  const origins = allowedOrigins.split(",").map((value) => value.trim()).filter(Boolean);
  // Vendor dummy keys are intentionally not accepted by a deployable proxy.
  const dummySecret = ["1x", "2x", "3x"].some((prefix) => turnstileSecret === prefix + "0".repeat(29) + "AA");
  const configured = validEndpoint(endpoint) && proxySecret?.length >= 32 && proxySecret.length <= 256 &&
    turnstileSecret && !dummySecret && origins.length && origins.every((value) => {
    try { const url = new URL(value); return url.origin === value && (url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))); } catch { return false; }
  });
  return async (request) => {
    const origin = request.headers.get("Origin");
    const permitted = origins.includes(origin);
    const headers = { "Content-Type": "application/json", "Cache-Control": "no-store", "Vary": "Origin",
      ...(permitted ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "content-type, apikey, x-client-info" } : {}) };
    const respond = (status, ok = false) => new Response(JSON.stringify(ok ? {ok:true} : {ok:false,error:message}), {status,headers});
    if (!permitted) return respond(403);
    if (request.method === "OPTIONS") return new Response(null,{status:204,headers});
    if (request.method !== "POST") return respond(405);
    if (!configured) return respond(503);
    if (!/^application\/x-www-form-urlencoded(?:;|$)/i.test(request.headers.get("Content-Type") || "")) return respond(415);
    try {
      const body = await boundedText(request);
      const data = new URLSearchParams(body);
      for (const key of data.keys()) if (data.getAll(key).length !== 1) return respond(400);
      const form = data.get("form") || "booking";
      if (form === "error-log") {
        if (!validErrorLog(data)) return respond(400);
        data.set("browser", browserName(request.headers.get("User-Agent") || ""));
        data.set("proxySecret", proxySecret);
        const logged = await fetcher(endpoint,{method:"POST",body:data,signal:AbortSignal.timeout(15000),redirect:"follow"});
        if (!logged.ok) return respond(503);
        return JSON.parse(await boundedText(logged,2048)).ok === true ? respond(200,true) : respond(400);
      }
      const token = data.get("turnstileToken") || "";
      if (!["booking","feedback"].includes(form) || !token || token.length > 2048 || data.has("proxySecret") ||
          !/^[a-f0-9-]{36}$/.test(data.get("requestId") || "")) return respond(400);
      const check = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method:"POST", body:new URLSearchParams({secret:turnstileSecret,response:token}), signal:AbortSignal.timeout(10000),
      });
      if (!check.ok) return respond(503);
      const result = JSON.parse(await boundedText(check,4096));
      if (result.success !== true || result.action !== form || result.hostname !== new URL(origin).hostname) return respond(400);
      data.delete("turnstileToken");
      // Never accept browser-supplied location or browser labels as authoritative.
      for (const key of ["browser", "ipCity", "ipRegion", "ipCountry", "locationSource"]) data.delete(key);
      if (form === "booking") {
        const geo = visitorLocation?.(request) || {};
        data.set("browser", browserName(request.headers.get("User-Agent") || ""));
        data.set("ipCity", locationText(geo.city));
        data.set("ipRegion", locationText(geo.region));
        data.set("ipCountry", locationText(geo.country));
        data.set("locationSource", geo.source === "Cloudflare IP estimate" ? geo.source : "Unavailable");
      }
      data.set("proxySecret",proxySecret);
      const upstream = await fetcher(endpoint,{method:"POST",body:data,signal:AbortSignal.timeout(15000),redirect:"follow"});
      if (!upstream.ok) return respond(503);
      const saved = JSON.parse(await boundedText(upstream,2048));
      return saved.ok === true ? respond(200,true) : respond(400);
    } catch { return respond(503); }
  };
}

if (typeof Deno !== "undefined") {
  Deno.serve(createFormsHandler({
    endpoint:Deno.env.get("GOOGLE_FORMS_ENDPOINT"), proxySecret:Deno.env.get("FORMS_PROXY_SECRET"),
    turnstileSecret:Deno.env.get("TURNSTILE_SECRET_KEY"), allowedOrigins:Deno.env.get("FORMS_ALLOWED_ORIGINS") || productionOrigins,
  }));
}
