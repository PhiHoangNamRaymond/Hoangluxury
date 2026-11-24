# Publish hoangluxury.travel trên Hostinger

## Bản upload

Chạy `npm run release:hostinger` trong thư mục project trên Windows.
File được tạo trong `releases/<thời điểm>/`, tên chính xác:

`Private Car Transfer Hoang Luxury Travel Official Code.zip`

Đây là **bản website đã build để upload**, không phải toàn bộ repository.
ZIP chứa trực tiếp `index.html`, `.htaccess`, `assets/`, các trang và sitemap.
Không đổi tên `index.html` thành tên dài trên. Không upload `.env`, `src/`,
`node_modules/`, Git, SQL hoặc mã Apps Script vào `public_html`.
`release-manifest.json` nằm ngoài ZIP để đối chiếu SHA-256, không cần upload.
Mỗi lần đóng gói tạo thư mục mới, không ghi đè bản phát hành trước.
ZIP được tạo với dấu `/` cho mọi đường dẫn và đối chiếu toàn bộ danh sách file
với `dist`. Không dùng bản ZIP cũ trong `2026-10-30T08-20-02.994Z`: bản đó có
đường dẫn Windows `\` gây lỗi thư mục khi giải nén trên Hostinger/Linux.

## 1. Chuẩn bị trước khi thay website/DNS

1. Xác nhận website `hoangluxury.travel` đã được thêm đúng gói hosting trong hPanel.
   Dùng website PHP/HTML, không dùng Website Builder cho bộ file này.
2. Sao lưu toàn bộ website cũ, `.htaccess` và database cũ nếu có. Lưu bản sao
   **ngoài public_html**. Ghi lại các bản ghi DNS trước khi đổi; giữ nguyên MX,
   SPF, DKIM, DMARC và các bản ghi dịch vụ email. Không xoá website/DB cũ khi chưa có backup.
3. Lấy đúng IPv4 hosting từ hPanel; không dùng IP ví dụ trên mạng hay IP cũ của Vercel.
4. Mở Cloudflare/DNS của tên miền để xác nhận nhà cung cấp nameserver hiện tại.
   Chưa đổi DNS hoặc bật chặn quốc gia khi chưa kiểm tra xong các bước dưới.

## 2. Upload bằng File Manager

Trong hPanel → Websites → Manage/Dashboard của đúng tên miền → Files → File Manager:

1. Mở đúng `public_html` của website. Nếu đã có nội dung, dừng để kiểm tra backup
   và phạm vi thay thế; không xoá hàng loạt các thư mục tên miền khác.
2. Upload file ZIP, giải nén để `public_html/index.html` và
   `public_html/.htaccess` tồn tại trực tiếp. Không tạo thêm lớp `dist/` hoặc thư mục tên ZIP.
3. Bật hiển thị file ẩn để kiểm tra `.htaccess` đã có. Nó chứa chuyển hướng URL cũ,
   chống lộ file nguồn, SPA fallback và security headers; không bỏ file này.
4. Sau khi giải nén và xác nhận cấu trúc đúng, xoá riêng file ZIP vừa upload trên
   hosting; vẫn giữ bản local để rollback.
5. Nếu trang cũ có `index.php`, không tự xoá: chuyển nó vào bản backup ngoài webroot
   khi đã xác nhận đây là website cần thay. `DirectoryIndex index.html` đã được cấu hình.

Tham khảo [hướng dẫn upload của Hostinger](https://www.hostinger.com/support/how-to-upload-a-website-from-backups/).

## 3. Tên miền, HTTPS và các dịch vụ ngoài hosting

- Nếu dùng Cloudflare DNS: trỏ A của `@` về IPv4 Hostinger, CNAME `www` về
  `hoangluxury.travel`. Kiểm tra bản ghi AAAA cũ; chỉ giữ IPv6 đúng của hosting.
  Website trên domain khác/record email không nằm trong phạm vi thay đổi này.
- Bật chứng chỉ HTTPS hợp lệ cho tên miền tại Hostinger trước khi đặt Cloudflare
  SSL/TLS thành **Full (strict)**. Không dùng Flexible để chữa lỗi SSL.
- Khi HTTPS hoạt động, bật Always Use HTTPS/Force HTTPS. `www` đã có redirect về apex
  trong `.htaccess`. Không bật Cache Everything cho `/admin/` hoặc dữ liệu riêng.
- Turnstile: thêm `hoangluxury.travel` và `www.hoangluxury.travel` vào hostname của
  widget đang dùng, không đổi secret/site key đang hoạt động nếu không cần.
- Booking/feedback (và log lỗi tab Errors) gửi tới `https://hoangluxury.travel/api/forms`,
  do **Cloudflare Worker** `hlt-booking-forms` xử lý (cloudflare/wrangler.toml), không phải
  Hostinger. Vì vậy hai record web phải để **Proxied** (đám mây cam); tắt proxy thì
  `/api/forms` rơi xuống Hostinger và bị `.htaccess` chặn 403. Khi build, `.env.local` phải có
  `VITE_FORMS_PROXY_URL=https://hoangluxury.travel/api/forms`.
- Tạo/đặt lại tài khoản blog gọi Supabase Edge Function `invite-writer`; giữ
  `BLOG_ALLOWED_ORIGINS` gồm `https://hoangluxury.travel`, `https://www.hoangluxury.travel`.
  Không có dấu `/` cuối hay wildcard. Không cần chạy thư mục `api/` trên Hostinger.
  Không copy khóa server vào frontend.
- Giá trị `VITE_*` được đóng vào JS lúc build. Đổi `.env.local` sau khi upload
  không đổi website đang chạy: phải build và upload lại.
- Nếu test qua tên miền tạm Hostinger, form có thể bị CORS/Turnstile từ chối vì
  origin tạm chưa được cho phép; không sửa thành `*` để bỏ qua kiểm tra.

Tham khảo [trỏ domain tới Hostinger](https://support.hostinger.com/en/articles/1863967-how-to-point-a-domain-to-hostinger),
[Cloudflare proxy](https://developers.cloudflare.com/dns/proxy-status/),
[Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/).

## 4. Chặn sáu quốc gia bằng Cloudflare Worker — đã bật 25/11/2026

Chặn toàn bộ VN, CN, HK, LA, KH, MM theo lựa chọn mới của chủ website;
**không có ngoại lệ IP quản trị**. Dùng VPN ngoài sáu quốc gia để vào website
và /admin/. Các dashboard Hostinger/Cloudflare vẫn truy cập riêng.

Worker hlt-booking-forms nay bao phủ hoangluxury.travel/* và
www.hoangluxury.travel/*, kiểm tra request.cf.country trước khi phục vụ
website hoặc xử lý /api/forms. Khách bị chặn nhận HTTP 403 và ảnh
/unavailable/Maintenance%20HLT.png, không cache/noindex. Chỉ ảnh thông báo
được miễn chặn để trang hiển thị được; không miễn trang admin hoặc API.

Giữ ảnh trong public/unavailable/ và trên hosting. Khi sửa Worker phải deploy
riêng; build/upload ZIP không cập nhật Worker. Giữ Cloudflare proxy, Full (strict),
secrets của form và rate limiting. Không bật lại rule WAF cũ "Block Vietnam"
vì sẽ thay trang ảnh bằng màn hình chặn mặc định.

Xem [cấu hình, kiểm tra và rollback](cloudflare/COUNTRY-BLOCKING.md).
Chặn chỉ áp dụng qua Cloudflare của hai hostname trên; không tự chặn IP origin,
Vercel cũ hay endpoint Supabase. Vị trí IP có thể thay đổi bằng VPN.

## 5. Hạn chế copy và kiểm tra sau publish

Nội dung công khai được hạn chế menu chuột phải, kéo ảnh/văn bản, và copy thông
thường. Form, soạn thảo admin, link và thông tin liên hệ vẫn thao tác được.
Theo yêu cầu chủ website (25/11/2026) chặn thêm phím tắt F12, Ctrl+Shift+I/J/C, Ctrl+U;
không phá điều hướng bàn phím khác, không che nội dung SEO.
Đây không phải DRM: không ngăn được screenshot, DevTools, request trực tiếp
hoặc công cụ tắt JS. Có thể dùng watermark để tăng nhận diện quyền sở hữu.

Trước và sau khi bật chặn quốc gia, kiểm tra:

- Home, routes, album, blog, ảnh miền Bắc và các đường dẫn cũ redirect đúng.
- Mở trực tiếp `/booking/`, `/feedback/`, `/admin/`; reload không 404 hay 500.
- Gửi booking/feedback bằng dữ liệu test đã thống nhất, xác nhận Sheet và popup.
- Admin đăng nhập/soạn bài/copy-paste/upload ảnh hoạt động; bài nháp không công khai.
- HTTPS, canonical, sitemap và meta đúng `https://hoangluxury.travel`.
- `/admin/` có `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow`.
- `.env`, source và ZIP không phục vụ ra ngoài. Không dựa vào robots.txt để giữ bí mật.
- Không còn đường công khai Vercel cũ nếu muốn mọi khách đi qua lớp WAF mới;
  xử lý deployment cũ riêng sau khi domain chính ổn định, không tắt trước.

Rollback: xem cloudflare/COUNTRY-BLOCKING.md để khôi phục Worker nếu cần;
khôi phục bản phát hành/backup website
trước hoặc DNS đã ghi lại. Không xoá dữ liệu Supabase/Sheet để rollback frontend.
