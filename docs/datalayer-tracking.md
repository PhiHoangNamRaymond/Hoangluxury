# Data Layer – WhatsApp (H1-01), Booking Form click (H1-02), Booking step (H1-04), Submit success (H1-05), Submit error (H1-08)

Mã nguồn:

- `src/lib/cta-tracking.js`: H1-01 và H1-02 dùng chung một bộ bắt click, cùng tên trường và cùng quy ước giá trị.
- `src/lib/booking-step-tracking.js`: H1-04.
- `src/lib/booking-submit-tracking.js`: H1-05 và H1-08, gọi từ hàm gửi form trong `src/BookingPage.jsx`.

# H1-01 – hlt_whatsapp_click

Bàn giao cho Marketing ngày 23/11/2026.

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

- Có 5 test tự động cho H1-01 trong `tests/cta-tracking.test.mjs`:
  - Mỗi lượt nhấn phát đúng một sự kiện với đủ trường.
  - Không lộ URL, tin nhắn hay số điện thoại của khách.
  - Chỉ render trang thì không phát sự kiện.
  - Mọi link WhatsApp trong mã giao diện đều có nhãn.
- Ở môi trường dev, đã nhấn tất cả link WhatsApp trên 13 trang: số sự kiện bằng đúng số link trên từng trang.
- Đã nhấn chuột thật để kiểm tra:
  - Pricing và Bottom CTA của Hanoi to Sapa.
  - BOOK HALF-DAY và BOOK FULL-DAY trên mobile 375px.
  - GTM nhận sự kiện (có `gtm.uniqueEventId`).

# H1-02 – hlt_booking_form_click

Bàn giao cho Marketing ngày 24/11/2026.

## Cách hoạt động

- Khi khách nhấn link dẫn tới Booking Form (`/booking/` trên chính site, kể cả có `?src=…`), website gọi đúng **một lần** `window.dataLayer.push()`.
- Mỗi lần push gồm tên sự kiện và **5 trường**: `page_type`, `route_id`, `cta_location`, `cta_id`, `cta_text`. Không có `service_type`.
- Sự kiện được push ngay trên trang nguồn, đồng bộ, trước khi trình duyệt chuyển trang. Không thêm độ trễ và không chặn điều hướng.
- **Không phát** trong các trường hợp:
  - Khi tải hoặc tải lại `/booking/`.
  - Khi thao tác bên trong Booking Form.
  - Khi nhấn link Booking ngay trên trang `/booking/`, vì đó chỉ là tải lại trang.
  - Với các nút chỉ mở WhatsApp, kể cả BOOK HALF-DAY và BOOK FULL-DAY của Photo. Các nút này chỉ phát `hlt_whatsapp_click`.
- `page_type` là trang nguồn, theo bảng ở phần H1-01.
- `route_id`:
  - Nút trong trang tuyến (Pricing, Bottom CTA) mang mã tuyến đang xem.
  - Nút Booking chung (Header, menu mobile, Footer) luôn là `null`.
  - Các trang khác: `null`.

```js
{
  event: "hlt_booking_form_click",
  page_type: "route_detail",
  route_id: "hanoi_to_sapa",
  cta_location: "pricing",
  cta_id: "booking_route_pricing",
  cta_text: "BOOK VIA FORM"
}
```

## Danh sách nút (PC + mobile)

| Trang | cta_location | cta_id | route_id | Chữ trên nút |
|---|---|---|---|---|
| Mọi trang, PC | header | `booking_header` | null | BOOKING |
| Mọi trang, mobile | mobile_menu | `booking_mobile_menu` | null | Booking |
| Mọi trang, PC | footer | `booking_footer` | null | Booking |
| Home | bottom_cta | `booking_home_bottom_cta` | null | BOOK VIA FORM |
| Routes (`/routes/`) | bottom_cta | `booking_routes_bottom_cta` | null | BOOK VIA FORM |
| Trang tuyến | pricing | `booking_route_pricing` | mã tuyến | BOOK VIA FORM |
| Trang tuyến | bottom_cta | `booking_route_bottom_cta` | mã tuyến | BOOK VIA FORM |
| Cruise | transfer_section | `booking_cruise_transfer` | null | BOOK VIA FORM |
| Cruise | bottom_cta | `booking_cruise_bottom_cta` | null | BOOK VIA FORM |

Footer trên mobile hiện không có link Booking. Trên mobile, khách vào Booking qua menu (`booking_mobile_menu`) và các nút BOOK VIA FORM trong trang.

## Các vị trí trong yêu cầu hiện không có nút Booking

- **Hero trang chủ:** chỉ có Book via WhatsApp và View Catalog.
- **Route Cards trang chủ và các thẻ trên `/routes/`:** chỉ dẫn tới trang tuyến hoặc WhatsApp.
- **Hero trang tuyến:** nút thứ hai là "View Catalog", dẫn tới `/catalog/`. Nút này đã được gắn sẵn mã `booking_route_hero`, nên nếu sau này đổi đích sang `/booking/` thì sẽ tự được tính.
- **Catalog, Blog, About Us:** không có link tới `/booking/`.

## Kiểm tra

- Có 4 test tự động cho H1-02 trong `tests/cta-tracking.test.mjs`:
  - Một lượt nhấn phát đúng một sự kiện 5 trường.
  - Nút trên tuyến lấy đúng tuyến; nút chung có `route_id` là `null`.
  - Link `/catalog/` không bị tính.
  - Trên trang Booking không phát.
  - Nút WhatsApp không phát H1-02.
  - Mọi link `/booking/` trong mã giao diện đều có nhãn.
- Ở môi trường dev, đã nhấn mọi link Booking trên 11 trang: số sự kiện bằng đúng số link trên từng trang, và không sự kiện nào có `service_type`. Trên `/booking/`: 0 sự kiện.
- Đã nhấn chuột thật, để trang chuyển thật:
  - BOOK VIA FORM ở Pricing của Hanoi to Sapa: sự kiện được ghi trên trang nguồn trước khi chuyển, `/booking/` mở bình thường, và không phát thêm sự kiện kể cả khi tải lại trang.
  - Booking trong menu mobile (375px) ở trang chủ: `page_type: home`, `cta_location: mobile_menu`, `route_id: null`, và trang chuyển bình thường.

# H1-04 – hlt_booking_step_complete (chỉ mobile)

Bàn giao cho Marketing ngày 24/11/2026.

```js
{ event: "hlt_booking_step_complete", form_id: "transfer_booking", step_number: 2, step_name: "flight_details" }
```

| step_number | step_name | Phát khi |
|---|---|---|
| 1 | `journey_route` | Step 1 qua validation và form chuyển sang Step 2 |
| 2 | `flight_details` | Step 2 → Step 3 |
| 3 | `passenger_details` | Step 3 → Step 4 |
| 4 | `ride_preferences` | Step 4 → Step 5 |

## Cách hoạt động

- Sự kiện được phát trong xử lý nút **Continue** của form nhiều bước. Nút này chỉ hiện trên mobile (màn hình ≤ 600px). Chỉ những lần nhấn qua được validation hiện có mới phát, và phát cùng lúc với lúc form chuyển bước.
- Step 5 (Review & Send) và nút REQUEST A QUOTE không phát sự kiện này.
- **Không phát:**
  - Khi vào hoặc tải lại `/booking/`.
  - Khi render form.
  - Khi khách mới bắt đầu điền một bước.
  - Khi nhấn Back.
  - Khi nhấn Continue mà form chưa hợp lệ.
  - Trên PC, vì PC là một trang và không có nút Continue.
- **Chống trùng:** mỗi bước chỉ được tính một lần trong một lượt điền. Nếu khách bấm Back, sửa, rồi Continue lại thì không phát thêm.
- **Lượt điền mới:**
  - Sau khi gửi yêu cầu thành công, form được xoá trắng và các bước có thể được tính lại từ đầu.
  - Tải lại trang cũng xoá trắng form (site không lưu nháp), nên lần điền sau cũng là một lượt mới.
- Chỉ gửi `form_id`, `step_number` và `step_name`. Không gửi bất kỳ dữ liệu nào khách nhập.
- Không thay đổi giao diện, validation hay tốc độ chuyển bước.

## Kiểm tra

- Có test tự động trong `tests/cta-tracking.test.mjs`: đủ 4 bước, đúng thứ tự, không trùng khi Back rồi Continue lại, Step 5 không phát, và bắt đầu lại được sau khi gửi thành công.
- Trên dev, mobile 375px:
  - Continue khi còn trống: không phát và vẫn ở Step 1.
  - Step 1 → 2: phát `1 / journey_route`.
  - Back rồi Continue lại: không phát thêm.
  - Continue ở Step 2 khi chưa chọn chuyến bay: không phát.
  - Các bước 2 → 3, 3 → 4, 4 → 5: phát đúng `flight_details`, `passenger_details`, `ride_preferences`.
  - Back từ Step 4 về Step 3 rồi Continue lại: không phát thêm.
  - Kết quả: đúng 4 sự kiện, và GTM đã nhận cả 4.
- PC (1440px): form hiện đủ 14 ô trên một trang, không có nút Continue, không có sự kiện bước nào.
- Phần bắt đầu lượt mới sau khi gửi thành công chỉ được kiểm tra bằng test tự động. Không gửi thử yêu cầu thật, để không tạo booking giả trong hệ thống.

# H1-05 – hlt_booking_form_submit_success (PC + mobile)

Bàn giao cho Marketing ngày 24/11/2026.

```js
{ event: "hlt_booking_form_submit_success" }
```

- Sự kiện chỉ có tên, không kèm trường nào và không có dữ liệu khách.
- Sự kiện được phát trong hàm gửi form, ngay sau khi máy chủ xác nhận `ok` và trước khi hiện THANK YOU. Đây chính là điều kiện đang quyết định việc hiện THANK YOU, nên sự kiện không phụ thuộc vào việc popup có xuất hiện trên giao diện hay không.
- PC và mobile dùng chung form và cùng nút REQUEST A QUOTE, nên cùng một logic.
- **Không phát:**
  - Khi mở hoặc điền form, khi chuyển bước.
  - Khi bấm REQUEST A QUOTE nhưng gửi chưa thành công.
  - Khi render lại, khi đóng hoặc mở lại THANK YOU.
  - Khi tải lại trang.
- **Chống trùng:**
  - Mỗi yêu cầu có một `requestId`, cũng là mã máy chủ dùng để chống gửi trùng. Mỗi `requestId` chỉ tính một lần.
  - Trong lúc đang gửi, các lần bấm thêm bị bỏ qua và không gửi thêm yêu cầu. Trước đây nếu bấm rất nhanh liên tiếp vẫn có thể lọt một yêu cầu thứ hai.
  - Một yêu cầu mới (sau khi form đã được xoá trắng) có `requestId` mới, nên được tính thêm một lần.

# H1-08 – hlt_booking_submit_error (PC + mobile)

Bàn giao cho Marketing ngày 24/11/2026.

```js
{ event: "hlt_booking_submit_error", error_category: "server" }
```

| error_category | Khi nào |
|---|---|
| `validation` | Bấm REQUEST A QUOTE khi form chưa hợp lệ. Gồm hai trường hợp: (1) ô bắt buộc còn thiếu hoặc sai định dạng, trình duyệt tự chặn và hiện nhắc nhở; (2) kiểm tra của website khi gửi: ngày đi đã qua, chữ nhập không hợp lệ, chưa chọn mã quốc gia. |
| `server` | Máy chủ trả mã lỗi (4xx/5xx), trả `ok` khác `true`, hoặc phản hồi không đọc được |
| `network` | Không có phản hồi: mất mạng, không kết nối được, hoặc quá 30 giây |
| `verification` | Bấm gửi khi chưa có mã xác minh Turnstile |
| `unknown` | Website chưa cấu hình địa chỉ gửi form, hoặc lỗi không rơi vào các nhóm trên |

- Mỗi lần bấm REQUEST A QUOTE thất bại phát đúng **một** sự kiện. Lần gửi sau thất bại thì phát thêm một sự kiện mới.
- **Không phát:**
  - Khi khách đang nhập.
  - Khi nhấn Continue hoặc Back trên mobile.
  - Khi gửi thành công.
  - Khi đóng hoặc mở lại thông báo lỗi cũ, hoặc khi render lại.
- Chỉ gửi `error_category`. Không gửi nội dung lỗi của máy chủ hay dữ liệu khách.
- Thông báo lỗi hiển thị cho khách giữ nguyên như trước.
- **Lưu ý về `verification`:** nút REQUEST A QUOTE vốn bị khoá cho tới khi Turnstile xác minh xong. Khi mã xác minh hết hạn, nút cũng bị khoá lại. Vì vậy trên thực tế nhóm này gần như không xuất hiện. Khách bị kẹt ở bước xác minh sẽ không bấm được nút, nên trường hợp đó không đo được bằng sự kiện này.
- **Lưu ý về `network`:** khi khách mất mạng thật, chính sự kiện gửi lên GA4 cũng có thể không đi được, nên con số lỗi `network` trong GA4 có thể thấp hơn thực tế.
- **Trên mobile:** các ô đã được kiểm tra ở từng bước, nên lỗi `validation` khi gửi chủ yếu đến từ kiểm tra của website, ví dụ để trang mở qua đêm khiến ngày đi đã qua.

## Kiểm tra H1-05 và H1-08

- `tests/booking-submit-tracking.test.mjs` dựng trang Booking thật trong môi trường test. Máy chủ và Turnstile là bản giả, không gửi booking thật. Test kiểm tra lần lượt:
  - Mở và điền form: không phát.
  - Bấm gửi khi còn thiếu ô bắt buộc: phát một `validation` và không gửi gì lên máy chủ.
  - Máy chủ báo lỗi: phát một `server`.
  - Mất mạng: phát một `network`.
  - Thành công, bấm liên tục 3 lần: chỉ 1 yêu cầu gửi đi và 1 `hlt_booking_form_submit_success`, THANK YOU hiện ra.
  - Đóng popup và render lại: không phát thêm.
  - Một yêu cầu mới thành công: phát thêm 1 sự kiện, với `requestId` khác.
  - Data Layer không chứa tên, số điện thoại, địa chỉ, hành lý hay mã Turnstile.
- Test riêng cho `submitForm`: đúng nhóm lỗi với từng loại sự cố (mất mạng, quá thời gian, 500, `ok: false`, phản hồi không phải JSON, địa chỉ sai). Thông báo lỗi giữ nguyên.
- Trên dev: trang Booking tải bình thường, không có lỗi console, không phát sự kiện nào khi mở trang. Không gửi thử yêu cầu thật, vì Turnstile thật yêu cầu người xác minh và địa chỉ gửi là hệ thống thật. Marketing kiểm tra trên website demo bằng GTM Preview.
