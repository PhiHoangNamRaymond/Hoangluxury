# Data Layer – hlt_whatsapp_click

Bàn giao cho Marketing (23/11/2026). Mã nguồn: `src/lib/whatsapp-tracking.js`.

## Cách hoạt động

- Khi khách nhấn bất kỳ link WhatsApp nào (`wa.me`, `api.whatsapp.com`, `web.whatsapp.com`, `whatsapp://`), website gọi đúng **một lần** `window.dataLayer.push()`.
- Mỗi lần push gồm tên sự kiện và cả 6 trường.
- Sự kiện được push ngay lúc nhấn, trước khi trình duyệt mở WhatsApp.
- Link, nội dung tin nhắn soạn sẵn và class CSS đều giữ nguyên.
- Nhấn chuột giữa (mở WhatsApp ở tab mới) cũng được tính.
- Chỉ có một listener cho cả trang, nên một lượt nhấn không bao giờ bị tính hai lần. Khi trang vừa tải hoặc render lại mà khách chưa nhấn, không có sự kiện nào được phát.
- Trường không áp dụng luôn là `null`, nên không giữ giá trị của sự kiện trước. Mỗi trang là một lần tải mới, nên `route_id` của tuyến cũ không bị mang sang trang khác.
- Không gửi URL WhatsApp, nội dung tin nhắn, số điện thoại hay email của khách, hoặc dữ liệu khách nhập trong form.
- Link WhatsApp chưa gắn nhãn vẫn được ghi nhận, ví dụ link do người viết blog chèn vào bài. Với các link này:
  - `cta_location` = `header` / `footer` / `content`, suy theo vị trí của link trên trang.
  - `cta_id` = `whatsapp_<cta_location>`.

```js
{
  event: "hlt_whatsapp_click",
  page_type: "route_detail",
  service_type: "private_transfer",
  route_id: "hanoi_to_sapa",
  cta_location: "pricing",
  cta_id: "whatsapp_route_pricing",
  cta_text: "BOOK VIA WHATSAPP"
}
```

## Quy ước giá trị

**page_type**

| Giá trị | Trang |
|---|---|
| `home` | Trang chủ |
| `route_list` | All Private Transfer Routes (`/routes/`) |
| `route_detail` | Các trang chi tiết tuyến |
| `cruise` | Halong Bay Cruises |
| `booking` | Booking |
| `catalog` | Catalog |
| `photo_landing` | Photo |
| `photo_albums` | Danh sách album, kể cả trang lọc theo phong cách |
| `photo_album` | Một album |
| `blog` | Trang Blog |
| `blog_article` | Bài viết |
| `about` | About Us |
| `policy` | Privacy Policy, Terms |
| `feedback` | Feedback |
| `not_found` | Trang 404 |

**service_type**

| Giá trị | Áp dụng cho |
|---|---|
| `private_transfer` | Nút xe riêng. Gồm cả Header/Footer trên các trang xe, blog và about. |
| `photography` | Các trang và nút Photo |
| `cruise` | Các nút hỏi về du thuyền trên trang Cruise |
| `null` | Nút liên hệ chung: Header/Footer và "Contact us now" trên trang Policy, Feedback, 404 |

**route_id**

- Dạng `<điểm đi>_to_<điểm đến>`, ví dụ `hanoi_to_sapa`, `hanoi_to_ha_long`, `sapa_to_ha_long`, `ninh_binh_to_sapa`.
- Trên trang tuyến: mọi nút WhatsApp, kể cả Header và Footer, mang mã của tuyến đang xem, vì tin nhắn soạn sẵn ghi tên tuyến đó.
- Trên `/routes/`: mỗi thẻ tuyến mang mã tuyến của chính thẻ đó.
- Các trang khác: `null`.

**cta_text:** chữ đang hiển thị trên nút, kể cả chữ in hoa do CSS. Hai trường hợp đặc biệt:

- Nút chỉ là ảnh mã QR: `WhatsApp QR`.
- Link số điện thoại ở Footer: số hotline công ty `+84.839.779.888`, vì đó là chữ hiển thị trên link.

## Danh sách nút (PC + mobile)

| Trang | cta_location | cta_id | Chữ trên nút |
|---|---|---|---|
| Mọi trang | header | `whatsapp_header` | WHATSAPP NOW |
| Mọi trang, PC | footer | `whatsapp_footer_phone` | +84.839.779.888 |
| Mọi trang, PC | footer | `whatsapp_footer_qr` | WhatsApp QR |
| Mọi trang, mobile | footer | `whatsapp_footer_qr_mobile` | WhatsApp QR |
| Mọi trang, mobile | footer | `whatsapp_footer_phone_mobile` | +84.839.779.888 |
| Home | hero | `whatsapp_home_hero` | BOOK VIA WHATSAPP |
| Home | bottom_cta | `whatsapp_home_bottom_cta` | BOOK VIA WHATSAPP |
| Routes | route_card | `whatsapp_route_card` (kèm route_id của thẻ) | BOOK VIA WHATSAPP |
| Routes | bottom_cta | `whatsapp_routes_bottom_cta` | BOOK VIA WHATSAPP |
| Trang tuyến | hero | `whatsapp_route_hero` | BOOK VIA WHATSAPP |
| Trang tuyến | pricing | `whatsapp_route_pricing` | BOOK VIA WHATSAPP |
| Trang tuyến | bottom_cta | `whatsapp_route_bottom_cta` | BOOK VIA WHATSAPP |
| Cruise | hero | `whatsapp_cruise_hero` | BOOK VIA WHATSAPP |
| Cruise | cruise_card | `whatsapp_cruise_view_details` | View Details |
| Cruise | transfer_section | `whatsapp_cruise_transfer` (service: `private_transfer`) | BOOK VIA WHATSAPP |
| Cruise | bottom_cta | `whatsapp_cruise_bottom_cta` | BOOK VIA WHATSAPP |
| Booking | booking_form | `whatsapp_booking_form` | CHAT VIA WHATSAPP |
| Catalog | hero | `whatsapp_catalog_hero` | BOOK VIA WHATSAPP |
| Photo | hero | `whatsapp_photo_hero` | BOOK VIA PHOTO |
| Photo | package_card | `whatsapp_photo_half_day` | BOOK HALF-DAY |
| Photo | package_card | `whatsapp_photo_full_day` | BOOK FULL-DAY |
| Photo | bottom_cta | `whatsapp_photo_bottom_cta` | CHAT ON WHATSAPP |
| Photo Albums | content | `whatsapp_photo_albums_empty`: chỉ hiện khi một phong cách chưa có album | Message us on WhatsApp |
| Photo Albums | bottom_cta | `whatsapp_photo_albums_bottom_cta` | BOOK VIA WHATSAPP |
| Album | bottom_cta | `whatsapp_photo_album_bottom_cta` | Book via Photo (theo CSS hiển thị) |
| Blog | content | `whatsapp_blog_plan` | PLAN YOUR JOURNEY |
| Bài blog | content | `whatsapp_blog_article_plan` | Plan this journey with us |
| Bài blog | bottom_cta | `whatsapp_blog_article_bottom_cta` | BOOK VIA WHATSAPP |
| About Us | bottom_cta | `whatsapp_about_bottom_cta` | BOOK VIA WHATSAPP |
| Privacy / Terms | bottom_cta | `whatsapp_policy_help` | CONTACT US NOW → |

`cta_id` chung cho cùng một loại nút ở nhiều trang, ví dụ `whatsapp_route_pricing`. Muốn phân biệt từng trang thì ghép với `route_id` hoặc biến Page Path có sẵn của GTM.

## Kiểm tra

- Có 5 test tự động trong `tests/whatsapp-tracking.test.mjs`:
  - Mỗi lượt nhấn phát đúng một sự kiện với đủ trường.
  - Không lộ URL, tin nhắn hay số điện thoại của khách.
  - Chỉ render trang thì không phát sự kiện.
  - Mọi link WhatsApp trong mã giao diện đều có nhãn.
- Ở môi trường dev, đã nhấn tất cả link WhatsApp trên 13 trang: số sự kiện bằng đúng số link trên từng trang.
- Đã nhấn chuột thật để kiểm tra:
  - Pricing và Bottom CTA của Hanoi to Sapa.
  - BOOK HALF-DAY và BOOK FULL-DAY trên mobile 375px.
  - GTM nhận sự kiện (có `gtm.uniqueEventId`).
