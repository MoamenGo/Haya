-- Study plans followed day by day (CLAUDE.md §6.10), mirrored from the Dexie
-- `learning_paths` and `study_checks` tables (src/core/db/db.ts, version 8).
-- The plans' content (weeks, topics, sources) lives in the app's code; these
-- tables hold only the owner's choices and ticks.
--
-- Run once in the Supabase SQL Editor after the earlier migrations.

create table public.learning_paths (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  curriculum_key text not null check (curriculum_key in ('english_a2_c1', 'health_tech')),
  title text not null check (char_length(title) between 1 and 200),
  status text not null default 'active' check (status in ('active', 'paused', 'done')),
  start_date date not null
);
create unique index learning_paths_key_uniq on public.learning_paths (user_id, curriculum_key)
  where deleted_at is null;

create table public.study_checks (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  path_id uuid not null references public.learning_paths (id) on delete cascade,
  item_key text not null check (char_length(item_key) between 1 and 100),
  date date not null
);
create unique index study_checks_item_uniq on public.study_checks (path_id, item_key)
  where deleted_at is null;

-- Same trigger, RLS policies and pull index as every other synced table.
select private.make_synced(t) from unnest(array['learning_paths', 'study_checks']) as t;
