/* Data Layer cho kết quả gửi Booking Form (PC + mobile), yêu cầu marketing 24/11/2026:
     H1-05 hlt_booking_form_submit_success  (GA4: generate_lead)
     H1-08 hlt_booking_submit_error          (GA4: booking_submit_error)

   Gọi từ chính logic gửi form của BookingPage (không dựa vào việc popup THANK YOU
   hiện ra), nên render lại / mở lại popup / tải lại trang không phát thêm.
   Không gửi bất kỳ dữ liệu khách nhập hay nội dung lỗi từ máy chủ. */

export const BOOKING_SUBMIT_SUCCESS_EVENT = "hlt_booking_form_submit_success";
export const BOOKING_SUBMIT_ERROR_EVENT = "hlt_booking_submit_error";
export const bookingErrorCategories = ["validation", "verification", "server", "network", "unknown"];

const push = (win, payload) => {
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push(payload);
};

/* Mỗi yêu cầu (requestId, dùng chung với chống gửi trùng phía máy chủ) chỉ tính
   một lần thành công; yêu cầu mới có requestId mới. */
const reportedRequests = new Set();

export function trackBookingSubmitSuccess(requestId, win = window) {
  if (requestId && reportedRequests.has(requestId)) return false;
  if (requestId) reportedRequests.add(requestId);
  push(win, { event: BOOKING_SUBMIT_SUCCESS_EVENT });
  return true;
}

/* Một lần bấm REQUEST A QUOTE thất bại = một sự kiện. */
export function trackBookingSubmitError(category, win = window) {
  push(win, { event: BOOKING_SUBMIT_ERROR_EVENT, error_category: bookingErrorCategories.includes(category) ? category : "unknown" });
}
