/* Booking ID dạng HLT-<ddMMyy>-RKS<3 số>-<3 số>, ví dụ HLT-100826-RKS001-001.
   Ô nhập trang Feedback để khách tự gõ, tối đa 21 ký tự, không tự sửa khi đang
   gõ (khách yêu cầu 31/10/2026): đổi giá trị lúc gõ làm con trỏ nhảy về cuối
   trên mobile. Chỉ chuẩn hoá và kiểm tra khi gửi. Cùng quy tắc với
   google-apps-script/Code.gs (bookingIdValid_). */

export const BOOKING_ID_MAX_LENGTH = 21;

/* Chuẩn hoá khi gửi: in hoa, bỏ mọi ký tự không phải chữ / số, chèn dấu gạch sau
   ký tự thứ 3, 9 và 15. Không cắt bớt: thừa ký tự thì isValidBookingId từ chối. */
export function normalizeBookingId(value) {
  const chars = String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
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
