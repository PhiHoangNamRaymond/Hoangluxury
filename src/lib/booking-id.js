/* Booking ID dạng HLT-<ddMMyy>-RKS<3 số>-<3 số>, ví dụ HLT-100826-RKS001-001:
   đúng 18 chữ và số (không tính dấu gạch). Dùng cho ô Booking ID trang Feedback
   để khách không gõ bừa / spam (khách yêu cầu 29/10/2026). Cùng quy tắc với
   google-apps-script/Code.gs (bookingIdValid_). */

export const BOOKING_ID_CHARS = 18;

/* Chuẩn hoá khi gõ: in hoa, bỏ mọi ký tự không phải chữ / số, tối đa 18 ký tự,
   tự chèn dấu gạch sau ký tự thứ 3, 9 và 15. */
export function formatBookingIdInput(value) {
  const chars = String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, BOOKING_ID_CHARS);
  return [chars.slice(0, 3), chars.slice(3, 9), chars.slice(9, 15), chars.slice(15)]
    .filter(Boolean)
    .join("-");
}

export function isValidBookingId(value) {
  const match = /^HLT-(\d{2})(\d{2})\d{2}-RKS\d{3}-\d{3}$/.exec(String(value || "").trim());
  if (!match) return false;
  const day = Number(match[1]);
  const month = Number(match[2]);
  return day >= 1 && day <= 31 && month >= 1 && month <= 12;
}
