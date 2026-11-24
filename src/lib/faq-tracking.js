/* Data Layer H2-02 – hlt_faq_open (yêu cầu marketing 24/11/2026).
   Phát khi khách tự bấm/chạm mở một câu FAQ đang đóng trên 17 trang tuyến và trang
   Halong Bay Cruises (PC + mobile). Một sự kiện cho mỗi lần mở; không phát khi đóng,
   khi tải trang, render lại hay khi câu khác tự đóng.

   faq_id là mã cố định gắn trong dữ liệu FAQ (config/journeys.js, config/cruises.js),
   không dùng số thứ tự hay chữ câu hỏi. Câu dùng chung giữa trang tuyến và trang du
   thuyền mang cùng mã. Không gửi nội dung câu hỏi/câu trả lời. */

export const FAQ_OPEN_EVENT = "hlt_faq_open";

export const faqIds = [
  "booking_confirmation",
  "all_inclusive_pricing",
  "flexible_stops",
  "payment_deposit",
  "pickup_flight_delay",
  "luggage_capacity",
  "custom_itinerary",
  "driver_english",
  "hotel_pickup",
  "cruise_departure_point",
];

export function trackFaqOpen({ faqId, pageType, routeId = null }, win = window) {
  if (!faqIds.includes(faqId)) return false;
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push({ event: FAQ_OPEN_EVENT, page_type: pageType || null, route_id: routeId || null, faq_id: faqId });
  return true;
}

/* FAQ dạng <details>/<summary> (trang tuyến). Bấm vào summary (chữ hoặc dấu +, chuột,
   chạm hay bàn phím) đánh dấu "khách vừa thao tác"; sự kiện toggle của trình duyệt
   báo trạng thái thật sau khi đổi. Chỉ khi có thao tác VÀ câu chuyển sang mở mới phát,
   nên mở do code/khôi phục trạng thái không tính, đóng câu hỏi không tính. */
/* Cờ "khách vừa bấm" gắn trên chính thẻ <details>, nên không mất khi React vẽ lại
   giữa lúc bấm và lúc trình duyệt báo toggle. */
const USER_FLAG = "hltFaqUser";

export function faqDetailsProps(faqId, context, win = window) {
  return {
    details: {
      "data-faq-id": faqId,
      onToggle: (event) => {
        const details = event.currentTarget;
        const byUser = details.dataset[USER_FLAG] === "1";
        delete details.dataset[USER_FLAG];
        if (details.open && byUser) trackFaqOpen({ faqId, ...context }, win);
      },
    },
    summary: {
      onClick: (event) => {
        const details = event.currentTarget.closest("details");
        // Chỉ đánh dấu khi câu đang đóng (sắp mở); bấm để đóng thì không đánh dấu.
        if (details && !details.open) details.dataset[USER_FLAG] = "1";
      },
    },
  };
}
