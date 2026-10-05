const productionOrigins = "https://hoangluxury.travel,https://www.hoangluxury.travel";
const message = "Unable to process request. Please contact us via WhatsApp.";
const validEndpoint = (value) => /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(value || "");

async function boundedText(response, max = 32768) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks = []; let size = 0;
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; reader.cancel().catch(() => {}); },5000);
  timer.unref?.();
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

export function createFormsHandler({ endpoint, proxySecret, turnstileSecret, allowedOrigins = productionOrigins, fetcher = fetch }) {
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
