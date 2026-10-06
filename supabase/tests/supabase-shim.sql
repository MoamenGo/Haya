-- TEST ONLY. Recreates the small part of Supabase the migrations rely on, so
-- they can run on a plain Postgres (in CI and locally) without the full
-- Supabase stack. Never apply this to a real Supabase project: it already has
-- all of this.
-- Roles belong to the whole server, so they may exist from an earlier run.
do $$
begin
  if not exists (select from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end $$;
create schema auth;
create table auth.users (id uuid primary key);
grant usage on schema auth to anon, authenticated;
grant usage on schema public to anon, authenticated;

-- Supabase reads the signed-in user's id from the request's JWT; tests set it
-- with set_config('request.jwt.claim.sub', ...).
create function auth.uid() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
