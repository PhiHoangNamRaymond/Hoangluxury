# Data Layer – WhatsApp (H1-01), Booking Form click (H1-02), Booking step (H1-04), Submit success (H1-05), Catalog click (H1-06), Catalog open (H1-07), Feedback submit (H1-08), Destination select (H2-01), FAQ open (H2-02)

Mã nguồn:

- `src/lib/cta-tracking.js`: H1-01, H1-02, H1-06, H1-07 và H2-01 dùng chung một bộ bắt click, cùng tên trường và cùng quy ước giá trị.
- `src/lib/booking-step-tracking.js`: H1-04.
- `src/lib/faq-tracking.js`: H2-02; mã `faq_id` gắn trong `src/config/journeys.js` và `src/config/cruises.js`.
- `src/lib/booking-submit-tracking.js`: H1-05 (gọi từ `src/BookingPage.jsx`) và H1-08 (gọi từ `src/FeedbackPage.jsx`).

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
- **Hero trang tuyến:** nút thứ hai là "View Catalog", dẫn tới `/catalog/`, nên được tính là H1-06 (`catalog_route_hero`). Nếu sau này đổi đích sang `/booking/`, nút sẽ tự chuyển sang H1-02 với mã `booking_route_hero`.
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
  - Một yêu cầu mới (sau khi form đã được xoá trắng) có `requestId` mới, nên được tính thêm một lần.

## Kiểm tra H1-05

- `tests/booking-submit-tracking.test.mjs` dựng trang Booking thật trong môi trường test. Máy chủ và Turnstile là bản giả, không gửi booking thật. Test kiểm tra lần lượt:
  - Mở và điền form: không phát.
  - Bấm gửi khi còn thiếu ô bắt buộc, máy chủ báo lỗi, mất mạng: không phát.
  - Thành công: 1 `hlt_booking_form_submit_success`, THANK YOU hiện ra.
  - Đóng popup và render lại: không phát thêm.
  - Một yêu cầu mới thành công: phát thêm 1 sự kiện, với `requestId` khác.
  - Data Layer không chứa tên, số điện thoại, địa chỉ, hành lý hay mã Turnstile.
- Trên dev: trang Booking tải bình thường, không có lỗi console, không phát sự kiện nào khi mở trang. Không gửi thử yêu cầu thật, vì Turnstile thật yêu cầu người xác minh và địa chỉ gửi là hệ thống thật. Marketing kiểm tra trên website demo bằng GTM Preview.

# H1-06 – hlt_catalog_click (PC + mobile)

Bàn giao cho Marketing ngày 24/11/2026.

```js
{
  event: "hlt_catalog_click",
  page_type: "route_detail",
  service_type: "private_transfer",
  route_id: "hanoi_to_sapa",
  cta_location: "hero",
  cta_id: "catalog_route_hero",
  cta_text: "VIEW CATALOG"
}
```

## Cách hoạt động

- Dùng chung bộ bắt click với H1-01 và H1-02. Mọi link có đích là trang Catalog nội bộ (`/catalog/` trên chính site) phát đúng **một** sự kiện, kèm đủ 6 trường giống H1-01, trong một lần push, trước khi trình duyệt chuyển trang. Không thêm độ trễ.
- Nhận theo **đích thực tế của link**, không theo chữ trên nút. Ví dụ VIEW ALL SERVICES ở trang chủ đang dẫn tới `/catalog/` nên được tính. Nút nào dẫn tới trang khác thì không tính.
- Link Catalog mới thêm sau này vẫn được tính tự động: link chưa gắn nhãn nhận `cta_location` là `header` / `footer` / `content` và `cta_id` là `catalog_<vị trí>`. Có test tự động báo lỗi nếu trong mã có link `/catalog/` chưa gắn nhãn.
- **Không phát:**
  - Khi mở trực tiếp hoặc tải lại trang Catalog.
  - Khi nhấn link Catalog ngay trên trang Catalog, vì đó chỉ là tải lại trang.
  - Khi nhấn nút mở tài liệu Google Drive/PDF trong Catalog (thuộc H1-07).
  - Khi nhấn link tới trang khác.
- **service_type** theo dịch vụ của **trang xuất phát**:

| Trang | service_type |
|---|---|
| Trang tuyến, `/routes/`, Booking | `private_transfer` |
| Photo, Albums, Album | `photography` |
| Cruise | `cruise` |
| Trang chủ, About Us, Blog, bài blog, Feedback, Policy, 404 | `null` |

- **route_id:** trên trang tuyến, mọi nút Catalog (kể cả Header, menu mobile, Footer) mang mã tuyến của trang đó, đúng như yêu cầu "mã tuyến nếu khách đang ở trang Route Detail". Các trang khác là `null`.

## Danh sách nút (PC + mobile)

| Trang | cta_location | cta_id | Chữ trên nút |
|---|---|---|---|
| Mọi trang, PC | header | `catalog_header_desktop` | CATALOG |
| Mọi trang, mobile | mobile_menu | `catalog_mobile_menu` | Catalog |
| Mọi trang, PC | footer | `catalog_footer` | Catalog |
| Trang chủ | hero | `catalog_home_hero` | VIEW CATALOG |
| Trang chủ, khu Services | content | `catalog_home_services` | VIEW ALL SERVICES |
| Trang tuyến | hero | `catalog_route_hero` | VIEW CATALOG |
| Cruise | hero | `catalog_cruise_hero` | VIEW CATALOG |
| About Us | bottom_cta | `catalog_about_bottom_cta` | VIEW CATALOG |
| Bài blog | bottom_cta | `catalog_blog_article_bottom_cta` | VIEW CATALOG |

**Vị trí không có nút Catalog:** Footer bản mobile, thanh cố định/sticky (site không có), trang Photo, Booking, Feedback ngoài Header và Footer.

## Kiểm tra

- Có 2 test tự động trong `tests/cta-tracking.test.mjs`:
  - Đủ 6 trường; trang chủ có `service_type` và `route_id` là `null`.
  - Mỗi lượt nhấn một sự kiện.
  - Link `/services/`, Google Drive, PDF và link Catalog ngay trên trang Catalog không phát.
  - Mọi link `/catalog/` trong mã đều có nhãn.
- Trên dev, đã nhấn mọi link Catalog trên 11 trang: số sự kiện bằng đúng số link, không phát nhầm sự kiện WhatsApp/Booking, và trang Catalog: 0 sự kiện.
- Đã nhấn thật trên mobile 375px, để trang chuyển thật:
  - VIEW CATALOG ở hero trang Hanoi to Sapa: được `route_detail / private_transfer / hanoi_to_sapa / hero / catalog_route_hero`. Sự kiện ghi trước khi chuyển, Catalog mở bình thường, và không phát thêm khi tới Catalog.
  - Catalog trong menu mobile từ trang Blog: được `blog / null / null / mobile_menu / catalog_mobile_menu`, trang chuyển bình thường.
- Nút "VIEW FLEET, ROUTES & PRICING" mở Google Drive trong trang Catalog không phát sự kiện nào.

# H1-07 – hlt_catalog_open (PC + mobile)

Bàn giao cho Marketing ngày 24/11/2026.

```js
{
  event: "hlt_catalog_open",
  page_type: "catalog",
  catalog_id: "hlt_customer_catalog",
  cta_id: "catalog_view_fleet_routes_pricing",
  cta_location: "content"
}
```

## Cách hoạt động

- Phát khi khách nhấn **VIEW FLEET, ROUTES & PRICING** trên trang Catalog, tức nút mở file PDF trên Google Drive. PC và mobile dùng chung một nút, chỉ khác bố cục.
- Dùng chung bộ bắt click với H1-01, H1-02 và H1-06. Mỗi lượt nhấn phát đúng một sự kiện với 4 trường, trong một lần push, trước khi tab Google Drive mở ra. Nút vẫn mở Google Drive ở tab mới như cũ.
- **Chỉ tính khi đủ cả 3 điều kiện:**
  - Đang ở trang Catalog.
  - Nút đã được gắn mã `catalog_id`.
  - Đích của link là một **file** trên `drive.google.com`.
- **Không phát:**
  - Khi mở hoặc tải lại trang Catalog.
  - Khi nhấn BOOK VIA WHATSAPP.
  - Khi nhấn link Catalog trên header/footer.
  - Khi nhấn CATALOG hoặc VIEW CATALOG ở trang khác (những lượt này là H1-06).
  - Khi nhấn chuột phải.
- Nhấn chuột giữa (mở tab mới) vẫn được tính.
- Không gửi đường dẫn Google Drive hay nội dung tài liệu.
- Sau này nếu có thêm tài liệu khác, gắn `catalogOpenCta("<catalog_id>", "<cta_id>")` cho nút mới để phân biệt.

## Kiểm tra

- Có test tự động trong `tests/cta-tracking.test.mjs`. Test chỉ tính link Drive dạng file đã gắn nhãn, và không tính các trường hợp sau:
  - Link Drive chưa gắn nhãn.
  - Thư mục Drive.
  - Link `#catalog` khi chưa cấu hình PDF.
  - Link Catalog nội bộ, tên miền khác, WhatsApp.
  - Nhấn chuột phải.
  - Trang khác trang Catalog.
- Test cũng xác nhận tracking không chặn việc mở link, và nhấn chuột giữa được tính.
- Trên dev, trang Catalog ở khổ PC 1440px và mobile 375px:
  - Nhấn VIEW FLEET: đúng 1 `hlt_catalog_open` đủ 4 trường.
  - BOOK VIA WHATSAPP: chỉ phát `hlt_whatsapp_click`.
  - Catalog trên header ngay trên trang Catalog: không phát.
  - Tải trang: 0 sự kiện.
- Từ trang chủ, nhấn CATALOG chỉ phát `hlt_catalog_click`.
- Nút vẫn trỏ tới `drive.google.com/file/d/…/view` với `target="_blank"`, nên mở Google Drive ở tab mới như cũ.

**Marketing cần tạo mới** biến `catalog_id`, trigger `hlt_catalog_open` và tag `catalog_open`. Các biến `page_type`, `cta_id`, `cta_location` dùng lại từ H1-01.

# H1-08 – hlt_feedback_submit (PC + mobile)

Bàn giao cho Marketing ngày 24/11/2026. Lưu ý: mã H1-08 trước đây dùng cho "booking_submit_error". Sự kiện đó đã bỏ hoàn toàn, nên mã H1-08 giờ chỉ là Feedback thành công.

```js
{ event: "hlt_feedback_submit" }
```

- Chỉ có tên sự kiện. Không có Booking ID, số sao, nội dung hay thông tin khách.
- Sự kiện được phát trong hàm gửi Feedback, ngay sau khi máy chủ xác nhận đã lưu Feedback và trước khi hiện THANK YOU. Đây chính là điều kiện đang quyết định việc hiện THANK YOU.
- "Máy chủ xác nhận" nghĩa là đã qua đủ các bước: Cloudflare Worker kiểm tra Turnstile, Apps Script kiểm tra Booking ID, ghi dòng vào tab Feedback, rồi trả `ok: true`. Gửi đi mà chưa nhận được xác nhận đó thì không tính.
- PC và mobile dùng chung một form và cùng một logic.
- **Không phát:**
  - Khi mở trang, nhập Booking ID, chọn sao, viết nhận xét.
  - Khi validation không qua (thiếu thông tin, Booking ID sai định dạng).
  - Khi máy chủ từ chối: CAPTCHA, Booking ID, giới hạn lượt gửi hoặc lỗi backend.
  - Khi mất mạng.
  - Khi render lại, khi THANK YOU hiện lại, khi tải lại trang.
- **Chống trùng:**
  - Mỗi Feedback có một `requestId`, cũng là mã Apps Script dùng để chống ghi trùng. Mỗi `requestId` chỉ tính một lần.
  - Nếu khách gửi lại đúng nội dung cũ, website dùng lại `requestId` cũ. Apps Script trả `ok` nhưng không ghi thêm dòng nào, nên website cũng không phát thêm sự kiện.
  - Một Feedback mới (nội dung khác) có `requestId` mới, nên được tính thêm.
  - Trong lúc đang gửi, nút bị khoá.
- Giao diện, validation, Turnstile và cách gửi giữ nguyên.

## Kiểm tra

- Test tích hợp trong `tests/feedback-components.test.mjs` dựng trang Feedback thật, với máy chủ và Turnstile giả. Test kiểm tra lần lượt:
  - Mở trang và điền form: không phát.
  - Booking ID sai định dạng: không phát và không gửi gì lên máy chủ.
  - Máy chủ trả 400: không phát.
  - Máy chủ xác nhận: đúng 1 `hlt_feedback_submit`, THANK YOU hiện ra.
  - Render lại: không phát thêm.
  - Gửi lại đúng nội dung cũ (cùng `requestId`): không phát thêm.
  - Feedback mới: phát thêm 1 sự kiện.
  - Data Layer chỉ có trường `event`.
- Trên dev, trang Feedback ở khổ PC 1440px và mobile 375px tải bình thường, và không phát sự kiện nào khi mở trang.
- Không gửi thử Feedback thật, vì như vậy sẽ ghi một dòng thật vào tab Feedback. Marketing kiểm tra bằng GTM Preview trên website demo với một Feedback ghi rõ "TEST", rồi xoá dòng đó trong Sheet.

**Marketing chỉ cần tạo** trigger `hlt_feedback_submit` và tag `feedback_submit`. Không cần biến nào.

# H2-01 – hlt_destination_select (PC + mobile)

Bàn giao cho Marketing ngày 24/11/2026.

```js
{
  event: "hlt_destination_select",
  page_type: "home",
  destination_type: "private_transfer",
  destination_id: "hanoi_to_sapa",
  cta_location: "header_mega_menu",
  cta_id: "route_menu_link"
}
```

## Cách hoạt động

- Dùng chung bộ bắt click với các sự kiện H1. Sự kiện được nhận theo **đích thực tế của link**: mọi link tới trang chi tiết tuyến, kể cả URL cũ `/journey/…`, hoặc tới trang Halong Bay Cruises đều phát đúng **một** sự kiện, trong một lần push, trước khi chuyển trang.
- Vì nhận theo đích, nên **đủ cả 17 tuyến** có trang chi tiết, kể cả 8 tuyến chỉ có trong menu ROUTES đầy đủ. Link tuyến thêm sau này cũng tự được tính: link chưa gắn nhãn nhận `cta_location` là `header` / `footer` / `content`, và `cta_id` là `route_link` hoặc `cruise_link`. Ngoài ra có test báo lỗi khi link tuyến trong mã chưa gắn nhãn.
- **Không phát:**
  - Khi rê chuột vào ROUTES.
  - Khi nhấn ROUTES để cuộn xuống bản đồ (`#routes`).
  - Khi nhấn mũi tên mở/đóng menu mobile (đây là nút, không phải link).
  - Khi nhấn **All Private Transfer Routes** (`/routes/`).
  - Khi mở menu, cuộn trang, render lại.
  - Khi vào trực tiếp hoặc tải lại trang tuyến / trang Cruise.
  - Khi nhấn link dẫn về **chính trang đang xem**, vì đó chỉ là tải lại trang.
- Nhấn vào ảnh nằm bên trong thẻ tuyến chỉ tính một lần, vì mỗi thẻ là một link duy nhất.
- `page_type` dùng đúng giá trị như các sự kiện trước. Trang tổng hợp `/routes/` là `route_list`; ví dụ trong yêu cầu ghi `routes_index` chỉ để minh hoạ.
- Không có `cta_text` và không có thông tin khách.

## Giá trị thực tế

**destination_type / destination_id**

| destination_type | destination_id |
|---|---|
| `private_transfer` | `hanoi_to_sapa`, `hanoi_to_ha_long`, `hanoi_to_ninh_binh`, `hanoi_to_ha_giang`, `hanoi_to_cat_ba`, `hanoi_to_cao_bang`, `hanoi_to_mu_cang_chai`, `hanoi_to_moc_chau`, `hanoi_to_ta_xua`, `hanoi_to_pu_luong`, `sapa_to_ha_long`, `sapa_to_ninh_binh`, `sapa_to_ha_giang`, `sapa_to_mu_cang_chai`, `ha_long_to_sapa`, `ninh_binh_to_sapa`, `mu_cang_chai_to_sapa` |
| `cruise` | `halong_bay_cruises` |

`destination_id` dùng **đúng mã** `route_id` của các sự kiện H1, nên ghép báo cáo được với nhau.

**cta_location / cta_id**

| Vị trí | cta_location | cta_id |
|---|---|---|
| Bản đồ + 9 thẻ tuyến ở trang chủ (PC và mobile dùng chung) | `routes_map` | `route_map_card` |
| Mega Menu ROUTES (PC): tên tuyến | `header_mega_menu` | `route_menu_link` |
| Mega Menu ROUTES (PC): thẻ HA LONG BAY CRUISES / EXPLORE | `header_mega_menu` | `cruise_explore` |
| Menu ROUTES mở rộng (mobile): tên tuyến | `mobile_routes_menu` | `route_menu_link` |
| Menu ROUTES mở rộng (mobile): HA LONG BAY CRUISES / EXPLORE | `mobile_routes_menu` | `cruise_explore` |
| Trang `/routes/`: ảnh tuyến (PC và mobile) | `routes_grid` | `route_card_image` |
| Trang `/routes/`: nút View Route (PC và mobile) | `routes_grid` | `route_card_button` |
| About Us: khu các điểm đến | `about_destinations` | `route_destination_card` |
| Trang tuyến nối tỉnh: khu "Choose Your Route" (thẻ các tuyến khác) | `choose_your_route` | `route_option_card` |

Toàn bộ thẻ HA LONG BAY CRUISES (tiêu đề, mô tả và chữ EXPLORE) là một link duy nhất, nên nhấn vào đâu trên thẻ cũng tính là `cruise_explore`, và chỉ tính một lần.

## Kiểm tra

- Có 2 test tự động trong `tests/cta-tracking.test.mjs`:
  - Cả 17 tuyến (URL mới và URL cũ) cùng trang Cruise được nhận đúng mã.
  - `/routes/`, `#routes` và tuyến không tồn tại không bị tính.
  - Nhấn ảnh trong thẻ chỉ tính một lần.
  - Đang ở Hanoi to Sapa mà chọn Ninh Binh thì `destination_id` là `hanoi_to_ninh_binh`. Bấm lại chính trang đang xem thì không tính.
  - Mọi link tuyến trong mã đều có nhãn.
- Trên dev (1440px), đã bấm mọi link tới trang tuyến / trang Cruise trên 7 trang: trang chủ, `/routes/`, About, Blog, Hanoi to Sapa, Sapa to Halong, Cruise.
  - Số sự kiện bằng số link, trừ link về chính trang đang xem.
  - Không phát nhầm sự kiện khác.
  - `page_type` đúng trang xuất phát.
- Menu ROUTES trên mobile dùng chung danh sách với PC và đã được bấm trong cùng lần kiểm tra. Marketing nên kiểm tra lại trên điện thoại thật bằng GTM Preview.

**Marketing cần tạo mới** biến `destination_type`, `destination_id`, trigger `hlt_destination_select` và tag `destination_select`. Các biến `page_type`, `cta_location`, `cta_id` dùng lại.

# H2-02 – hlt_faq_open (17 trang tuyến + Halong Bay Cruises, PC + mobile)

Bàn giao cho Marketing ngày 24/11/2026.

```js
{ event: "hlt_faq_open", page_type: "route_detail", route_id: "hanoi_to_sapa", faq_id: "all_inclusive_pricing" }
{ event: "hlt_faq_open", page_type: "cruise", route_id: null, faq_id: "cruise_departure_point" }
```

## Cách hoạt động

- Chỉ phát khi **khách tự bấm/chạm** mở một câu đang đóng **và** câu đó thật sự chuyển sang mở. Mỗi lần mở là một sự kiện, cùng một quy tắc trên cả hai loại trang.
- Bấm vào chữ câu hỏi hay vào dấu +/mũi tên đều là cùng một vùng bấm, nên chỉ tính **một** sự kiện.
- **Không phát:**
  - Khi mở trang, cuộn tới hay nhìn thấy khu FAQ.
  - Khi bấm để đóng câu đang mở.
  - Khi câu mở bằng code hay tự khôi phục trạng thái, khi render lại, khi tải lại trang.
  - Khi một câu tự đóng vì khách mở câu khác (trang Cruise mỗi lúc chỉ mở một câu).
- Đóng rồi tự mở lại thì tính thêm một lượt.
- **Cách bắt trên từng loại trang:**
  - **Trang tuyến** dùng thẻ đóng/mở của trình duyệt. Website chỉ tính khi vừa có cú bấm của khách vào câu hỏi **và** trình duyệt báo câu đó đã chuyển sang mở.
  - **Trang Cruise:** sự kiện được phát trong chính hàm mở/đóng câu hỏi, và chỉ cho câu đang đóng được khách bấm mở.
- `page_type`: trang tuyến là `route_detail`, trang du thuyền là `cruise`, đúng giá trị của các sự kiện trước. `route_id` là mã tuyến đang xem; trên trang du thuyền là `null`.
- Không gửi nội dung câu hỏi hay câu trả lời.

## 10 mã faq_id

| faq_id | Câu hỏi | Trang tuyến (8) | Trang Cruise (6) |
|---|---|---|---|
| `booking_confirmation` | How can I book and confirm my booking? | ✓ | ✓ |
| `all_inclusive_pricing` | Is the price all-inclusive? Are there any hidden fees? | ✓ | ✓ |
| `flexible_stops` | Can we make flexible stops along the way? | ✓ | ✓ |
| `payment_deposit` | Do I need to pay a deposit? What payment methods do you accept? | ✓ | ✓ |
| `pickup_flight_delay` | Will I be charged extra if my pickup time changes or my flight is delayed? | ✓ | |
| `luggage_capacity` | There are 5 of us with 6 large suitcases… | ✓ | |
| `custom_itinerary` | Can you plan a personalized itinerary?… | ✓ | |
| `driver_english` | Do your drivers speak English? | ✓ | |
| `hotel_pickup` | Is hotel pickup included? | | ✓ |
| `cruise_departure_point` | Where do cruises depart from? | | ✓ |

- Mã được gắn cố định cho từng câu ngay trong dữ liệu FAQ, nên sửa chữ hay đổi thứ tự câu hỏi cũng không làm đổi mã.
- 17 trang tuyến dùng chung một bộ 8 câu, nên cùng câu luôn cùng mã, chỉ `route_id` thay đổi.

## Kiểm tra

- Có 2 test tự động trong `tests/cta-tracking.test.mjs`:
  - Đủ 8 + 6 câu, đủ 10 mã, không trùng.
  - 4 câu dùng chung mang cùng mã trên cả hai loại trang.
  - Mở → 1 sự kiện; đóng → không phát; mở bằng code → không phát; mở lại sau khi trang vẽ lại → 1 sự kiện mới.
  - Mã lạ bị từ chối.
  - Sự kiện có đúng 4 trường.
- Trên dev, bấm thật trong trình duyệt:
  - **Hanoi to Sapa (1440px) và Hanoi to Ninh Binh (375px):**
    - Đủ 8 câu đúng mã.
    - Mở bằng dấu + → 1 sự kiện; bấm đóng → không phát; mở lại bằng chữ câu hỏi → thêm 1 sự kiện.
    - Mở bằng code → không phát.
    - `route_id` đổi đúng theo tuyến.
  - **Halong Bay Cruises (375px):**
    - Mở trang → 0 sự kiện.
    - Mở `hotel_pickup`, rồi `cruise_departure_point`. Câu trước tự đóng và không bị tính.
    - Bấm đóng → không phát.
    - Bấm mũi tên ở câu dùng chung → `all_inclusive_pricing`.
    - `route_id` là `null`.

**Marketing cần tạo mới** biến `faq_id`, trigger `hlt_faq_open` và tag `faq_open`. Các biến `page_type`, `route_id` dùng lại.
