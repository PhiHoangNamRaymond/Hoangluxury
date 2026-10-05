import { validFormsProxy } from "./forms.js";
// Configuration guard, not a substitute for RLS or JWT signature verification.
export function publicConfigError(url, key) {
  if (!url && !key) return "";
  if (!url || !key) return "Cần khai báo đủ VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.";
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== "/") throw new Error();
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) throw new Error();
  } catch { return "Supabase Project URL không hợp lệ; dùng HTTPS hoặc localhost để test."; }
  if (key.startsWith("sb_publishable_")) return "";
  if (!key.startsWith("sb_secret_")) {
    try {
      const part = key.split(".")[1].replaceAll("-", "+").replaceAll("_", "/");
      if (JSON.parse(atob(part)).role === "anon") return "";
    } catch { /* Không in giá trị khóa trong lỗi/log. */ }
  }
  return "Frontend chỉ nhận publishable key hoặc JWT anon. Không dùng secret/service-role/user token trong VITE_SUPABASE_ANON_KEY.";
}

export function validFormsEndpoint(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "script.google.com" &&
      !url.username && !url.password && !url.port && !url.search && !url.hash &&
      /^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname);
  } catch { return false; }
}

export function safeCatalogUrl(value, fallback) {
  if (!value) return fallback;
  if (/^\/(?!\/)/.test(value) && !/[\\\u0000-\u0020]/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password) return url.href;
  } catch { /* Unsafe configuration never becomes a clickable link. */ }
  return fallback;
}

export function formTextError(data) {
  const limits = { fullName:160, country:120, phone:24, pickup:500, dropoff:500,
    luggage:300, flight:40, flightTimeZone:40, requirements:4000, bookingId:100,
    feedback:4000, experience:4000 };
  for (const [field, limit] of Object.entries(limits)) {
    if (data[field] != null && (String(data[field]).length > limit ||
        /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(String(data[field])))) {
      return `Please shorten or check ${field} (maximum ${limit} characters).`;
    }
  }
  return "";
}

// All VITE_* values become public. This catches known server keys, not every
// possible secret: still run a secret scanner before publishing Git history.
export function publicEnvError(env) {
  for (const [name, value] of Object.entries(env)) {
    if (!name.startsWith("VITE_") || !value) continue;
    const text = String(value);
    let serverKey = /sb_secret_[A-Za-z0-9_-]+/.test(text);
    for (const jwt of text.matchAll(/eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)) {
      try { serverKey ||= JSON.parse(atob(jwt[1].replaceAll("-", "+").replaceAll("_", "/"))).role === "service_role"; } catch { /* not a JWT */ }
    }
    if (serverKey || /(?:SECRET|SERVICE_ROLE|PASSWORD|PRIVATE_KEY)/i.test(name)) return "Có biến VITE_ chứa khóa server hoặc thông tin riêng tư. Không thể build frontend.";
  }
  const endpoint = env.VITE_BOOKING_SHEET_ENDPOINT?.trim();
  if (endpoint && !validFormsEndpoint(endpoint)) return "Booking endpoint phải là Google Apps Script HTTPS Web App /exec.";
  if (env.VITE_FORMS_PROXY_URL && !validFormsProxy(env.VITE_FORMS_PROXY_URL.trim())) return "Forms proxy phải là Supabase HTTPS function forms-proxy.";
  if (env.VITE_CATALOG_URL && safeCatalogUrl(env.VITE_CATALOG_URL, "") === "") return "Catalog URL phải là HTTPS hoặc đường dẫn nội bộ.";
  return "";
}
