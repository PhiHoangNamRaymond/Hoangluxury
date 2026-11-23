/* Data Layer cho nút WhatsApp (yêu cầu marketing 23/11/2026).
   Mỗi lượt nhấn một link WhatsApp phát đúng một sự kiện hlt_whatsapp_click vào
   window.dataLayer, đủ 6 trường; trường không áp dụng là null (ghi đè giá trị
   của sự kiện trước trong bộ nhớ GTM).

   Một listener duy nhất ở document (pha capture) bắt mọi link WhatsApp, nên không
   phát trùng khi nút lồng trong phần tử khác và không phát khi chỉ render. Link
   vẫn mở WhatsApp như cũ (không preventDefault); push chạy đồng bộ trước khi
   trình duyệt điều hướng.

   Nhãn trên từng nút (thêm bằng waCta(), không đổi class CSS):
     data-hlt-wa-location  khu vực: header, hero, pricing, route_card, …
     data-hlt-wa-id        mã nút ổn định, ví dụ whatsapp_route_pricing
     data-hlt-wa-service   (tuỳ chọn, đặt được ở phần tử cha) dịch vụ; "none" = null
     data-hlt-wa-route     (tuỳ chọn, đặt được ở phần tử cha) mã tuyến; "none" = null
     data-hlt-wa-text      (tuỳ chọn) chữ thay cho nút chỉ có ảnh (mã QR)
   Link WhatsApp chưa gắn nhãn (ví dụ link trong bài blog) vẫn được ghi nhận với
   khu vực suy ra từ <header>/<footer>, còn lại là "content".

   Không bao giờ gửi URL WhatsApp, nội dung tin nhắn hay dữ liệu khách nhập. */

export const WHATSAPP_EVENT = "hlt_whatsapp_click";

const NONE = "none";

/* Thuộc tính tracking cho một nút: <a {...waCta("pricing", "whatsapp_route_pricing")}>.
   service / route: null = không áp dụng; bỏ trống = lấy theo trang. */
export function waCta(location, id, { service, route, text } = {}) {
  return {
    "data-hlt-wa-location": location,
    "data-hlt-wa-id": id,
    ...(service !== undefined && { "data-hlt-wa-service": service ?? NONE }),
    ...(route !== undefined && { "data-hlt-wa-route": route ?? NONE }),
    ...(text && { "data-hlt-wa-text": text }),
  };
}

/* Mã tuyến từ khoá tuyến trong journeys.js: "sapa" → "hanoi_to_sapa",
   "sapa-to-ha-long" → "sapa_to_ha_long". */
export function routeIdFromJourneyKey(key) {
  if (!key) return null;
  const slug = String(key).toLowerCase();
  return (slug.includes("-to-") ? slug : `hanoi-to-${slug}`).replace(/[^a-z0-9]+/g, "_");
}

/* Link mở WhatsApp: wa.me, api/web.whatsapp.com, whatsapp://. */
export function isWhatsAppHref(href) {
  if (!href) return false;
  if (/^whatsapp:/i.test(href)) return true;
  try {
    const { hostname } = new URL(href, "https://hoangluxury.travel");
    return /^(?:wa\.me|(?:api|web|www)\.whatsapp\.com|whatsapp\.com)$/i.test(hostname);
  } catch {
    return false;
  }
}

const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim().slice(0, 100) || null;
const readAttr = (node, name) => node?.closest?.(`[${name}]`)?.getAttribute(name);
const valueOrNull = (value, fallback) => (value === undefined || value === null ? fallback : value === NONE || value === "" ? null : value);

/* Dữ liệu sự kiện cho một link WhatsApp vừa được nhấn. */
export function buildWhatsAppEvent(anchor, context = {}) {
  const location = anchor.getAttribute("data-hlt-wa-location")
    || (anchor.closest("footer") ? "footer" : anchor.closest("header") ? "header" : "content");
  const service = readAttr(anchor, "data-hlt-wa-service");
  const route = readAttr(anchor, "data-hlt-wa-route");
  return {
    event: WHATSAPP_EVENT,
    page_type: context.pageType || null,
    service_type: valueOrNull(service ?? undefined, context.serviceType ?? null),
    route_id: valueOrNull(route ?? undefined, context.routeId ?? null),
    cta_location: location,
    cta_id: anchor.getAttribute("data-hlt-wa-id") || `whatsapp_${location}`,
    // innerText theo chữ đang hiển thị (kể cả text-transform: uppercase).
    cta_text: cleanText(anchor.getAttribute("data-hlt-wa-text") || anchor.innerText || anchor.textContent),
  };
}

/* Gắn listener một lần cho cả trang. context: { pageType, serviceType, routeId }
   do main.jsx tính từ đường dẫn (mỗi trang là một lần tải mới, nên route_id của
   trang trước không bị giữ lại). */
export function setupWhatsAppTracking(context, win = window) {
  const doc = win.document;
  if (!doc || win.__hltWhatsAppTracking) {
    if (win.__hltWhatsAppTracking) win.__hltWhatsAppTracking.context = context;
    return false;
  }
  const state = { context };
  win.__hltWhatsAppTracking = state;

  const onActivate = (event) => {
    // auxclick: chỉ nút giữa (mở tab mới); click phải không mở WhatsApp.
    if (event.type === "auxclick" && event.button !== 1) return;
    const anchor = event.target?.closest?.("a[href]");
    if (!anchor || !isWhatsAppHref(anchor.getAttribute("href"))) return;
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push(buildWhatsAppEvent(anchor, state.context));
  };
  doc.addEventListener("click", onActivate, true);
  doc.addEventListener("auxclick", onActivate, true);
  return true;
}
