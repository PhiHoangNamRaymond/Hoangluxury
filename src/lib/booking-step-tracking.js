/* Data Layer H1-04 – hlt_booking_step_complete (yêu cầu marketing 24/11/2026).
   Chỉ Booking Form nhiều bước trên mobile: phát khi khách qua được validation của
   một bước và form chuyển sang bước kế tiếp (nút Continue, chỉ hiện ở mobile ≤600px;
   PC là một trang nên không bao giờ gọi tới đây). Step 5 (Review & Send) không có
   sự kiện riêng.

   Mỗi bước chỉ tính một lần trong một lượt điền form: Back rồi Continue lại không
   phát trùng. Lượt mới bắt đầu khi gửi form thành công (form được xoá) hoặc khi tải
   lại trang (form cũng trống, không lưu nháp). Không gửi bất kỳ dữ liệu khách nhập. */

export const BOOKING_STEP_EVENT = "hlt_booking_step_complete";
export const BOOKING_FORM_ID = "transfer_booking";
export const bookingStepNames = {
  1: "journey_route",
  2: "flight_details",
  3: "passenger_details",
  4: "ride_preferences",
};

export function createBookingStepTracker(win = window) {
  let completed = new Set();
  return {
    /* Gọi sau khi bước stepNumber đã hợp lệ và form chuyển sang bước sau. */
    complete(stepNumber) {
      const step_name = bookingStepNames[stepNumber];
      if (!step_name || completed.has(stepNumber)) return false;
      completed.add(stepNumber);
      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({ event: BOOKING_STEP_EVENT, form_id: BOOKING_FORM_ID, step_number: stepNumber, step_name });
      return true;
    },
    /* Bắt đầu lượt điền mới (sau khi gửi yêu cầu thành công). */
    reset() {
      completed = new Set();
    },
  };
}

/* Data Layer H1-03 – hlt_booking_form_start (yêu cầu marketing 25/11/2026), PC + mobile.
   Phát một lần khi khách thực sự bắt đầu điền Booking Form: lần đầu nhập/chọn/đổi
   giá trị một ô (chỉ focus vào ô thì chưa tính). Nhập tiếp, sửa, Continue/Back, gửi
   form không phát thêm. Lượt mới: sau khi gửi thành công (form xoá trắng) hoặc khi
   tải lại trang (form trống, không khôi phục nháp). Không gửi dữ liệu khách nhập.
   GA4 form_start vẫn do Enhanced Measurement thu tự động; sự kiện này cho Meta/TikTok. */
export const BOOKING_FORM_START_EVENT = "hlt_booking_form_start";

export function createBookingFormStartTracker(win = window) {
  let started = false;
  return {
    start() {
      if (started) return false;
      started = true;
      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({ event: BOOKING_FORM_START_EVENT, form_id: BOOKING_FORM_ID });
      return true;
    },
    reset() {
      started = false;
    },
  };
}
