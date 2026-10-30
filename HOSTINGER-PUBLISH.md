# Publish hoangluxury.travel trên Hostinger

## Bản upload

Chạy `npm run release:hostinger` trong thư mục project trên Windows.
File được tạo trong `releases/<thời điểm>/`, tên chính xác:

`Private Car Transfer From Hanoi Or Noi Bai Airport Hoang Luxury Travel Official Code.zip`

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
- Supabase Secrets: giữ các origin đang dùng hợp lệ và thêm
  `https://hoangluxury.travel`, `https://www.hoangluxury.travel` vào
  `FORMS_ALLOWED_ORIGINS`, `BLOG_ALLOWED_ORIGINS`. Không có dấu `/` cuối hay wildcard.
- Booking/feedback và tạo tài khoản blog vẫn gọi Supabase Edge Functions;
  không cần chạy thư mục `api/` trên Hostinger. Không copy khóa server vào frontend.
- Giá trị `VITE_*` được đóng vào JS lúc build. Đổi `.env.local` sau khi upload
  không đổi website đang chạy: phải build và upload lại.
- Nếu test qua tên miền tạm Hostinger, form có thể bị CORS/Turnstile từ chối vì
  origin tạm chưa được cho phép; không sửa thành `*` để bỏ qua kiểm tra.

Tham khảo [trỏ domain tới Hostinger](https://support.hostinger.com/en/articles/1863967-how-to-point-a-domain-to-hostinger),
[Cloudflare proxy](https://developers.cloudflare.com/dns/proxy-status/),
[Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/).

## 4. Chặn IP Việt Nam, ngoại lệ IP quản trị — chưa tự động bật

Người dùng đã chọn: chặn các IP được xác định ở Việt Nam, **trừ IP công khai cố định
của quản trị viên**. IP LAN như `192.168.x.x` không dùng được. Cần xác định IP public
của mạng người quản trị, không lấy IP máy chủ Hostinger làm ngoại lệ. Nếu dùng IPv6, cần
xác nhận cả IP/khối IPv6 ổn định. Đổi mạng/4G/VPN có thể đổi IP và bị chặn.

Thực hiện trên Cloudflare WAF **Custom rules**, không làm bằng JS trình duyệt,
không tin header quốc gia do client tự gửi tới origin, và không mở ngoại lệ chỉ
dựa trên URL `/admin/` vì ai cũng gõ được URL đó.

1. Giữ hPanel/Cloudflare dashboard đang đăng nhập để có đường tắt rule khi cần.
2. Xác nhận DNS domain thực sự qua Cloudflare, hai record web bật **Proxied**.
3. Tạo custom IP list `hlt_admin_ips`, thêm IP quản trị thật và kiểm tra lại.
   Không commit IP hoặc token Cloudflare vào Git. Nếu tài khoản không có list,
   dùng bộ dựng rule `IP Source Address is not in` với các IP thật tương đương.
4. Tạo custom rule, action **Block**, với logic:

```text
(http.host in {"hoangluxury.travel" "www.hoangluxury.travel"}
 and ip.src.country eq "VN"
 and not ip.src in $hlt_admin_ips)
```

Chỉ dùng biểu thức sau khi list thật đã tồn tại; đây không phải rule đã được triển khai.
Ngoại lệ nằm **trong cùng rule chặn**, không phải một rule Allow/Skip rộng bỏ qua các bảo vệ khác.
5. Kiểm tra từ IP quản trị: home và `/admin/` phải vào được; từ một mạng Việt Nam
   khác phải bị block; từ mạng ngoài Việt Nam phải vào được. Nếu lỗi, disable rule
   trong Cloudflare dashboard, không xoá cơ chế đăng nhập admin.

WAF chỉ bảo vệ traffic đi qua Cloudflare. Domain tạm Hostinger, IP origin, URL
Vercel cũ hoặc endpoint Supabase không tự được rule này bảo vệ. Hạn chế đường
truy cập vòng qua origin cần kiểm tra khả năng firewall của gói Hostinger và
không được làm hỏng SSL/health checks; không coi rule trên là chặn tuyệt đối.
Phân loại theo IP có thể sai hoặc bị thay đổi bằng VPN. Kiểm tra lại Search Console
và chiến dịch quảng cáo sau khi bật vì crawler/đội marketing ở Việt Nam cũng có thể bị chặn.

Tham khảo [Cloudflare country rule](https://developers.cloudflare.com/waf/custom-rules/use-cases/block-traffic-from-specific-countries/),
[IP allowlist](https://developers.cloudflare.com/waf/custom-rules/use-cases/allow-traffic-from-ips-in-allowlist/).

## 5. Hạn chế copy và kiểm tra sau publish

Nội dung công khai được hạn chế menu chuột phải, kéo ảnh/văn bản, và copy thông
thường. Form, soạn thảo admin, link và thông tin liên hệ vẫn thao tác được.
Không chặn F12, không phá điều hướng bàn phím, không che nội dung SEO.
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

Rollback: disable rule WAF nếu tự khoá, khôi phục bản phát hành/backup website
trước hoặc DNS đã ghi lại. Không xoá dữ liệu Supabase/Sheet để rollback frontend.
