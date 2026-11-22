/* Google Tag Manager (container của đội marketing, gắn 22/11/2026).
   Nạp từ file JS của site thay vì đoạn <script> viết thẳng trong HTML, để CSP
   giữ được script-src không có 'unsafe-inline' (chỉ thêm tên miền GTM ở
   vercel.json / public/.htaccess). Không chạy trên trang quản trị blog. */
export const GTM_ID = "GTM-KCVGVN29";

export function setupGtm(win = window, { id = GTM_ID, enabled = true } = {}) {
  const doc = win.document;
  const pathname = win.location?.pathname || "/";
  if (!enabled || !/^GTM-[A-Z0-9]+$/.test(id) || /^\/admin(?:\/|$)/i.test(pathname)) return false;
  if (doc.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${id}"]`)) return true;

  // Đúng đoạn mã Google cung cấp cho container: dataLayer + gtag("js").
  win.dataLayer = win.dataLayer || [];
  win.gtag = win.gtag || function gtag() {
    win.dataLayer.push(arguments);
  };
  win.gtag("js", new Date());

  const script = doc.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  doc.head.prepend(script);
  return true;
}
