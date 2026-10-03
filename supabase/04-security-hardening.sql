-- Run AFTER 01 on a new project, or AFTER 02 + 03 on an existing project.
-- No data deletion. NOT VALID constraints check new/changed rows without
-- silently deleting legacy content. Review legacy rows before VALIDATE CONSTRAINT.
begin;
alter function public.handle_new_user() set search_path = '';
alter function public.is_admin() set search_path = '';
alter function public.is_active_member() set search_path = '';
alter function public.touch_updated_at() set search_path = '';
alter function public.article_is_live(text, timestamptz) set search_path = '';
revoke all on function public.handle_new_user(), public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.is_admin(), public.is_active_member() from public, anon;
grant execute on function public.is_admin(), public.is_active_member() to authenticated, service_role;

do $$ begin
  if not exists (select 1 from pg_constraint where conrelid='public.articles'::regclass and conname='articles_input_bounds') then
    alter table public.articles add constraint articles_input_bounds check (
      slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120
      and length(btrim(title)) between 1 and 200
      and length(excerpt) <= 2000 and octet_length(body) <= 800000
      and length(cover_path) <= 2048 and length(cover_alt) <= 300
      and cardinality(destinations) <= 20 and cardinality(topics) <= 20
      and length(array_to_string(destinations, ',')) <= 2000
      and length(array_to_string(topics, ',')) <= 2000
    ) not valid;
  end if;
end $$;

-- Not exposed by the Data API; users cannot inspect/change security records.
create schema if not exists blog_private;
revoke all on schema blog_private from public, anon, authenticated;
create table if not exists blog_private.invite_windows (
  actor_id uuid primary key references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  attempts integer not null
);
create table if not exists blog_private.role_audit (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid,
  target_id uuid not null,
  operation text not null,
  old_role text, new_role text, old_active boolean, new_active boolean
);
alter table blog_private.invite_windows enable row level security;
alter table blog_private.role_audit enable row level security;
revoke all on all tables in schema blog_private from public, anon, authenticated;

-- Atomic, cross-instance limit: 10 attempts / admin / 1 hour.
-- Only the trusted server may call, AFTER getUser + active-admin check.
create or replace function public.consume_blog_invite(actor uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare consumed integer;
begin
  if not exists (select 1 from public.profiles where id=actor and role='admin' and active) then
    return false;
  end if;
  insert into blog_private.invite_windows as w (actor_id, started_at, attempts)
  values (actor, now(), 1)
  on conflict (actor_id) do update set
    started_at = case when w.started_at <= now() - interval '1 hour' then now() else w.started_at end,
    attempts = case when w.started_at <= now() - interval '1 hour' then 1 else w.attempts + 1 end
  where w.started_at <= now() - interval '1 hour' or w.attempts < 10
  returning attempts into consumed;
  return consumed is not null;
end $$;
revoke all on function public.consume_blog_invite(uuid) from public, anon, authenticated;
grant execute on function public.consume_blog_invite(uuid) to service_role;

create or replace function blog_private.audit_profile_permissions()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='DELETE' then
    insert into blog_private.role_audit(actor_id,target_id,operation,old_role,old_active)
    values(auth.uid(),old.id,tg_op,old.role,old.active);
    return old;
  elsif tg_op='INSERT' then
    insert into blog_private.role_audit(actor_id,target_id,operation,new_role,new_active)
    values(auth.uid(),new.id,tg_op,new.role,new.active);
  elsif (old.role,old.active) is distinct from (new.role,new.active) then
    insert into blog_private.role_audit(actor_id,target_id,operation,old_role,new_role,old_active,new_active)
    values(auth.uid(),new.id,tg_op,old.role,new.role,old.active,new.active);
  end if;
  return new;
end $$;
revoke all on function blog_private.audit_profile_permissions() from public, anon, authenticated;
drop trigger if exists profiles_permission_audit on public.profiles;
create trigger profiles_permission_audit after insert or update or delete on public.profiles
for each row execute function blog_private.audit_profile_permissions();

-- Disabled users cannot continue reading their private drafts via an old JWT.
drop policy if exists articles_member_read on public.articles;
create policy articles_member_read on public.articles for select to authenticated using (
  public.article_is_live(status, publish_at)
  or (author_id=auth.uid() and public.is_active_member()) or public.is_admin()
);
commit;
