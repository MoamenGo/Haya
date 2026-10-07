-- Links to learning sources (CLAUDE.md §6.11), mirrored from the Dexie
-- `resources` table (src/core/db/db.ts, version 7). Each link hangs off a goal
-- and optionally one of its projects; learning domains/paths come in Phase 4.
--
-- Run once in the Supabase SQL Editor after the init migration.

create table public.resources (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  url text not null check (char_length(url) between 1 and 2000),
  url_normalized text not null check (char_length(url_normalized) between 1 and 2000),
  title text not null default '' check (char_length(title) <= 300),
  type text not null check (type in ('course', 'book', 'paper', 'documentation', 'video',
    'playlist', 'article', 'repository', 'dataset', 'tool', 'podcast', 'lecture', 'other')),
  goal_id uuid references public.goals (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  status text not null default 'queued'
    check (status in ('queued', 'in_progress', 'done', 'dropped')),
  reliability_note text not null default '' check (char_length(reliability_note) <= 1000)
);
create index resources_goal_idx on public.resources (user_id, goal_id);

-- Same trigger, RLS policies and pull index as every other synced table.
select private.make_synced('resources');
