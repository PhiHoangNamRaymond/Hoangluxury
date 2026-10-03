-- Áp dụng cho dự án ĐÃ chạy phiên bản 01-schema.sql cũ.
-- Chạy toàn bộ trong Supabase SQL Editor bằng tài khoản chủ dự án.
-- Không xóa bài viết/ảnh, không đổi quyền hoặc khóa các tài khoản hiện có.
-- Writer mất quyền sửa hồ sơ; admin đang hoạt động vẫn quản lý được tài khoản.
-- Không thể tự áp dụng bằng build/deploy frontend: cần chạy SQL này trên Supabase.

begin;

alter table public.profiles alter column active set default false;
alter table public.profiles enable row level security;
alter table public.articles enable row level security;

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

create or replace function public.article_is_live(status text, publish_at timestamptz)
returns boolean
language sql
stable
as $$
  select status = 'published' and (publish_at is null or publish_at <= now());
$$;

revoke all on public.profiles, public.articles from public, anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.articles to anon;
grant select, insert, update, delete on public.articles to authenticated;
grant select, insert, update, delete on public.profiles, public.articles to service_role;

drop policy if exists "profiles_update_self_name" on public.profiles;
drop policy if exists "profiles_public_author" on public.profiles;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
  on public.profiles for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

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

drop policy if exists "blog_images_member_write" on storage.objects;
create policy "blog_images_member_write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'blog-images'
    and public.is_active_member()
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "blog_images_member_delete" on storage.objects;
create policy "blog_images_member_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'blog-images'
    and public.is_active_member()
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

commit;
