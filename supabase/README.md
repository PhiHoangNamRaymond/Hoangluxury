# Setup blog một lần: Supabase + Hostinger

Supabase chạy trên cloud. Không cần tải Supabase/Docker, không cần CLI nếu dùng
Dashboard như dưới đây. Code có quản trị, blog công khai, upload ảnh, hẹn lịch,
mời writer và đặt/đổi mật khẩu. Build web không tự tạo DB hay deploy function.
Tài liệu chỉ chứa placeholder; không commit/gửi qua chat mật khẩu hoặc secret key.

## 1. Tạo project

1. Vào [Supabase Dashboard](https://supabase.com/dashboard), đăng nhập/tạo tài khoản.
2. **New project** → organization → tên (ví dụ `hoang-blog`).
3. Đặt database password mạnh, lưu riêng. Đây không phải mật khẩu admin blog.
4. Chọn region và gói phù hợp; đợi khởi tạo. Nên test với project riêng trước.

## 2. Chạy SQL

- **Project mới:** SQL Editor → New query → copy toàn bộ `01-schema.sql` → Run,
  sau đó chạy `04-security-hardening.sql`.
- **Đã chạy schema cũ:** sao lưu trước, chạy lần lượt `02-lock-permissions.sql`
  rồi `03-blog-runtime.sql`, cuối cùng `04-security-hardening.sql`. Không xóa bảng để nâng cấp.

Không có lỗi mới tiếp tục. Table Editor phải có `profiles`, `articles`; Storage
phải có `blog-images`. Migration giữ bài/ảnh/tài khoản. Nếu tự thêm policy khác,
rà lại vì các policy cho phép có thể cộng quyền. SQL không tự chạy khi build.

| Người | Quyền DB |
|---|---|
| Khách | Chỉ bài published đã tới giờ; tên tác giả qua RPC, không email/role |
| Writer active | Thêm/sửa/xóa bài mình; upload/xóa ảnh thư mục UUID mình |
| Khóa/chưa kích hoạt | Không ghi/upload/đọc nháp; vẫn đọc bài công khai/trạng thái hồ sơ mình |
| Admin active | Quản lý bài/tài khoản; mời qua server có xác thực |

User mới mặc định `writer, active=false`, không cấp quyền qua metadata.
Bucket ảnh **công khai**, kể cả ảnh dùng trong nháp: không upload ảnh bí mật.
Chỉ nhận JPG/PNG/WebP/GIF tối đa 5 MB, không SVG/HTML.

## 3. Admin đầu tiên

1. Sau SQL, Authentication → Users → Add user / Create new user.
2. Điền email thật, mật khẩu riêng 15+ ký tự, bật Auto Confirm User nếu có.
3. SQL Editor → New query, thay email/tên mẫu rồi chạy:

```sql
update public.profiles
set role = 'admin', active = true, full_name = 'Tên người quản trị'
where email = 'admin@example.com'
returning id, role, active;
```

Phải trả đúng 1 dòng admin/active=true. Nếu 0 dòng, kiểm tra email và trigger.
Không commit kết quả chứa email thật. Rà admin cũ: `select id, email, role, active
from public.profiles where role='admin';` — migration không đoán ai là admin thật.

Trong cấu hình Authentication, tắt **Allow new users to sign up** vì CMS chỉ nhận
người được mời. Giữ đăng nhập email/password. API admin vẫn tạo/mời được user.

## 4. URL email và SMTP

Authentication → URL Configuration:

- Site URL: `https://hoangluxury.travel`.
- Redirect URLs: thêm từng dòng, rồi lưu:

```text
https://hoangluxury.travel/admin/
https://hoangluxury.travel/admin/?type=invite
https://hoangluxury.travel/admin/?type=recovery
```

Nếu dùng www thì thêm cùng ba URL cho origin đó. Local/staging dùng project
riêng với origin/port cụ thể, không thêm localhost vào project production.
Không thêm `.com` nếu khách không dùng. Không dùng wildcard rộng production.

Trong Authentication → Email / SMTP Settings, cấu hình **custom SMTP** để mời
người ngoài organization và reset ổn định. Điền thông tin nhà cung cấp mail,
sender email/name, xác minh miền gửi. Password SMTP chỉ lưu trên Supabase.
Email mặc định bị giới hạn người nhận/tốc độ, không coi là SMTP production.

**Bắt buộc thay email templates trước khi dùng bản web mới.** Trong Authentication
→ Email Templates, thay link chính của cả Invite User và Reset Password bằng:

```html
<a href="{{ .RedirectTo }}&amp;token_hash={{ .TokenHash }}">Confirm your email link</a>
```

Function mời gửi RedirectTo `/admin/?type=invite`; quên mật khẩu gửi
`/admin/?type=recovery`. Template trên giữ query `type` rồi thêm TokenHash.
Chỉ gửi email qua hai luồng này; lời mời tạo tay trong Dashboard có thể thiếu
RedirectTo/query đúng. Không thay bằng link thiếu token hoặc dùng ConfirmationURL
kiểu cũ (fragment access_token) — bản mới chủ động từ chối kiểu đó.

Web không tự đăng nhập từ URL. Người nhận bấm kiểm tra link; Supabase xác minh
token một lần trong client không persist, rồi web hiển thị **email tài khoản**.
Chỉ khi xác nhận đúng tài khoản mới đổi phiên/đặt mật khẩu. Bấm Huỷ giữ phiên cũ;
link đã kiểm tra có thể đã dùng, xin email mới. Token bị xóa khỏi thanh địa chỉ.
Reload giữa chừng không giữ quyền đặt mật khẩu; yêu cầu link mới nếu cần.

Trong Auth password settings, bật yêu cầu **current password** cho thay đổi từ
phiên đăng nhập thông thường nếu project hỗ trợ. Web gửi current_password nhưng
backend vẫn phải enforce; test recovery/invite hợp lệ có hoạt động với setting này.
Không coi frontend reauthentication hoặc secure-change ngoại lệ phiên mới <24h
là bằng chứng backend luôn yêu cầu mật khẩu cũ. Test riêng project staging trước.

## 5. Deploy mời writer — không cần backend trên Hostinger

1. Settings → API Keys: lấy **secret key** (`sb_secret_…`); không gửi qua chat.
2. Edge Functions → Secrets: thêm `BLOG_SERVER_KEY` bằng secret key trên.
   Service-role legacy cũng dùng được, tuyệt đối không đưa vào biến `VITE_`.
3. Thêm `BLOG_ALLOWED_ORIGINS`, giá trị một dòng:

```text
https://hoangluxury.travel,https://www.hoangluxury.travel
```

   Bỏ www nếu không dùng, không có `/` cuối. Dev/staging dùng cấu hình function
   riêng; không thêm localhost vào production.
4. Edge Functions → Deploy a new function → Via Editor; đặt tên **invite-writer**.
5. Copy toàn bộ `supabase/functions/invite-writer/index.js` thay nội dung mặc định
   `index.ts` trong editor. JavaScript này hợp lệ trong TypeScript; chỉ cần một file.
6. Deploy. Trong cấu hình function, tắt **Verify JWT / Enforce JWT Verification**
   của gateway, tương ứng `verify_jwt=false` trong `supabase/config.toml`.
7. **Không bỏ xác thực trong code:** mỗi POST tự xác minh bearer bằng
   `auth.getUser(token)` rồi tra DB `role=admin, active=true`. Tắt gateway hỗ trợ
   JWT hiện đại/CORS, không mở API mời cho khách. Không token/admin phải trả 401/403.

Web tự gọi function của Project URL; không phải dán thêm URL API vào frontend.
Function mới yêu cầu migration 04: giới hạn 10 lần mời mỗi admin mỗi giờ, dùng
DB atomic nên không reset khi function khởi động lại. Chưa có migration sẽ từ
chối gửi email (503), không tự bỏ qua giới hạn. Request ID/status có trong Function
logs; thay đổi role/active được lưu trong bảng riêng `blog_private.role_audit`.
`api/invite-writer.js` chỉ là adapter tùy chọn cho Vercel. Không upload/cài Node
trên Hostinger. Mỗi lần sửa function cần deploy lại; lưu nguồn trong repo.

## 6. Env public và local

Lấy **Project URL** (Connect / Data API tùy giao diện) và **Settings → API Keys →
Publishable key**. Anon legacy cũng được. Trong `.env.local` ở gốc project,
giữ biến catalog đang có, thêm:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY
```

Tên biến ANON_KEY có thể chứa `sb_publishable_…`. Không điền secret/service-role
hoặc database password. Hai giá trị public nằm trong bundle theo thiết kế; RLS
mới là bảo mật. Không đưa `BLOG_SERVER_KEY` vào frontend env.
Build có bước chặn secret/service-role key trước khi Vite sinh bundle. Nếu đã
upload/commit khóa trước đó, guard này không thu hồi khóa; phải đổi khóa riêng.
Booking/feedback mới cần cấu hình thêm theo `google-apps-script/README.md`.
Biến VITE_BOOKING_SHEET_ENDPOINT cũ không còn được form sử dụng.

Terminal trong project:

```bash
npm ci
npm run test:blog
npm run dev
```

Nếu đã chạy Vite trước khi đổi env, Ctrl+C rồi chạy lại. Mở
`http://localhost:5173/admin/`, đăng nhập admin bước 3.
Nếu port 5173 đang bận, dừng server cũ hoặc chạy chính xác:
`node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort`.

## 7. Test cả luồng

1. Viết bài, body/tóm tắt/slug, upload bìa, chọn tags; Lưu nháp, mở lại kiểm tra.
2. Preview: tiêu đề/in đậm/link/ảnh đúng; HTML thực thi bị lọc cả preview/public.
3. Mở blog/URL nháp cửa sổ riêng tư: nháp không hiện. Blog public dùng client anon
   riêng, kể cả admin đang đăng nhập.
4. Đăng bài, reload blog; tìm kiếm/lọc/thẻ bài/link trực tiếp và tên tác giả đúng.
5. Hẹn lịch vài phút tới: trước giờ không hiện, sau giờ reload sẽ hiện. Trang đang
   mở kiểm tra lại khoảng mỗi phút; giờ input là múi giờ thiết bị, không cron.
6. Admin → Tài khoản → mời email mới làm Writer. Họ bấm email, kiểm tra link và
   xác nhận đúng email hiển thị, đặt mật khẩu 15+
   ký tự hai lần, vào quản trị; không quản lý account/sửa bài người khác.
7. Khóa writer: không ghi/upload được nữa, bài đã đăng còn. Mở khóa thì viết lại.
8. Đổi mật khẩu (cần mật khẩu hiện tại); logout/login mới. Thử Quên mật khẩu →
   email → đặt lại → logout/login bằng mật khẩu mới.
9. Slug lạ có Article not found/noindex, không về home. Static SPA vẫn HTTP 200;
   không phải 404 HTTP thật, cần backend/server routing nếu yêu cầu strict 404.

Tests repo dùng DB trong bộ nhớ/mock API, không xác nhận SMTP/Auth/email thật.
Sau setup phải test live bằng tài khoản/dữ liệu thử, không thông tin khách thật.

## 8. Build/upload web chính `.travel`

```bash
npm run test:blog
npm run build
```

Build lấy snapshot **bài công khai** để sinh HTML SEO/sitemap. Nếu có env Supabase
nhưng DB lỗi, build báo lỗi: không upload dist của lần lỗi đó. Không dùng secret
key để build. Bài đăng mới vẫn hiện runtime ngay không cần upload lại; riêng
HTML SEO server-side, sitemap/link preview cần **build/upload lại** để cập nhật.
Đây không phải SSR, không đảm bảo Google tự index hoặc tự đổi tên miền.

Hostinger → Websites → **hoangluxury.travel** → File Manager: sao lưu bản cũ,
upload **nội dung bên trong dist/** vào document root (thường public_html), không
tạo public_html/dist. Giữ SPA fallback `.htaccess` cho admin/URL bài trực tiếp.
Không upload env/src/node_modules/secret key/cả repo.

Nếu đang dùng private/404/noindex riêng theo yêu cầu khách, giữ và đối chiếu
cấu hình trước upload; đừng vô tình public web. CMS không đổi DNS, redirect
`.com`, Cloudflare hay private/noindex. Chặn IP/quốc gia có thể chặn cả email
callback: test bằng mạng được phép.

## Gỡ lỗi

| Lỗi | Kiểm tra |
|---|---|
| Chưa cấu hình | Hai env public, restart Vite/rebuild |
| Không hồ sơ/đã khóa | Tạo user sau SQL? Profile/role/active đúng? |
| Blog lỗi thiếu reading_minutes/RPC | SQL mới hoặc 02 rồi 03? Data API bật/schema public exposed? |
| Invite 401 gateway | Verify JWT đã tắt, có bearer phiên user (không phải publishable key)? |
| CORS/không gọi function | Tên invite-writer, allowed origin, đã deploy |
| Không nhận email | SMTP, sender xác minh, spam, Auth logs, hạn mức |
| Link sai/hết hạn | Template TokenHash, RedirectTo đúng origin/port/query type; xin link mới |
| Email gửi nhưng activation lỗi | Kiểm tra Auth users/profiles; kích hoạt đúng user, không mời lại liên tục |
| Upload lỗi | JPG/PNG/WebP/GIF ≤5 MB, active, bucket/policy |
| URL bài trả server 404 | SPA fallback và upload đúng root |

Gitignore không xóa bí mật đã commit; nếu lộ, đổi/thu hồi và xử lý lịch sử riêng.
Các mẫu blog Markdown cũ đã đưa ra khỏi project; viết/đăng bằng CMS tại `/admin/`.
Vẫn cần sự đồng ý chủ sở hữu trước khi public source/nội dung/ảnh.

Tài liệu chính thức: [Edge Functions Dashboard](https://supabase.com/docs/guides/functions/quickstart-dashboard),
[API keys](https://supabase.com/docs/guides/api/api-keys),
[Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls),
[SMTP](https://supabase.com/docs/guides/auth/auth-smtp),
[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
