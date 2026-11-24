/* Data Layer H1-05 – gửi Booking Form thành công (PC + mobile), yêu cầu marketing
   24/11/2026: hlt_booking_form_submit_success (GA4: generate_lead).

   Gọi từ chính logic gửi form của BookingPage (không dựa vào việc popup THANK YOU
   hiện ra), nên render lại / mở lại popup / tải lại trang không phát thêm.
   Không gửi bất kỳ dữ liệu khách nhập. */

export const BOOKING_SUBMIT_SUCCESS_EVENT = "hlt_booking_form_submit_success";

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
