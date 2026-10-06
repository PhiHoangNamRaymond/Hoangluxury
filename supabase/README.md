# Setup blog một lần: Supabase + Hostinger

Supabase chạy trên cloud. Không cần tải Supabase/Docker, không cần CLI nếu dùng
Dashboard như dưới đây. Code có quản trị, blog công khai, upload ảnh, hẹn lịch,
tạo tài khoản người viết và đổi mật khẩu. Build web không tự tạo DB hay deploy function.
Tài liệu chỉ chứa placeholder; không commit/gửi qua chat mật khẩu hoặc secret key.

**Hệ thống không gửi email nào.** Admin tạo tài khoản kèm mật khẩu ngay trong
trang quản trị rồi chuyển cho người viết. Vì vậy không phải cấu hình SMTP,
không phải sửa mẫu email, không phụ thuộc hộp thư của ai.

## 1. Tạo project

1. Vào [Supabase Dashboard](https://supabase.com/dashboard), đăng nhập/tạo tài khoản.
2. **New project** → organization → tên (ví dụ `hoang-blog`).
3. Đặt database password mạnh, lưu riêng. Đây không phải mật khẩu admin blog.
4. Chọn region và gói phù hợp; đợi khởi tạo. Nên test với project riêng trước.

## 2. Chạy SQL

- **Project mới:** SQL Editor → New query → chạy lần lượt `01-schema.sql`,
  `04-security-hardening.sql`, `05-writer-collaboration.sql`.
- **Đã chạy schema cũ:** sao lưu trước, chạy lần lượt `02-lock-permissions.sql`,
  `03-blog-runtime.sql`, `04-security-hardening.sql`, `05-writer-collaboration.sql`.
  Không xoá bảng để nâng cấp.

Cả năm file chạy lại nhiều lần đều an toàn. Không có lỗi mới tiếp tục. Table Editor
phải có `profiles`, `articles`; Storage phải có `blog-images`. Migration giữ
bài/ảnh/tài khoản. Nếu tự thêm policy khác, rà lại vì các policy cho phép có thể
cộng quyền. SQL không tự chạy khi build.

| Người | Quyền DB |
|---|---|
| Khách | Chỉ bài published đã tới giờ; tên tác giả qua RPC, không email/role |
| Writer active | Đọc và **sửa mọi bài** kể cả nháp người khác; chỉ **xoá bài của mình**; upload/xoá ảnh trong thư mục UUID của mình |
| Khoá/chưa kích hoạt | Không ghi/upload, không đọc nháp của ai kể cả của mình; vẫn đọc bài công khai và hồ sơ mình |
| Admin active | Toàn quyền bài viết kể cả xoá; tạo và quản lý tài khoản qua hàm máy chủ có xác thực |

Writer sửa bài của nhau là **cố ý** — cả nhóm cùng biên tập. Hai ranh giới vẫn
giữ: không xoá bài người khác, và không đổi được trường tác giả (trigger
`articles_lock_author` chặn, vì đổi tác giả là đường vòng để giành quyền xoá).

User mới mặc định `writer, active=false`, không cấp quyền qua metadata.
Bucket ảnh **công khai**, kể cả ảnh dùng trong nháp: không upload ảnh bí mật.
Chỉ nhận JPG/PNG/WebP/GIF tối đa 5 MB, không SVG/HTML.

## 3. Admin đầu tiên

Tài khoản đầu tiên phải tạo tay vì chưa có admin nào để bấm nút.

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

Từ tài khoản này trở đi, mọi tài khoản khác tạo trong giao diện quản trị, kể cả
admin thứ hai. Không phải mở lại SQL Editor nữa.

Trong cấu hình Authentication, tắt **Allow new users to sign up** vì CMS chỉ nhận
người được admin tạo. Giữ đăng nhập email/password. API admin vẫn tạo được user.

## 4. Những thứ KHÔNG cần cấu hình

Hệ thống không gửi email, nên bỏ qua toàn bộ các mục sau:

- **SMTP.** Không cần nhà cung cấp mail, không cần xác minh tên miền gửi.
- **Email templates.** Không cần sửa Invite User hay Reset Password.
- **Redirect URLs.** Không có link email nào quay về web.

Site URL trong Authentication → URL Configuration cứ để `https://hoangluxury.travel`
cho đúng, nhưng không có luồng nào phụ thuộc vào nó.

Mã xử lý link email vẫn còn trong `src/lib/auth-flow.js` và
`src/admin/EmailCallbackScreen.jsx`, hiện không có gì kích hoạt. Nếu sau này
muốn bật lại luồng mời qua email, xem `supabase/email-templates/README.md` —
trong đó có mẫu thư và lời giải thích vì sao không được dùng `{{ .ConfirmationURL }}`.

## 5. Deploy hàm quản lý tài khoản — không cần backend trên Hostinger

Tạo tài khoản và đặt lại mật khẩu cần khoá service_role, không được để trong
trình duyệt, nên hai việc này đi qua một Edge Function.

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
   Tên này giao diện quản trị gọi thẳng, đặt khác là hỏng.
5. Copy toàn bộ `supabase/functions/invite-writer/index.js` thay nội dung mặc định
   `index.ts` trong editor. JavaScript này hợp lệ trong TypeScript; chỉ cần một file.
6. Deploy. Trong cấu hình function, tắt **Verify JWT / Enforce JWT Verification**
   của gateway, tương ứng `verify_jwt=false` trong `supabase/config.toml`.
7. **Không bỏ xác thực trong code:** mỗi POST tự xác minh bearer bằng
   `auth.getUser(token)` rồi tra DB `role=admin, active=true`. Tắt gateway hỗ trợ
   JWT hiện đại/CORS, không mở API cho khách. Không token/không admin trả 401/403.

Hàm nhận hai việc. `action` mặc định là tạo tài khoản: nhận email, họ tên, vai trò
và mật khẩu, gọi `auth.admin.createUser` với `email_confirm` nên tài khoản dùng
được ngay và Supabase không gửi thư xác nhận nào. `action: "reset"` nhận id tài
khoản và mật khẩu mới, gọi `auth.admin.updateUserById`. Mật khẩu do trình duyệt
sinh ngẫu nhiên hoặc admin tự gõ, bắt buộc 15–128 ký tự, đi thẳng vào Auth và
không được ghi lại ở đâu khác — kể cả log của function.

Web tự gọi function của Project URL; không phải dán thêm URL API vào frontend.
Function yêu cầu migration 04: giới hạn 10 tài khoản mỗi admin mỗi giờ, dùng
DB atomic nên không reset khi function khởi động lại. Chưa có migration 04 sẽ
từ chối (503), không tự bỏ qua giới hạn. Request ID/status có trong Function logs;
thay đổi role/active lưu trong bảng riêng `blog_private.role_audit`.
`api/invite-writer.js` chỉ là adapter tuỳ chọn cho Vercel, hiện không có gì gọi tới.
Không upload/cài Node trên Hostinger. Mỗi lần sửa function cần deploy lại.

## 6. Env public và local

Lấy **Project URL** (Connect / Data API tuỳ giao diện) và **Settings → API Keys →
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
upload/commit khoá trước đó, guard này không thu hồi khoá; phải đổi khoá riêng.
Booking/feedback cần cấu hình thêm theo `google-apps-script/README.md`.
Biến VITE_BOOKING_SHEET_ENDPOINT cũ không còn được form sử dụng.

Terminal trong project:

```bash
npm ci
npm test
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
5. Hẹn lịch **ít nhất 10 phút** tới: trước giờ không hiện, sau giờ reload sẽ hiện.
   Trang đang mở kiểm tra lại khoảng mỗi phút; giờ input là múi giờ thiết bị, không cron.
   Đừng hẹn sát quá: mốc giờ trôi qua trong lúc còn đang soạn thì bài lên ngay khi lưu.
   Giao diện sẽ cảnh báo và hỏi lại trước khi lưu trong trường hợp đó.
6. Admin → Tài khoản → điền email và họ tên, chọn vai trò Writer, bấm **Tạo tài khoản**.
   Chép ba dòng trong khung vàng gửi cho người đó. Họ đăng nhập, mở menu tài khoản
   góc phải đổi mật khẩu. Kiểm tra: họ **không** vào được mục Tài khoản.
7. Với tài khoản writer vừa tạo: mở một bài của admin, sửa và lưu được;
   nhưng chỗ nút xoá chỉ hiện dòng chữ giải thích, không có nút đỏ. Mở bài của
   chính họ thì nút xoá xuất hiện.
8. Quên mật khẩu: admin vào mục Tài khoản, bấm **Đặt lại mật khẩu** ở dòng của
   người đó, gửi mật khẩu mới trong khung vàng. Mật khẩu cũ không dùng được nữa.
9. Khoá writer: không ghi/upload được nữa, không mở được nháp của ai nữa, nhưng
   bài họ đã đăng vẫn còn và vẫn ghi đúng tên tác giả. Mở khoá thì viết lại bình thường.
10. Slug lạ có Article not found/noindex, không về home. Static SPA vẫn HTTP 200;
    không phải 404 HTTP thật, cần backend/server routing nếu yêu cầu strict 404.

Tests repo dùng DB trong bộ nhớ/mock API, không xác nhận Auth thật.
Sau setup phải test live bằng tài khoản/dữ liệu thử, không thông tin khách thật.

## 8. Build/upload web chính `.travel`

```bash
npm test
npm run build
```

Build lấy snapshot **bài công khai** để sinh HTML SEO/sitemap. Nếu có env Supabase
nhưng DB lỗi, build báo lỗi: không upload dist của lần lỗi đó. Không dùng secret
key để build. Bài đăng mới vẫn hiện runtime ngay không cần upload lại; riêng
HTML SEO server-side, sitemap/link preview cần **build/upload lại** để cập nhật.
Bài hẹn lịch tự lên web đúng giờ với người đọc, nhưng HTML SEO riêng của bài đó
chỉ có sau lần build kế tiếp. Đây không phải SSR, không đảm bảo Google tự index.

Hostinger → Websites → **hoangluxury.travel** → File Manager: sao lưu bản cũ,
upload **nội dung bên trong dist/** vào document root (thường public_html), không
tạo public_html/dist. Giữ SPA fallback `.htaccess` cho admin/URL bài trực tiếp.
Không upload env/src/node_modules/secret key/cả repo.

Nếu đang dùng private/404/noindex riêng theo yêu cầu khách, giữ và đối chiếu
cấu hình trước upload; đừng vô tình public web. CMS không đổi DNS, redirect
`.com`, Cloudflare hay private/noindex. Chặn IP/quốc gia có thể chặn cả truy cập
trang quản trị: test bằng mạng được phép.

## Gỡ lỗi

| Lỗi | Kiểm tra |
|---|---|
| Chưa cấu hình | Hai env public, restart Vite/rebuild |
| Không hồ sơ/đã khoá | Tạo user sau SQL? Profile/role/active đúng? |
| Blog lỗi thiếu reading_minutes/RPC | SQL mới hoặc 02 rồi 03? Data API bật/schema public exposed? |
| Writer không mở được bài người khác | Đã chạy `05-writer-collaboration.sql` chưa? |
| Writer xoá được bài người khác | Policy lạ cộng thêm quyền DELETE; rà `pg_policies` trên `public.articles` |
| Tạo tài khoản báo 401 gateway | Verify JWT đã tắt, có bearer phiên user (không phải publishable key)? |
| CORS/không gọi được function | Tên đúng `invite-writer`, origin nằm trong `BLOG_ALLOWED_ORIGINS`, đã deploy bản mới |
| Tạo tài khoản báo 503 | Chưa chạy migration 04 (thiếu `consume_blog_invite`), hoặc thiếu `BLOG_SERVER_KEY` |
| Tạo tài khoản báo 429 | Quá 10 tài khoản trong một giờ của cùng admin; đợi hoặc dùng admin khác |
| Email đã có tài khoản (409) | Dùng nút Đặt lại mật khẩu thay vì tạo mới |
| Bài hẹn lịch lên sớm | Giờ hẹn đã trôi qua lúc bấm lưu; đối chiếu `publish_at` với `updated_at` trong DB |
| Upload lỗi | JPG/PNG/WebP/GIF ≤5 MB, active, bucket/policy |
| URL bài trả server 404 | SPA fallback và upload đúng root |

Gitignore không xoá bí mật đã commit; nếu lộ, đổi/thu hồi và xử lý lịch sử riêng.
Các mẫu blog Markdown cũ đã đưa ra khỏi project; viết/đăng bằng CMS tại `/admin/`.
Vẫn cần sự đồng ý chủ sở hữu trước khi public source/nội dung/ảnh.

Tài liệu chính thức: [Edge Functions Dashboard](https://supabase.com/docs/guides/functions/quickstart-dashboard),
[API keys](https://supabase.com/docs/guides/api/api-keys),
[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[Supabase production checklist](https://supabase.com/docs/guides/deployment/going-into-prod).
