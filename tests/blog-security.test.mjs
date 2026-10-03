// In-memory PostgreSQL only: no env, network, Supabase or production mutations.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

const schema = await readFile(new URL("../supabase/01-schema.sql", import.meta.url), "utf8");
const migration = await readFile(new URL("../supabase/02-lock-permissions.sql", import.meta.url), "utf8");
const runtimeMigration = await readFile(new URL("../supabase/03-blog-runtime.sql", import.meta.url), "utf8");
const hardening = await readFile(new URL("../supabase/04-security-hardening.sql", import.meta.url), "utf8");
const ids = {
  admin: "00000000-0000-0000-0000-000000000001",
  writer: "00000000-0000-0000-0000-000000000002",
  other: "00000000-0000-0000-0000-000000000003",
  blocked: "00000000-0000-0000-0000-000000000004",
  signup: "00000000-0000-0000-0000-000000000005",
};

const infrastructure = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create schema storage;
  create table auth.users (id uuid primary key, email text not null, raw_user_meta_data jsonb not null default '{}');
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  $$;
  create function storage.foldername(name text) returns text[] language sql immutable as $$
    select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1];
  $$;
  create table storage.buckets (id text primary key, name text, public boolean, allowed_mime_types text[], file_size_limit bigint);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text not null);
  alter table storage.objects enable row level security;
  grant usage on schema public, auth, storage to anon, authenticated, service_role;
  grant select on storage.objects to anon;
  grant select, insert, update, delete on storage.objects to authenticated, service_role;
`;

async function fixture(db) {
  for (const [name, id] of Object.entries(ids)) {
    await db.query("insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)", [
      id, `${name}@example.com`, { full_name: name, role: "admin", active: true },
    ]);
  }
  await db.exec(`
    update public.profiles set role='writer', active=false;
    update public.profiles set role='admin', active=true where id='${ids.admin}';
    update public.profiles set active=true where id in ('${ids.writer}', '${ids.other}');
    insert into public.articles (slug, title, author_id, status, publish_at) values
      ('live-one', 'Live one', '${ids.writer}', 'published', null),
      ('draft-one', 'Draft one', '${ids.writer}', 'draft', null),
      ('live-two', 'Live two', '${ids.other}', 'published', now() - interval '1 day'),
      ('scheduled', 'Scheduled', '${ids.signup}', 'published', now() + interval '1 day');
    insert into storage.buckets (id, name, public) values ('other-bucket', 'other-bucket', true);
    insert into storage.objects (bucket_id, name) values
      ('blog-images', '${ids.writer}/own.jpg'),
      ('blog-images', '${ids.other}/other.jpg'),
      ('blog-images', '${ids.blocked}/blocked.jpg'),
      ('other-bucket', '${ids.writer}/not-blog.jpg');
  `);
}

async function asRole(db, role, id, check) {
  assert.ok(["anon", "authenticated", "service_role"].includes(role));
  await db.exec("begin");
  try {
    await db.exec(`set local role ${role}`);
    await db.query("select set_config('request.jwt.claim.sub', $1, true)", [id || ""]);
    await check();
  } finally {
    await db.exec("rollback");
  }
}

function denied(db, sql, params = []) {
  return assert.rejects(db.query(sql, params), (error) => error.code === "42501");
}

async function securityCases(t, db) {
  await t.test("new signup ignores malicious metadata after installation/upgrade", async () => {
    await db.exec("begin");
    try {
      await db.query("insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)", [
        "00000000-0000-0000-0000-000000000099", "new-signup@example.com", { role: "admin", active: true },
      ]);
      assert.deepEqual((await db.query("select role, active from public.profiles where email='new-signup@example.com'")).rows, [{ role: "writer", active: false }]);
    } finally {
      await db.exec("rollback");
    }
  });
  await t.test("untrusted metadata cannot grant admin or activate a user", async () => {
    assert.deepEqual((await db.query("select role, active from public.profiles where id=$1", [ids.signup])).rows, [{ role: "writer", active: false }]);
  });
  await t.test("writer reads only their own profile", () => asRole(db, "authenticated", ids.writer, async () => {
    assert.deepEqual((await db.query("select id from public.profiles")).rows, [{ id: ids.writer }]);
  }));
  await t.test("writer cannot change role/name or create/delete profiles", () => asRole(db, "authenticated", ids.writer, async () => {
    assert.equal((await db.query("update public.profiles set role='admin', full_name='Changed' where id=$1 returning id", [ids.writer])).rows.length, 0);
    assert.equal((await db.query("delete from public.profiles where id=$1 returning id", [ids.writer])).rows.length, 0);
    await denied(db, "insert into public.profiles (id, email, role, active) values (gen_random_uuid(), 'fake@example.com', 'admin', true)");
  }));
  await t.test("blocked member cannot unlock self", () => asRole(db, "authenticated", ids.blocked, async () => {
    assert.equal((await db.query("update public.profiles set active=true where id=$1 returning id", [ids.blocked])).rows.length, 0);
  }));
  await t.test("admin can manage another member", () => asRole(db, "authenticated", ids.admin, async () => {
    assert.deepEqual((await db.query("update public.profiles set role='admin', active=false where id=$1 returning role, active", [ids.other])).rows, [{ role: "admin", active: false }]);
    assert.equal((await db.query("select id from public.profiles")).rows.length, 5);
  }));
  await t.test("anon cannot read profiles or write articles", async () => {
    await asRole(db, "anon", null, () => denied(db, "select email, role from public.profiles"));
    await asRole(db, "anon", null, () => denied(db, "insert into public.articles (slug, title, author_id) values ('bad', 'Bad', $1)", [ids.writer]));
  });
  await t.test("public feed and authors expose only published/due articles and names", () => asRole(db, "anon", null, async () => {
    assert.deepEqual((await db.query("select slug from public.articles order by slug")).rows.map((row) => row.slug), ["live-one", "live-two"]);
    assert.deepEqual((await db.query("select * from public.public_article_authors() order by id")).rows, [{ id: ids.writer, full_name: "writer" }, { id: ids.other, full_name: "other" }]);
  }));
  await t.test("writer edits own articles only", () => asRole(db, "authenticated", ids.writer, async () => {
    assert.equal((await db.query("update public.articles set title='Updated' where slug='draft-one' returning id")).rows.length, 1);
    assert.equal((await db.query("update public.articles set title='Stolen' where slug='live-two' returning id")).rows.length, 0);
    assert.equal((await db.query("delete from public.articles where slug='live-two' returning id")).rows.length, 0);
    await denied(db, "insert into public.articles (slug, title, author_id) values ('forged', 'Forged', $1)", [ids.other]);
  }));
  await t.test("blocked member cannot write or upload", async () => {
    await asRole(db, "authenticated", ids.blocked, () => denied(db, "insert into public.articles (slug, title, author_id) values ('blocked', 'Blocked', $1)", [ids.blocked]));
    await asRole(db, "authenticated", ids.blocked, () => denied(db, "insert into storage.objects (bucket_id, name) values ('blog-images', $1)", [`${ids.blocked}/new.jpg`]));
  });
  await t.test("writer uploads/deletes only own-folder blog images", async () => {
    await asRole(db, "authenticated", ids.writer, async () => {
      await db.query("insert into storage.objects (bucket_id, name) values ('blog-images', $1)", [`${ids.writer}/new.jpg`]);
      assert.equal((await db.query("delete from storage.objects where name=$1 returning id", [`${ids.writer}/own.jpg`])).rows.length, 1);
      assert.equal((await db.query("delete from storage.objects where name=$1 returning id", [`${ids.other}/other.jpg`])).rows.length, 0);
      assert.equal((await db.query("delete from storage.objects where bucket_id='other-bucket' returning id")).rows.length, 0);
    });
    await asRole(db, "authenticated", ids.writer, () => denied(db, "insert into storage.objects (bucket_id, name) values ('blog-images', $1)", [`${ids.other}/forged.jpg`]));
    await asRole(db, "authenticated", ids.writer, () => denied(db, "insert into storage.objects (bucket_id, name) values ('other-bucket', $1)", [`${ids.writer}/wrong.jpg`]));
  });
  await t.test("admin deletes others' blog images but not other buckets", () => asRole(db, "authenticated", ids.admin, async () => {
    assert.equal((await db.query("delete from storage.objects where name=$1 returning id", [`${ids.other}/other.jpg`])).rows.length, 1);
    assert.equal((await db.query("delete from storage.objects where bucket_id='other-bucket' returning id")).rows.length, 0);
  }));
  await t.test("trusted server activates invited accounts", () => asRole(db, "service_role", null, async () => {
    assert.deepEqual((await db.query("update public.profiles set active=true, role='admin' where id=$1 returning role, active", [ids.signup])).rows, [{ role: "admin", active: true }]);
  }));
  await t.test("client cannot bypass RLS with TRUNCATE", async () => {
    await asRole(db, "authenticated", ids.writer, () => denied(db, "truncate public.articles"));
    await asRole(db, "anon", null, () => denied(db, "truncate public.articles"));
  });
}

for (const mode of ["fresh schema", "upgrade from permissive policies"]) {
  test(mode, async (t) => {
    const db = new PGlite();
    try {
      await db.exec(infrastructure);
      await db.exec(schema);
      if (mode.startsWith("upgrade")) {
        await db.exec(`
          create policy profiles_update_self_name on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
          create policy profiles_public_author on public.profiles for select to anon using (true);
          grant select on public.profiles to anon;
          alter table public.profiles alter column active set default true;
          create or replace function public.handle_new_user() returns trigger
          language plpgsql security definer set search_path=public as $$
          begin
            insert into public.profiles (id, email, full_name, role, active)
            values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''),
              coalesce(new.raw_user_meta_data->>'role','writer'), true);
            return new;
          end;
          $$;
          drop policy blog_images_member_write on storage.objects;
          create policy blog_images_member_write on storage.objects for insert to authenticated with check (bucket_id='blog-images' and public.is_active_member());
          drop policy blog_images_member_delete on storage.objects;
          create policy blog_images_member_delete on storage.objects for delete to authenticated using (bucket_id='blog-images' and public.is_active_member());
        `);
        await fixture(db);
        await db.exec("alter table public.articles drop column reading_minutes");
        await db.exec(migration);
        await db.exec(migration);
        await db.exec(runtimeMigration);
        await db.exec(runtimeMigration);
        for (const [table, count] of [["public.profiles", 5], ["public.articles", 4], ["storage.objects", 4]]) {
          assert.equal((await db.query(`select count(*)::int as n from ${table}`)).rows[0].n, count);
        }
      } else {
        await fixture(db);
      }
      await db.exec(hardening);
      await db.exec(hardening); // Idempotent upgrade.
      await securityCases(t, db);
      await t.test("blocked users cannot read private drafts through old sessions", async () => {
        await db.query("insert into public.articles(slug,title,author_id) values('blocked-draft','Private',$1)", [ids.blocked]);
        await asRole(db, "authenticated", ids.blocked, async () => {
          assert.equal((await db.query("select id from public.articles where slug='blocked-draft'")).rows.length, 0);
        });
      });
      await t.test("article limits are enforced in PostgreSQL, not just browser", async () => {
        for (const [field, value] of [["title", "x".repeat(201)], ["slug", "bad/path"], ["body", "x".repeat(800001)]]) {
          await assert.rejects(db.query(`update public.articles set ${field}=$1 where slug='live-one'`, [value]), (error) => error.code === "23514");
        }
      });
      await t.test("invitation rate limiter is server-only, bounded and resets", async () => {
        await asRole(db, "anon", null, () => denied(db, "select public.consume_blog_invite($1)", [ids.admin]));
        await asRole(db, "authenticated", ids.admin, () => denied(db, "select public.consume_blog_invite($1)", [ids.admin]));
        await asRole(db, "service_role", null, async () => {
          assert.equal((await db.query("select public.consume_blog_invite($1) as ok", [ids.writer])).rows[0].ok, false);
          for (let i=0; i<10; i++) assert.equal((await db.query("select public.consume_blog_invite($1) as ok", [ids.admin])).rows[0].ok, true);
          assert.equal((await db.query("select public.consume_blog_invite($1) as ok", [ids.admin])).rows[0].ok, false);
        });
        await db.query("insert into blog_private.invite_windows values($1, now()-interval '2 hours',10) on conflict(actor_id) do update set started_at=excluded.started_at,attempts=10", [ids.admin]);
        await asRole(db, "service_role", null, async () => assert.equal((await db.query("select public.consume_blog_invite($1) as ok", [ids.admin])).rows[0].ok, true));
      });
      await t.test("role changes are audited without exposing logs to clients", async () => {
        await db.query("update public.profiles set active=false where id=$1", [ids.other]);
        assert.ok((await db.query("select target_id from blog_private.role_audit where target_id=$1", [ids.other])).rows.length);
        await asRole(db, "authenticated", ids.admin, () => denied(db, "select * from blog_private.role_audit"));
        await asRole(db, "anon", null, () => denied(db, "select * from blog_private.invite_windows"));
      });
      await t.test("runtime upgrade keeps data and computes reading estimate", async () => {
        await db.query("update public.articles set body=$1 where slug='live-one'", ["x".repeat(2500)]);
        assert.equal((await db.query("select reading_minutes from public.articles where slug='live-one'")).rows[0].reading_minutes, 3);
        assert.deepEqual((await db.query("select allowed_mime_types, file_size_limit from storage.buckets where id='blog-images'")).rows,
          [{ allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif"], file_size_limit: 5242880 }]);
      });
    } finally {
      await db.close();
    }
  });
}
