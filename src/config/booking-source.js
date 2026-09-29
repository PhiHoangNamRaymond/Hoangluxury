/* Mã nguồn khách nội bộ, dùng làm phần giữa của Booking ID:
   HLT-<ddMMyy>-<mã nguồn>-<số thứ tự trong ngày>, ví dụ HLT-100826-RKS001-001.

   RKS001 website Hoang Luxury Travel (mặc định)
   RKS002 Facebook / Instagram
   RKS003 khách sạn / đối tác
   RKS004 nền tảng du lịch OTA
   RKS005 Rentunr

   Khách vào thẳng website thì luôn là RKS001. Muốn tách nguồn khác thì gắn
   ?src= vào link chiến dịch, ví dụ /booking/?src=RKS002 hoặc ?utm_source=facebook.
   Mã được nhớ theo phiên truy cập nên khách bấm qua vài trang vẫn giữ nguyên. */
export const defaultBookingSource = "RKS001";

const sourceByKeyword = [
  ["facebook", "RKS002"],
  ["instagram", "RKS002"],
  ["fb", "RKS002"],
  ["ig", "RKS002"],
  ["social", "RKS002"],
  ["hotel", "RKS003"],
  ["partner", "RKS003"],
  ["klook", "RKS004"],
  ["getyourguide", "RKS004"],
  ["viator", "RKS004"],
  ["tripadvisor", "RKS004"],
  ["agoda", "RKS004"],
  ["booking.com", "RKS004"],
  ["ota", "RKS004"],
  ["rentunr", "RKS005"],
];

const storageKey = "hlt-booking-source";

const toSourceCode = (value) => {
  const text = String(value || "").trim();

  if (!text) return "";
  if (/^RKS\d{3}$/i.test(text)) return text.toUpperCase();

  const lowered = text.toLowerCase();
  const match = sourceByKeyword.find(([keyword]) => lowered.includes(keyword));

  return match ? match[1] : "";
};

export function captureBookingSource() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const code = toSourceCode(params.get("src")) || toSourceCode(params.get("utm_source"));

  if (!code) return;

  try {
    window.sessionStorage.setItem(storageKey, code);
  } catch {
    // Trình duyệt chặn sessionStorage thì bỏ qua, form vẫn gửi mã mặc định.
  }
}

export function getBookingSource() {
  if (typeof window === "undefined") return defaultBookingSource;

  try {
    return window.sessionStorage.getItem(storageKey) || defaultBookingSource;
  } catch {
    return defaultBookingSource;
  }
}
