# Email mời và đặt lại mật khẩu

> **Hiện không dùng tới.** Hệ thống đã chuyển sang cách admin tự tạo tài khoản kèm
> mật khẩu trong mục **Tài khoản** của trang quản trị, không gửi email nào cả.
> Thư mục này giữ lại phòng khi sau này muốn bật lại luồng mời qua email —
> khi đó phần giải thích ở cuối file vẫn đúng và vẫn cần thiết.

Hai file HTML trong thư mục này là nội dung thư gửi cho người viết bài.
Dán chúng vào Supabase → **Authentication → Emails → Templates**.

Supabase khoá phần sửa mẫu cho tới khi khai SMTP riêng, nên làm theo đúng thứ tự dưới đây.

---

## 1. Khai SMTP bằng Gmail

Dùng luôn hộp thư công ty, không phải đăng ký dịch vụ nào khác.

**Chuẩn bị mật khẩu ứng dụng**

1. Đăng nhập tài khoản Google đó → bật **Xác minh 2 bước**
   (bắt buộc; chưa bật thì Google không cho tạo mật khẩu ứng dụng)
2. Vào `myaccount.google.com/apppasswords` → tạo một mật khẩu, đặt tên `Supabase`
3. Google trả về chuỗi **16 ký tự** — chép lại ngay, đóng cửa sổ là không xem lại được

**Điền vào Supabase**

Supabase → **Authentication → Emails → SMTP Settings** → bật **Enable Custom SMTP**:

| Ô | Giá trị |
|---|---|
| Sender email | chính địa chỉ Gmail đó (Gmail không cho gửi thay địa chỉ khác) |
| Sender name | `Hoang Luxury Travel` |
| Host | `smtp.gmail.com` |
| Port | `465` |
| Username | địa chỉ Gmail đầy đủ |
| Password | chuỗi 16 ký tự ở trên (**không** phải mật khẩu đăng nhập Gmail) |

Giới hạn Gmail thường khoảng 500 thư/ngày — thừa cho việc mời vài tài khoản.

Sau khi lưu, vào **Authentication → Rate Limits** nâng *Rate limit for sending emails*
lên cho thoải mái — mức mặc định của SMTP dựng sẵn rất thấp.

**Về chuyện vào thư rác:** gửi vài thư mời một tháng không khiến Google khoá tài khoản.
Rủi ro duy nhất là lần đầu thư rơi vào mục Spam của người nhận. Bảo họ kiểm tra mục đó
và bấm "Không phải thư rác" một lần, các lần sau sẽ vào hộp thư chính.

Nếu sau này cần gửi nhiều hơn hoặc muốn thư hiện từ `no-reply@hoangluxury.travel`,
hãy chuyển sang dịch vụ gửi thư giao dịch như Brevo (miễn phí 300 thư/ngày) —
chỉ việc thay bốn ô Host/Port/Username/Password, mẫu email giữ nguyên.

---

## 2. Khai danh sách địa chỉ được phép quay về

**Bắt buộc**, không có bước này thì mẫu email sẽ hỏng.

Supabase → **Authentication → URL Configuration → Redirect URLs**, thêm:

```
http://localhost:5173/admin/**
https://hoangluxury.travel/admin/**
https://www.hoangluxury.travel/admin/**
```

Thêm cả địa chỉ Vercel nếu đang test ở đó.

Lý do: mẫu email dùng biến `{{ .RedirectTo }}`. Nếu địa chỉ đích không nằm trong danh
sách này, Supabase âm thầm thay nó bằng Site URL, và đường dẫn trong thư sẽ sai định dạng.

---

## 3. Dán mẫu email

Tab **Templates**, sửa hai mục:

**Invite user**
- Subject: `Lời mời viết bài cho Hoang Luxury Travel`
- Message body: toàn bộ nội dung `invite-user.html`

**Reset password**
- Subject: `Đặt lại mật khẩu — Hoang Luxury Travel`
- Message body: toàn bộ nội dung `reset-password.html`

---

## Vì sao không dùng `{{ .ConfirmationURL }}`

Mẫu mặc định của Supabase dùng `{{ .ConfirmationURL }}`. Biến đó trỏ tới
`/auth/v1/verify` trên máy chủ Supabase: trình duyệt (hoặc bộ quét liên kết của hộp thư)
vừa chạm vào là token bị tiêu thụ ngay, rồi chuyển về trang với `#access_token=…`.

Ứng dụng này cố tình không nhận kiểu đó — xem `src/lib/auth-flow.js`. Nó chỉ chấp nhận
`?type=invite|recovery&token_hash=…` và tự gọi `verifyOtp`, nên token chỉ được tiêu thụ
đúng lúc người dùng thật sự mở trang. Dùng mẫu mặc định sẽ luôn báo
"Link đặt mật khẩu không hợp lệ hoặc đã hết hạn".

Vì vậy hai mẫu trên ghép thẳng `{{ .RedirectTo }}&token_hash={{ .TokenHash }}`.
Địa chỉ đích đã mang sẵn `?type=invite` (do `supabase/functions/invite-writer/index.js`
gửi lên) hoặc `?type=recovery` (do `src/admin/LoginScreen.jsx` gửi lên), nên nối thêm
`&token_hash=` là ra đúng dạng ứng dụng cần.
