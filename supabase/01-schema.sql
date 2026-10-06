-- ============================================================================
-- Hoang Luxury Travel - Hệ thống viết blog
-- Chạy file này MỘT LẦN trong Supabase: SQL Editor > New query > dán > Run.
--
-- Tạo:
--   profiles  : hồ sơ người dùng, gắn vai trò admin / writer
--   articles  : bài viết
--   Luật phân quyền (RLS) ép ở tầng cơ sở dữ liệu:
--     - Khách vãng lai chỉ đọc được bài đã đăng và đã tới giờ đăng
--     - Writer thêm / sửa / xoá được bài của chính mình
--     - Admin toàn quyền trên mọi bài
-- ============================================================================

begin;

-- ---------------------------------------------------------------- profiles --

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'writer' check (role in ('admin', 'writer')),
  active boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Hồ sơ và vai trò của người viết blog.';

-- Người dùng mới đăng ký / được mời thì tự tạo hồ sơ, mặc định là writer.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'writer',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- articles --

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  reading_minutes integer generated always as (greatest(1, ceil(length(body) / 1000.0)::integer)) stored,
  cover_path text not null default '',
  cover_alt text not null default '',
  destinations text[] not null default '{}',
  topics text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  publish_at timestamptz,
  author_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.articles.publish_at is
  'Giờ đăng. Để trống = đăng ngay khi status chuyển sang published. Giờ tương lai = hẹn lịch.';

create index if not exists articles_author_idx on public.articles (author_id);
create index if not exists articles_live_idx on public.articles (status, publish_at desc);

-- Tự cập nhật updated_at mỗi lần sửa.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_touch_updated_at on public.articles;
create trigger articles_touch_updated_at
  before update on public.articles
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------ hàm hỗ trợ ---

-- Dùng trong các luật bên dưới. security definer để không bị đệ quy RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and active
  );
$$;

create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and active
  );
$$;

-- Bài được coi là đã lên web: đã đăng và đã tới giờ hẹn.
create or replace function public.article_is_live(status text, publish_at timestamptz)
returns boolean
language sql
stable
as $$
  select status = 'published' and (publish_at is null or publish_at <= now());
$$;

-- --------------------------------------------------------- luật phân quyền --

alter table public.profiles enable row level security;
alter table public.articles enable row level security;

-- Grants giới hạn thao tác; RLS bên dưới giới hạn người và bản ghi.
revoke all on public.profiles, public.articles from public, anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.articles to anon;
grant select, insert, update, delete on public.articles to authenticated;
grant select, insert, update, delete on public.profiles, public.articles to service_role;

-- profiles ------------------------------------------------------------------

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_self_name" on public.profiles;
-- Writer không được UPDATE hồ sơ, kể cả role/active của chính mình.
-- Tên và vai trò chỉ admin đang hoạt động hoặc server tin cậy được sửa.

-- Chỉ admin được đổi vai trò / khoá tài khoản người khác.
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Hồ sơ/email/role không công khai. RPC bên dưới chỉ xuất tên tác giả.
drop policy if exists "profiles_public_author" on public.profiles;

create or replace function public.public_article_authors()
returns table (id uuid, full_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.full_name
  from public.profiles p
  where exists (
    select 1 from public.articles a
    where a.author_id = p.id
      and public.article_is_live(a.status, a.publish_at)
  );
$$;

revoke all on function public.public_article_authors() from public;
grant execute on function public.public_article_authors() to anon, authenticated, service_role;

-- articles ------------------------------------------------------------------

-- Khách vãng lai: chỉ thấy bài đã lên.
drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read"
  on public.articles for select
  to anon
  using (public.article_is_live(status, publish_at));

-- Người đã đăng nhập: cả nhóm biên tập thấy mọi bài, kể cả nháp của người khác.
drop policy if exists "articles_member_read" on public.articles;
create policy "articles_member_read"
  on public.articles for select
  to authenticated
  using (
    public.article_is_live(status, publish_at)
    or public.is_active_member()
    or public.is_admin()
  );

-- Viết bài mới: phải là thành viên đang hoạt động và đứng tên chính mình.
drop policy if exists "articles_insert_own" on public.articles;
create policy "articles_insert_own"
  on public.articles for insert
  to authenticated
  with check (author_id = auth.uid() and public.is_active_member());

-- Sửa: mọi thành viên đang hoạt động sửa được mọi bài. Đổi tác giả thì không —
-- xem trigger articles_lock_author trong 05-writer-collaboration.sql.
drop policy if exists "articles_update_own_or_admin" on public.articles;
drop policy if exists "articles_update_member" on public.articles;
create policy "articles_update_member"
  on public.articles for update
  to authenticated
  using (public.is_active_member() or public.is_admin())
  with check (public.is_active_member() or public.is_admin());

-- Xoá: bài của mình, hoặc admin xoá mọi bài.
drop policy if exists "articles_delete_own_or_admin" on public.articles;
create policy "articles_delete_own_or_admin"
  on public.articles for delete
  to authenticated
  using ((author_id = auth.uid() and public.is_active_member()) or public.is_admin());

-- ------------------------------------------------------------------ ảnh ----

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    file_size_limit = 5242880
where id = 'blog-images';

drop policy if exists "blog_images_public_read" on storage.objects;
create policy "blog_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'blog-images');

drop policy if exists "blog_images_member_write" on storage.objects;
create policy "blog_images_member_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'blog-images'
    and public.is_active_member()
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "blog_images_member_delete" on storage.objects;
create policy "blog_images_member_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'blog-images'
    and public.is_active_member()
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

commit;
