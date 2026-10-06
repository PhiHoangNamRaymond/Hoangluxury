-- Run AFTER 04 on any project (new or existing). Không xoá dữ liệu.
--
-- Đổi mô hình quyền của writer: cả nhóm biên tập cùng đọc và cùng sửa mọi bài,
-- nhưng quyền XOÁ vẫn giữ nguyên — chỉ tác giả xoá bài của mình, admin xoá mọi bài.
-- Chạy lại nhiều lần vẫn an toàn.
begin;

create schema if not exists blog_private;

-- Đọc: thành viên đang hoạt động thấy mọi bài, kể cả bản nháp của người khác.
-- Người bị khoá rơi về quyền của khách: chỉ bài đã lên web.
drop policy if exists articles_member_read on public.articles;
create policy articles_member_read on public.articles for select to authenticated using (
  public.article_is_live(status, publish_at)
  or public.is_active_member()
  or public.is_admin()
);

-- Sửa: mọi thành viên đang hoạt động sửa được mọi bài.
drop policy if exists "articles_update_own_or_admin" on public.articles;
drop policy if exists articles_update_member on public.articles;
create policy articles_update_member on public.articles for update to authenticated
  using (public.is_active_member() or public.is_admin())
  with check (public.is_active_member() or public.is_admin());

-- Xoá: vẫn chỉ bài của mình, hoặc admin xoá mọi bài.
drop policy if exists "articles_delete_own_or_admin" on public.articles;
create policy "articles_delete_own_or_admin" on public.articles for delete to authenticated
  using ((author_id = auth.uid() and public.is_active_member()) or public.is_admin());

-- Sửa bài người khác không được kéo quyền tác giả về mình: tên tác giả quyết
-- định ai xoá được bài, nên WITH CHECK ở trên là chưa đủ, phải chặn ở trigger.
create or replace function blog_private.lock_article_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.author_id is distinct from old.author_id
     and auth.uid() is not null and not public.is_admin() then
    raise exception 'Không được đổi tác giả của bài viết' using errcode = '42501';
  end if;
  return new;
end $$;

revoke all on function blog_private.lock_article_author() from public, anon, authenticated;
drop trigger if exists articles_lock_author on public.articles;
create trigger articles_lock_author before update on public.articles
for each row execute function blog_private.lock_article_author();

commit;
