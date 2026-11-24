/* Data Layer gửi form thành công (PC + mobile), yêu cầu marketing 24/11/2026:
     H1-05 hlt_booking_form_submit_success (GA4: generate_lead)   – Booking Form
     H1-08 hlt_feedback_submit             (GA4: feedback_submit) – Feedback Form
   Chỉ có tên sự kiện, không kèm trường nào.

   Gọi từ chính logic gửi form của BookingPage (không dựa vào việc popup THANK YOU
   hiện ra), nên render lại / mở lại popup / tải lại trang không phát thêm.
   Không gửi bất kỳ dữ liệu khách nhập. */

export const BOOKING_SUBMIT_SUCCESS_EVENT = "hlt_booking_form_submit_success";
export const FEEDBACK_SUBMIT_EVENT = "hlt_feedback_submit";

const push = (win, payload) => {
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push(payload);
};

/* Mỗi yêu cầu (requestId, dùng chung với chống gửi trùng phía máy chủ) chỉ tính
   một lần thành công; yêu cầu mới có requestId mới. Máy chủ trả ok cho lần gửi lại
   cùng requestId mà không ghi thêm dòng nào, nên lần đó cũng không được tính. */
const reportedRequests = new Set();

function trackOnce(event, requestId, win) {
  const key = requestId ? `${event}:${requestId}` : "";
  if (key && reportedRequests.has(key)) return false;
  if (key) reportedRequests.add(key);
  push(win, { event });
  return true;
}

export function trackBookingSubmitSuccess(requestId, win = window) {
  return trackOnce(BOOKING_SUBMIT_SUCCESS_EVENT, requestId, win);
}

/* H1-08: Feedback đã được máy chủ xác nhận lưu, ngay trước khi hiện THANK YOU. */
export function trackFeedbackSubmitSuccess(requestId, win = window) {
  return trackOnce(FEEDBACK_SUBMIT_EVENT, requestId, win);
}
