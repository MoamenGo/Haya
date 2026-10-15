-- The owner's own study plans, and his edits to any plan's steps (CLAUDE.md
-- §6.10), mirrored from Dexie (src/core/db/db.ts, version 10).
--
-- * learning_paths: a plan he writes himself is keyed 'custom:<uuid>' and
--   stores its length in total_weeks (built-in plans keep it null; their
--   length lives in the app's code).
-- * study_items: one row per step he added ('x:<uuid>' keys, placed on a week
--   and day) or per built-in step he changed or hid (same key as the step).

alter table public.learning_paths drop constraint learning_paths_curriculum_key_check;
alter table public.learning_paths add constraint learning_paths_curriculum_key_check
  check (curriculum_key in ('english_a2_c1', 'health_tech') or curriculum_key ~ '^custom:[0-9a-f-]{36}$');
alter table public.learning_paths add column total_weeks integer
  check (total_weeks is null or total_weeks between 1 and 156);

create table public.study_items (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  path_id uuid not null references public.learning_paths (id) on delete cascade,
  item_key text not null check (char_length(item_key) between 1 and 100),
  week integer not null check (week between 1 and 156),
  day integer check (day is null or day between 0 and 6),
  text text not null check (char_length(text) between 1 and 300),
  minutes integer not null check (minutes between 1 and 240),
  kind text not null check (kind in ('study', 'practice', 'project', 'review', 'check')),
  link_title text check (link_title is null or char_length(link_title) <= 500),
  link_url text check (link_url is null or char_length(link_url) <= 600),
  hidden boolean not null default false
);
create unique index study_items_item_uniq on public.study_items (path_id, item_key)
  where deleted_at is null;

-- Same trigger, RLS policies and pull index as every other synced table.
select private.make_synced('study_items');
