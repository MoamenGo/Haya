-- Phase 2: the cloud copy of the local database (CLAUDE.md §7.3, §7.4, §8).
--
-- Every table mirrors a Dexie table in src/core/db (same column names), plus
-- `server_updated_at`, which only the server sets. Change both together.
--
-- How the pieces fit:
--   * `user_id` defaults to the signed-in user, and Row Level Security (RLS)
--     lets a user see and change only rows where user_id = their id.
--   * `server_updated_at` is stamped by a trigger on every insert/update. The
--     sync engine pulls "everything newer than my last cursor" with it, so a
--     device with a wrong clock can't hide changes.
--   * Rows are never hard-deleted by the app: `deleted_at` marks a tombstone
--     so deletes sync too. Deleting the auth user removes everything (cascade).

create schema if not exists private;

-- Stamps the server time on each write. clock_timestamp() (not now()) so rows
-- written in one transaction still get increasing stamps.
create or replace function private.stamp_server_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.server_updated_at := clock_timestamp();
  return new;
end;
$$;

-- Applies what every synced table needs: the stamp trigger, RLS with one
-- owner-only policy per operation, and the pull index. Called once per table
-- below so the rules can't drift between tables.
create or replace function private.make_synced(table_name text)
returns void
language plpgsql
as $$
begin
  execute format(
    'create trigger stamp_server_updated_at before insert or update on public.%I
       for each row execute function private.stamp_server_updated_at()',
    table_name);
  execute format('alter table public.%I enable row level security', table_name);
  execute format('revoke all on public.%I from anon', table_name);
  execute format(
    'grant select, insert, update, delete on public.%I to authenticated', table_name);
  -- `(select auth.uid())` is evaluated once per query instead of once per row.
  execute format(
    'create policy owner_select on public.%I for select to authenticated
       using (user_id = (select auth.uid()))', table_name);
  execute format(
    'create policy owner_insert on public.%I for insert to authenticated
       with check (user_id = (select auth.uid()))', table_name);
  execute format(
    'create policy owner_update on public.%I for update to authenticated
       using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
    table_name);
  execute format(
    'create policy owner_delete on public.%I for delete to authenticated
       using (user_id = (select auth.uid()))', table_name);
  execute format(
    'create index %I on public.%I (user_id, server_updated_at)',
    table_name || '_pull_idx', table_name);
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables. The first six columns are the same everywhere (docs/erd.md).
-- ---------------------------------------------------------------------------

create table public.settings (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  key text not null check (char_length(key) between 1 and 100),
  value jsonb
);
create unique index settings_key_uniq on public.settings (user_id, key) where deleted_at is null;

create table public.life_areas (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  name_ar text not null,
  name_en text not null,
  icon text not null,
  color text not null,
  sort_order integer not null,
  archived boolean not null default false
);

create table public.routines (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  area_id uuid references public.life_areas (id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  anchor text not null
    check (anchor in ('after_fajr', 'duha', 'after_dhuhr', 'after_asr', 'maghrib_isha', 'after_isha')),
  rrule text not null,
  duration_min integer check (duration_min >= 0),
  full_version text not null,
  minimum_version text not null,
  is_worship boolean not null,
  commitment_level smallint not null check (commitment_level between 1 and 4),
  active boolean not null,
  sort_order integer not null
);

create table public.habit_logs (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  date date not null,
  -- No "failed" on purpose (CLAUDE.md §6.5).
  status text not null check (status in ('full', 'minimum', 'skipped'))
);
create unique index habit_logs_day_uniq on public.habit_logs (routine_id, date)
  where deleted_at is null;

create table public.daily_plans (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  date date not null,
  day_type text not null check (day_type in ('hospital', 'deep_work', 'rest', 'custom')),
  minimum_mode boolean not null
);
create unique index daily_plans_date_uniq on public.daily_plans (user_id, date)
  where deleted_at is null;

create table public.daily_logs (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  date date not null,
  energy smallint check (energy between 1 and 5),
  sleep_hours numeric(3, 1) check (sleep_hours between 0 and 24),
  gratitude text not null default '' check (char_length(gratitude) <= 500),
  tomorrow_top3 jsonb not null default '[]'::jsonb check (jsonb_typeof(tomorrow_top3) = 'array')
);
create unique index daily_logs_date_uniq on public.daily_logs (user_id, date)
  where deleted_at is null;

create table public.goals (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  area_id uuid references public.life_areas (id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  why text not null default '',
  desired_outcome text not null default '',
  horizon text not null check (horizon in ('month', 'quarter', 'year', 'long_term')),
  success_metric text not null default '',
  status text not null
    check (status in ('idea', 'planned', 'active', 'paused', 'done', 'cancelled', 'archived')),
  target_date date
);

create table public.projects (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  area_id uuid references public.life_areas (id) on delete set null,
  goal_id uuid references public.goals (id) on delete set null,
  kind text not null check (kind in ('personal', 'freelance', 'venture', 'learning', 'hospital')),
  title text not null check (char_length(title) between 1 and 200),
  outcome text not null default '',
  reason text not null default '',
  status text not null check (status in
    ('inbox', 'planned', 'active', 'blocked', 'waiting', 'paused', 'done', 'archived')),
  priority text not null check (priority in ('critical', 'important', 'normal', 'low')),
  commitment_level smallint not null check (commitment_level between 1 and 4),
  -- Points at tasks, which point back at projects. No foreign key here so the
  -- sync engine can upload projects before their tasks; the app keeps it valid.
  next_action_task_id uuid,
  deadline date,
  est_hours numeric(7, 1) check (est_hours >= 0),
  energy text not null check (energy in ('light', 'medium', 'heavy')),
  review_date date,
  client_id uuid -- clients arrive in Phase 5
);

create table public.tasks (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  area_id uuid references public.life_areas (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  goal_id uuid references public.goals (id) on delete set null,
  title text not null check (char_length(title) between 1 and 500),
  notes text not null default '',
  checklist jsonb not null default '[]'::jsonb check (jsonb_typeof(checklist) = 'array'),
  status text not null check (status in
    ('inbox', 'next', 'scheduled', 'in_progress', 'waiting', 'done', 'cancelled')),
  priority text not null check (priority in ('critical', 'important', 'normal', 'low')),
  commitment_level smallint not null check (commitment_level between 1 and 4),
  energy text not null check (energy in ('light', 'medium', 'heavy')),
  est_minutes integer check (est_minutes >= 0),
  actual_minutes integer check (actual_minutes >= 0),
  due_date date,
  scheduled_date date,
  prayer_block text
    check (prayer_block in ('after_fajr', 'duha', 'after_dhuhr', 'after_asr', 'maghrib_isha', 'after_isha')),
  is_big_rock boolean not null default false,
  rrule text,
  completed_at timestamptz
);
create index tasks_scheduled_idx on public.tasks (user_id, scheduled_date);

create table public.inbox_items (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  text text not null check (char_length(text) between 1 and 2000),
  kind_hint text check (kind_hint in ('link')),
  is_important boolean not null default false,
  tags text[] not null default '{}',
  processed_at timestamptz,
  converted_type text check (converted_type in ('task')),
  -- Can point at different tables (by converted_type), so no foreign key.
  converted_id uuid
);

create table public.day_overrides (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  date date not null,
  day_type text not null check (day_type in ('hospital', 'deep_work', 'rest', 'custom')),
  capacity_min integer check (capacity_min between 0 and 1440),
  note text not null default '' check (char_length(note) <= 200)
);
create unique index day_overrides_date_uniq on public.day_overrides (user_id, date)
  where deleted_at is null;

create table public.reviews (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  kind text not null check (kind in ('weekly', 'monthly', 'quarterly')),
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object')
);
create unique index reviews_period_uniq on public.reviews (user_id, kind, period_start)
  where deleted_at is null;

-- Same rules for every table.
select private.make_synced(t) from unnest(array[
  'settings', 'life_areas', 'routines', 'habit_logs', 'daily_plans', 'daily_logs',
  'goals', 'projects', 'tasks', 'inbox_items', 'day_overrides', 'reviews'
]) as t;
