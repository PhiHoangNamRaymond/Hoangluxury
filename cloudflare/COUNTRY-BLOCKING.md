# Chặn quốc gia trên website Hoang Luxury Travel

Yêu cầu xác nhận ngày 25/11/2026: chặn toàn bộ VN (Việt Nam), CN (Trung Quốc),
HK (Hong Kong), LA (Lào), KH (Campuchia), MM (Myanmar). Không có ngoại lệ IP
quản trị. Người quản trị dùng VPN ngoài sáu quốc gia để mở website và `/admin/`.

## Cấu hình đang triển khai

- Hostinger: server1815, Frankfurt, Đức; IP website 82.25.96.21.
- Cloudflare DNS: A apex về IP trên; www CNAME về apex; cả hai Proxied.
- SSL Hostinger Active; Cloudflare Full (strict).
- Worker `hlt-booking-forms` dùng hai route `hoangluxury.travel/*` và
  `www.hoangluxury.travel/*`, bao phủ cả `/api/forms`.
- `forms-worker.js` gọi guard trong `country-worker.js` trước mọi xử lý.
  Guard đọc `request.cf.country`, không đọc header/query do trình duyệt gửi.
- Quốc gia bị chặn nhận HTTP 403, no-store/noindex và ảnh chủ website cung cấp:
  `/unavailable/Maintenance%20HLT.png`. Chỉ GET/HEAD của đúng ảnh này được miễn
  chặn để trang thông báo tải được. `/admin/` và `/api/forms` không được miễn.
- Quốc gia khác chuyển tiếp website về Hostinger; riêng `/api/forms` tiếp tục
  dùng proxy hiện tại, xác minh CAPTCHA và secret trước khi ghi Google Sheet.
- Gói Cloudflare Free không có WAF custom response; ảnh thông báo được trả bằng
  Worker, không dùng chặn hoặc chuyển hướng JavaScript trong trình duyệt.

## Cập nhật

Chạy từ thư mục `cloudflare/` sau khi kiểm tra mã:

```powershell
npx wrangler deploy --dry-run --keep-vars
npx wrangler deploy --keep-vars
```

Giữ đủ ba secret hiện tại trên Cloudflare: GOOGLE_FORMS_ENDPOINT,
FORMS_PROXY_SECRET, TURNSTILE_SECRET_KEY. Không đưa giá trị vào mã nguồn.
`--keep-vars` giữ biến cấu hình Dashboard; thay đổi cần thiết phải được đối chiếu
với `wrangler.toml`. Không deploy lại cấu hình route cũ chỉ bao phủ `/api/forms`.
Luôn giữ ảnh trên Hostinger và trong `public/unavailable/` khi build ZIP mới.

Worker Free có hạn mức request theo ngày; vì route bao phủ toàn website, theo
dõi Usage trong Cloudflare khi tăng traffic. Không đổi sang fail-open để xử lý
hạn mức nếu cần duy trì chặn quốc gia.

## Kiểm tra và khôi phục

- `node --test tests/country-worker.test.mjs tests/forms-security.test.mjs`
  từ gốc project: kiểm tra sáu quốc gia, trang/admin/API, chống giả header,
  ngoại lệ ảnh, HEAD/no-store và luồng proxy cho quốc gia được phép.
- Đã kiểm tra live từ mạng được Cloudflare xác định VN: apex/www, booking và
  admin trả 403; ảnh trả 200 (www chuyển 301 về apex); API OPTIONS trả 403.
  Chrome hiển thị đúng ảnh cung cấp. Chưa có kiểm tra live từ VPN ngoài danh sách.
- Trước thay đổi, phiên bản Worker đang chạy là
  `8c552659-ae1a-42df-b2eb-1283537cdb5f`. Phiên bản bật chặn ban đầu:
  `3e0ddd68-4e85-47b9-bb1f-4d6a5585d2fb`.
- Để khôi phục chức năng proxy cũ, có thể rollback Worker trong Dashboard về
  phiên bản trước thay đổi. Nếu cần khôi phục routes cũ, chúng là
  `hoangluxury.travel/api/forms` và `www.hoangluxury.travel/api/forms`.
  Không rollback/xoá dữ liệu Supabase hoặc Google Sheet khi khôi phục frontend.

Chặn dựa trên vị trí IP, không phải quốc tịch. Chỉ áp dụng traffic qua Cloudflare
của hai hostname đã cấu hình; IP origin, domain tạm, deployment Vercel cũ và
Supabase không tự được bảo vệ bằng guard này. Không coi là chặn tuyệt đối mọi
đường truy cập. Không tin CF-IPCountry do client tự gửi trực tiếp tới origin.
