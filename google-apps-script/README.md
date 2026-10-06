# Booking / feedback: security migration

Code local không tự cập nhật Apps Script, Sheet hoặc Edge Function. **Đừng upload
riêng frontend mới rồi coi form đã chạy.** Test project/Sheet riêng trước; dùng dữ
liệu giả. Bản mới yêu cầu CAPTCHA + proxy + secret + request ID. Theo yêu cầu chủ
sở hữu, Feedback là form mở: người gửi tự nhập Booking ID, chọn sao và nhận xét.
Không cần link mời/token và không xác minh ID có thuộc một booking thật hay không.

## 1. Chuẩn bị Sheet thử và Apps Script

1. Sao lưu Sheet hiện tại. Tạo bản test riêng; giữ Sheet/private ACL, không Publish
   to web và không bật Anyone can view cho Sheet. Chỉ Web App gateway là public.
2. Từ Sheet test, **Extensions → Apps Script**. Copy `Code.gs`.
   Project timezone: Asia/Ho_Chi_Minh.
3. Project Settings → Script properties: SPREADSHEET_ID, SHEET_NAME (đúng tab hiện
   tại, mặc định Bookings), FEEDBACK_SHEET_NAME (mặc định Feedback).
4. Tạo secret ngẫu nhiên **ít nhất 32 byte** bằng password manager/CSPRNG, lưu
   trong kho secrets riêng. Đặt FORMS_PROXY_SECRET bằng cùng giá trị ở Apps Script
   và Edge Function. Không dán vào chat, code, URL, VITE_ hoặc Git. Không dùng giá
   trị fixture trong tests. Secret tối đa 256 ký tự.
5. Tùy chọn FORM_HOURLY_LIMIT: mặc định **100 lần ghi mới/giờ toàn hệ thống**, tối
   đa 5000; mỗi số phone/Booking ID feedback tối đa 5 lần thử mới/giờ. Đây là chính sách
   khởi điểm cần owner duyệt; đừng nâng vô hạn để xử lý lỗi. Không lấy IP từ browser.
6. Chạy `setupSheets` trong editor, cấp quyền cho tài khoản vận hành. Cột Booking
   A–S và Feedback A–D giữ nguyên. Request hợp lệ đầu tiên tạo tab **Form Requests**
   (hoặc FORM_REQUESTS_SHEET_NAME): chỉ ID, fingerprint, trạng thái, giờ, loại form.
   Tab này cũng private; không đổi tên/xóa/ghi tay khi chưa backup/reconcile.
7. Deploy → Web app, Execute as me, Anyone. Lưu URL `/exec` vào **Edge Secrets**
   GOOGLE_FORMS_ENDPOINT. Khi nâng cấp bản cũ: Manage deployments → Edit → **New
   version** → Deploy; không chỉ Save. Endpoint thiếu/sai secret phải trả ok:false.

## 2. Cloudflare Turnstile

1. Tạo widget Turnstile cho hostname **staging cụ thể**; production dùng widget
   riêng cho hoangluxury.travel (và www nếu thật sự dùng).
2. Site key công khai → frontend VITE_TURNSTILE_SITE_KEY. Secret key → Edge Secrets
   TURNSTILE_SECRET_KEY. Không dùng VITE_ cho secret; không dùng test keys trên production.
3. Code widget gửi action booking/feedback. Server gọi Siteverify, kiểm success,
   hostname trùng Origin được phép, action đúng. Token hết hạn hoặc đã dùng phải
   kiểm tra lại; không có bypass khi CAPTCHA/server lỗi.
4. Header CSP mới chỉ thêm script/frame/connect `https://challenges.cloudflare.com`,
   không thêm script unsafe-inline/eval. Merge vào hosting, giữ private/404/noindex
   hiện tại. Test browser Console/Network, VPN/quốc gia được phép trên staging.

## 3. Deploy forms-proxy

1. Supabase Edge Functions → Secrets: GOOGLE_FORMS_ENDPOINT, FORMS_PROXY_SECRET,
   TURNSTILE_SECRET_KEY, FORMS_ALLOWED_ORIGINS (comma-separated exact origins, không
   slash cuối). Production: https://hoangluxury.travel,https://www.hoangluxury.travel;
   bỏ www nếu không dùng. Local/staging cấu hình riêng, không mở localhost production.
2. Deploy function **forms-proxy**, entrypoint `supabase/functions/forms-proxy/index.js`.
   Dashboard editor: copy toàn bộ file vào index.ts. Hoặc CLI nếu đã cài/cấu hình:
   `supabase functions deploy forms-proxy --no-verify-jwt`.
3. Verify JWT gateway tắt cho function này vì form dành cho khách chưa đăng nhập.
   **Không bỏ kiểm tra CAPTCHA, Origin hoặc server secret trong code.** Function
   không dùng service-role/DB key và không đọc dữ liệu khách từ Sheet.
4. Frontend `.env.local` chỉ thêm hai giá trị công khai:

```dotenv
VITE_FORMS_PROXY_URL=https://your-project.supabase.co/functions/v1/forms-proxy
VITE_TURNSTILE_SITE_KEY=YOUR_PUBLIC_SITE_KEY
```

5. Restart Vite hoặc build lại. VITE_BOOKING_SHEET_ENDPOINT cũ không còn dùng; có
   thể bỏ biến cũ sau chuyển đổi. Không ghi server secrets vào frontend env.

## 4. Feedback công khai, không cần link mời

1. Mở `/feedback/` trực tiếp hoặc từ header/footer. Booking ID để trống để người
   gửi tự nhập; không tự điền từ query URL và không đối chiếu với tab Booking.
2. Nhập Booking ID (có thể dùng `test` khi thử), chọn 1–5 sao, viết nhận xét
   tối đa 4000 ký tự, hoàn thành Turnstile rồi bấm **Send Feedback**.
3. Proxy vẫn xác minh CAPTCHA/action/hostname trước khi gọi Apps Script bằng
   server secret. Sheet vẫn Restricted; không mở quyền xem/sửa cho người gửi.
4. Khi nâng cấp từ bản link mời, thay `Code.gs` và Deploy **New version** trước
   khi test lại frontend. Chỉ Save hoặc sửa UI không cập nhật Web App đang chạy.
   URL `/exec`, server secret và cấu hình proxy có thể giữ nguyên.
5. Đây là feedback chưa xác minh khách hàng: CAPTCHA không chứng minh quyền sở
   hữu Booking ID. Giới hạn theo ID là hỗ trợ chống spam, không xác thực danh tính;
   người gửi có thể đổi ID, nên giữ giới hạn toàn hệ thống và kiểm duyệt nội dung.
   ID được trim và chuyển chữ thường khi tạo khóa giới hạn, tối đa 5 lượt mới/giờ.

## 5. Test bắt buộc trước production

- Booking test hợp lệ: nhận success + đúng một hàng ở Booking và ledger done.
- Retry cùng payload/requestId không tạo hàng khác; đổi payload phải dùng ID mới.
- CAPTCHA thiếu/sai hostname/action/expired/reused: từ chối, không tạo đơn.
- Gọi Google endpoint trực tiếp không secret: ok:false, không ghi.
- Feedback không token, Booking ID tự nhập chưa có trong tab Booking: lưu hợp lệ
  sau CAPTCHA. Thiếu ID/nhận xét, sao ngoài 1–5, quá giới hạn: không ghi.
- Retry cùng requestId/payload chỉ ghi một hàng; thay payload nhưng giữ requestId
  bị từ chối. Request mới cùng Booking ID được phép trong giới hạn lượt gửi.
- Google/Edge lỗi, timeout, quota: UI không báo success giả, giữ dữ liệu để retry.
- Sau ghi một phần, ledger **pending** khóa retry tự động: operator kiểm tra hàng
  Sheet và Apps Script Executions, backup rồi chỉ mark done nếu đã ghi đầy đủ. Nếu
  chưa có hàng, sửa nguyên nhân và reconcile thủ công; không xóa pending mù quáng.
- Nhật ký tối đa 10.000 request; tới ngưỡng fail closed. Lên kế hoạch chuyển sang DB
  transactional/archival được review, không xóa ledger vì sẽ mất chống replay.
- Rate subjects tối đa 500/giờ. Theo dõi quota, số pending, failed requests và dung lượng.
  Properties `feedback-token:*` từ bản cũ không còn được đọc; không cần tạo link mời.

## 6. Chuyển production (chỉ khi owner cho phép)

Chuẩn bị secrets/widget/template và test staging trước. Trong khoảng bảo trì,
backup Sheet, nâng Apps Script có secret, deploy proxy đã test, cấu hình/build
frontend và merge CSP, rồi test một đơn giả end-to-end. Không tự public hai domain
khi khách còn yêu cầu private/404/noindex. Không rollback riêng Google về bản không
secret để chữa lỗi; khi chưa hoàn tất, form đóng và WhatsApp là kênh dự phòng.

Google gateway public vẫn tiêu tốn execution quota nếu bị gọi trực tiếp. Secret
bảo vệ dữ liệu ghi, không bảo đảm chống DDoS của gateway; monitoring/quota và khả
năng thay Apps Script bằng backend riêng vẫn cần xác minh hạ tầng. CAPTCHA không
chặn mọi người gửi spam; rate limit và quy trình đối soát vẫn cần vận hành.

Nguồn: [Turnstile client](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/),
[server verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/),
[Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas).
