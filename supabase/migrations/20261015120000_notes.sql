-- Daily notes, typed or spoken (CLAUDE.md §6.13), mirrored from the Dexie
-- `notes` table (src/core/db/db.ts, version 9). Voice recordings are NOT
-- stored here: they stay on the device that recorded them (`note_audio` in
-- Dexie), because audio would quickly fill the free database. Only the text
-- and the recording's length sync.

create table public.notes (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  date date not null,
  body_md text not null default '' check (char_length(body_md) <= 20000),
  audio_seconds integer check (audio_seconds is null or audio_seconds >= 0)
);
create index notes_date_idx on public.notes (user_id, date);

-- Same trigger, RLS policies and pull index as every other synced table.
select private.make_synced('notes');
