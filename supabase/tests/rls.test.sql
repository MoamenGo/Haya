-- Row Level Security tests (CLAUDE.md §14): a second user must not read or
-- write the owner's rows, in every table. Any failed check raises an error,
-- so `psql -v ON_ERROR_STOP=1` exits non-zero.
\set owner '00000000-0000-7000-8000-000000000001'
\set intruder '00000000-0000-7000-8000-000000000002'

insert into auth.users (id) values (:'owner'), (:'intruder');

-- Acts as a signed-in user for the statements that follow.
create function pg_temp.sign_in(uid uuid) returns void language sql as $$
  select set_config('request.jwt.claim.sub', uid::text, false);
$$;

-- The owner writes one row in every table (user_id comes from the default).
set role authenticated;
select pg_temp.sign_in(:'owner');
\set ts '''2026-10-06T10:00:00Z'''
insert into settings (id, created_at, updated_at, key, value)
  values ('10000000-0000-7000-8000-000000000001', :ts, :ts, 'language', '"ar"');
insert into life_areas (id, created_at, updated_at, name_ar, name_en, icon, color, sort_order)
  values ('10000000-0000-7000-8000-000000000002', :ts, :ts, 'القرآن', 'Quran', 'book', '#000', 1);
insert into routines (id, created_at, updated_at, title, anchor, rrule, full_version,
    minimum_version, is_worship, commitment_level, active, sort_order)
  values ('10000000-0000-7000-8000-000000000003', :ts, :ts, 'مراجعة', 'after_fajr',
    'FREQ=DAILY', 'صفحة', 'سطر', true, 1, true, 1);
insert into habit_logs (id, created_at, updated_at, routine_id, date, status)
  values ('10000000-0000-7000-8000-000000000004', :ts, :ts,
    '10000000-0000-7000-8000-000000000003', '2026-10-06', 'full');
insert into daily_plans (id, created_at, updated_at, date, day_type, minimum_mode)
  values ('10000000-0000-7000-8000-000000000005', :ts, :ts, '2026-10-06', 'deep_work', false);
insert into daily_logs (id, created_at, updated_at, date, energy)
  values ('10000000-0000-7000-8000-000000000006', :ts, :ts, '2026-10-06', 4);
insert into goals (id, created_at, updated_at, title, horizon, status)
  values ('10000000-0000-7000-8000-000000000007', :ts, :ts, 'هدف', 'quarter', 'idea');
insert into projects (id, created_at, updated_at, kind, title, status, priority,
    commitment_level, energy)
  values ('10000000-0000-7000-8000-000000000008', :ts, :ts, 'personal', 'مشروع', 'planned',
    'normal', 2, 'medium');
insert into tasks (id, created_at, updated_at, title, status, priority, commitment_level, energy)
  values ('10000000-0000-7000-8000-000000000009', :ts, :ts, 'مهمة', 'next', 'normal', 2, 'medium');
insert into inbox_items (id, created_at, updated_at, text)
  values ('10000000-0000-7000-8000-00000000000a', :ts, :ts, 'فكرة');
insert into day_overrides (id, created_at, updated_at, date, day_type)
  values ('10000000-0000-7000-8000-00000000000b', :ts, :ts, '2026-10-07', 'rest');
insert into reviews (id, created_at, updated_at, kind, period_start, period_end)
  values ('10000000-0000-7000-8000-00000000000c', :ts, :ts, 'weekly', '2026-10-03', '2026-10-09');
insert into resources (id, created_at, updated_at, url, url_normalized, type, status)
  values ('10000000-0000-7000-8000-00000000000d', :ts, :ts, 'https://example.com', 'https://example.com', 'article', 'queued');

-- Checks every table from the intruder's side.
create function pg_temp.check_isolation(owner_id uuid) returns void
language plpgsql as $$
declare
  t text;
  n bigint;
begin
  foreach t in array array[
    'settings', 'life_areas', 'routines', 'habit_logs', 'daily_plans', 'daily_logs',
    'goals', 'projects', 'tasks', 'inbox_items', 'day_overrides', 'reviews', 'resources'
  ] loop
    execute format('select count(*) from public.%I', t) into n;
    if n <> 0 then raise exception '% : intruder can read % rows', t, n; end if;

    execute format('update public.%I set deleted_at = now()', t);
    get diagnostics n = row_count;
    if n <> 0 then raise exception '% : intruder updated % rows', t, n; end if;

    execute format('delete from public.%I', t);
    get diagnostics n = row_count;
    if n <> 0 then raise exception '% : intruder deleted % rows', t, n; end if;

    -- Writing a row in the owner's name must be refused.
    begin
      execute format(
        'insert into public.%I (id, user_id, created_at, updated_at)
           values (gen_random_uuid(), %L, now(), now())', t, owner_id);
      raise exception '% : intruder inserted a row as the owner', t;
    exception
      when insufficient_privilege then null; -- RLS refused it: good
      when not_null_violation or check_violation or foreign_key_violation then
        raise exception '% : insert reached constraints instead of RLS', t;
    end;
  end loop;
end;
$$;

select pg_temp.sign_in(:'intruder');
select pg_temp.check_isolation(:'owner');

-- Signed out (anon) sees nothing and can't write.
reset role;
set role anon;
do $$
begin
  perform count(*) from public.tasks;
  raise exception 'anon can read tasks';
exception when insufficient_privilege then null;
end $$;

-- The owner still has all 13 rows, untouched, and each got a server stamp.
reset role;
set role authenticated;
select pg_temp.sign_in(:'owner');
do $$
declare
  t text;
  n bigint;
begin
  foreach t in array array[
    'settings', 'life_areas', 'routines', 'habit_logs', 'daily_plans', 'daily_logs',
    'goals', 'projects', 'tasks', 'inbox_items', 'day_overrides', 'reviews', 'resources'
  ] loop
    execute format(
      'select count(*) from public.%I where deleted_at is null and server_updated_at is not null',
      t) into n;
    if n <> 1 then raise exception '% : owner sees % live rows, expected 1', t, n; end if;
  end loop;
end $$;

-- The server stamp moves forward on update, whatever the client sends.
do $$
declare
  before_stamp timestamptz;
  after_stamp timestamptz;
begin
  select server_updated_at into before_stamp from public.tasks;
  update public.tasks set title = 'مهمة ٢', server_updated_at = '2000-01-01';
  select server_updated_at into after_stamp from public.tasks;
  if after_stamp <= before_stamp then raise exception 'server stamp did not advance'; end if;
end $$;

-- Every public table has RLS on (catches a future table that forgets it).
reset role;
do $$
declare
  missing text;
begin
  select string_agg(relname, ', ') into missing
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
  if missing is not null then raise exception 'tables without RLS: %', missing; end if;
end $$;

\echo 'RLS tests passed'
