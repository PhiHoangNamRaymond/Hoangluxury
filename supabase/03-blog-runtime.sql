-- Dự án đã chạy schema cũ: chạy sau 02-lock-permissions.sql.
-- Không xóa bài, không đổi vai trò/tài khoản, không xóa ảnh hiện có.
begin;
alter table public.articles add column if not exists reading_minutes integer
  generated always as (greatest(1, ceil(length(body) / 1000.0)::integer)) stored;
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    file_size_limit = 5242880
where id = 'blog-images';
commit;
