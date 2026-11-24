/* Data Layer cho các nút chuyển đổi (yêu cầu marketing):
     H1-01 hlt_whatsapp_click      mọi link mở WhatsApp (23/11/2026)
     H1-02 hlt_booking_form_click  mọi link dẫn tới Booking Form /booking/ (24/11/2026)
     H1-06 hlt_catalog_click       mọi link dẫn tới trang Catalog /catalog/ (24/11/2026)

   Một listener duy nhất ở document (pha capture) bắt cả ba loại link, nên một lượt
   nhấn chỉ phát đúng một sự kiện, không phát khi render/tải trang, và chạy trước
   mọi xử lý click khác. Không preventDefault: link vẫn mở WhatsApp / chuyển sang
   /booking/, /catalog/ như cũ; push chạy đồng bộ trước khi trình duyệt điều hướng.

   Nhãn trên từng nút (thêm bằng waCta() / bookingCta(), không đổi class CSS):
     data-hlt-cta-location  khu vực: header, hero, pricing, route_card, bottom_cta, …
     data-hlt-cta-id        mã nút ổn định, ví dụ whatsapp_route_pricing, booking_route_pricing
     data-hlt-cta-service   (tuỳ chọn, WhatsApp / Catalog) dịch vụ; "none" = null
     data-hlt-cta-route     (tuỳ chọn, đặt được ở phần tử cha) mã tuyến; "none" = null
     data-hlt-cta-text      (tuỳ chọn) chữ thay cho nút chỉ có ảnh (mã QR)
   Link chưa gắn nhãn (ví dụ link trong bài blog) vẫn được ghi nhận với khu vực suy
   ra từ <header>/<footer>, còn lại là "content".

   Trường không áp dụng luôn là null. Không bao giờ gửi URL, nội dung tin nhắn hay
   dữ liệu khách nhập. */

export const WHATSAPP_EVENT = "hlt_whatsapp_click";
export const BOOKING_EVENT = "hlt_booking_form_click";
export const CATALOG_EVENT = "hlt_catalog_click";

const NONE = "none";

function ctaAttributes(location, id, { service, route, text } = {}) {
  return {
    "data-hlt-cta-location": location,
    "data-hlt-cta-id": id,
    ...(service !== undefined && { "data-hlt-cta-service": service ?? NONE }),
    ...(route !== undefined && { "data-hlt-cta-route": route ?? NONE }),
    ...(text && { "data-hlt-cta-text": text }),
  };
}

/* Nút WhatsApp: <a {...waCta("pricing", "whatsapp_route_pricing")}>.
   service / route: null = không áp dụng; bỏ trống = lấy theo trang. */
export const waCta = ctaAttributes;

/* Nút dẫn tới Booking Form: <a href="/booking/" {...bookingCta("pricing", "booking_route_pricing")}>.
   route: null = nút Booking chung; bỏ trống = tuyến của trang (nếu có). */
export const bookingCta = (location, id, { route, text } = {}) => ctaAttributes(location, id, { route, text });

/* Nút dẫn tới trang Catalog: <a href="/catalog/" {...catalogCta("hero", "catalog_home_hero")}>.
   service / route: null = không áp dụng; bỏ trống = lấy theo trang. */
export const catalogCta = ctaAttributes;

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

/* Link tới trang Booking Form của site (cùng tên miền, /booking hoặc /booking/,
   kể cả có ?src=… hay #…). */
const isSitePath = (pattern) => (href, base = "https://hoangluxury.travel/") => {
  if (!href) return false;
  try {
    const url = new URL(href, base);
    return url.origin === new URL(base).origin && pattern.test(url.pathname);
  } catch {
    return false;
  }
};
export const isBookingHref = isSitePath(/^\/booking\/?$/i);

/* Link tới trang Catalog của site (/catalog hoặc /catalog/). Link Google Drive / PDF
   bên trong trang Catalog là tên miền khác nên không tính (thuộc H2-11). */
export const isCatalogHref = isSitePath(/^\/catalog\/?$/i);

const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim().slice(0, 100) || null;
const readAttr = (node, name) => node?.closest?.(`[${name}]`)?.getAttribute(name);
const valueOrNull = (value, fallback) => (value === undefined || value === null ? fallback : value === NONE || value === "" ? null : value);

function ctaBase(anchor, prefix) {
  const location = anchor.getAttribute("data-hlt-cta-location")
    || (anchor.closest("footer") ? "footer" : anchor.closest("header") ? "header" : "content");
  return {
    location,
    tagged: anchor.hasAttribute("data-hlt-cta-id"),
    cta_id: anchor.getAttribute("data-hlt-cta-id") || `${prefix}_${location}`,
    // innerText theo chữ đang hiển thị (kể cả text-transform: uppercase).
    cta_text: cleanText(anchor.getAttribute("data-hlt-cta-text") || anchor.innerText || anchor.textContent),
  };
}

/* H1-01: dữ liệu sự kiện cho một link WhatsApp vừa được nhấn (6 trường). */
export function buildWhatsAppEvent(anchor, context = {}) {
  const { location, cta_id, cta_text } = ctaBase(anchor, "whatsapp");
  return {
    event: WHATSAPP_EVENT,
    page_type: context.pageType || null,
    service_type: valueOrNull(readAttr(anchor, "data-hlt-cta-service") ?? undefined, context.serviceType ?? null),
    route_id: valueOrNull(readAttr(anchor, "data-hlt-cta-route") ?? undefined, context.routeId ?? null),
    cta_location: location,
    cta_id,
    cta_text,
  };
}

/* H1-02: dữ liệu sự kiện cho một link Booking vừa được nhấn (5 trường, không có
   service_type). Link Booking ở header/footer chưa gắn nhãn là nút chung: route null. */
export function buildBookingEvent(anchor, context = {}) {
  const { location, tagged, cta_id, cta_text } = ctaBase(anchor, "booking");
  const generic = !tagged && (location === "header" || location === "footer");
  return {
    event: BOOKING_EVENT,
    page_type: context.pageType || null,
    route_id: valueOrNull(readAttr(anchor, "data-hlt-cta-route") ?? undefined, generic ? null : context.routeId ?? null),
    cta_location: location,
    cta_id,
    cta_text,
  };
}

/* H1-06: dữ liệu sự kiện cho một link Catalog vừa được nhấn (6 trường như H1-01).
   service_type theo dịch vụ của trang (context.pageServiceType: trang chủ, About…
   không gắn dịch vụ là null). Link Catalog ở header/menu/footer chưa gắn nhãn là nút
   chung nhưng vẫn mang trang xuất phát: route_id theo trang (null nếu không phải tuyến). */
export function buildCatalogEvent(anchor, context = {}) {
  const { location, cta_id, cta_text } = ctaBase(anchor, "catalog");
  return {
    event: CATALOG_EVENT,
    page_type: context.pageType || null,
    service_type: valueOrNull(readAttr(anchor, "data-hlt-cta-service") ?? undefined, context.pageServiceType ?? null),
    route_id: valueOrNull(readAttr(anchor, "data-hlt-cta-route") ?? undefined, context.routeId ?? null),
    cta_location: location,
    cta_id,
    cta_text,
  };
}

/* Gắn listener một lần cho cả trang. context: { pageType, serviceType, routeId }
   do main.jsx tính từ đường dẫn (mỗi trang là một lần tải mới, nên route_id của
   trang trước không bị giữ lại). */
export function setupCtaTracking(context, win = window) {
  const doc = win.document;
  if (!doc) return false;
  if (win.__hltCtaTracking) {
    win.__hltCtaTracking.context = context;
    return false;
  }
  const state = { context };
  win.__hltCtaTracking = state;

  const onActivate = (event) => {
    // auxclick: chỉ nút giữa (mở tab mới); click phải không điều hướng.
    if (event.type === "auxclick" && event.button !== 1) return;
    const anchor = event.target?.closest?.("a[href]");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    let payload = null;
    if (isWhatsAppHref(href)) payload = buildWhatsAppEvent(anchor, state.context);
    // Đang ở chính trang Booking thì link Booking chỉ tải lại trang: không tính.
    else if (state.context?.pageType !== "booking" && isBookingHref(href, win.location.href)) payload = buildBookingEvent(anchor, state.context);
    // Đang ở chính trang Catalog thì link Catalog chỉ tải lại trang: không tính.
    else if (state.context?.pageType !== "catalog" && isCatalogHref(href, win.location.href)) payload = buildCatalogEvent(anchor, state.context);
    if (!payload) return;
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push(payload);
  };
  doc.addEventListener("click", onActivate, true);
  doc.addEventListener("auxclick", onActivate, true);
  return true;
}
