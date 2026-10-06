# ADR-003: Sync engine

**Status:** accepted · 2026-10-06 · Phase 2

## Context
The app writes only to the local database; the cloud copy (ADR-002) has to catch up in the
background, work after days offline, and never duplicate or silently drop the owner's data.

## Decision
- `src/core/sync/engine.ts` runs one sync as **pull every table, then push every table**, in
  foreign-key order (`SYNC_TABLES`). Pulling first lets a device merge before it uploads.
- **Push:** rows with `_dirty = 1` go up in batches (upsert by id, with the owner's `user_id`). The
  flag is cleared only if the row wasn't edited again during the upload.
- **Pull:** rows with `server_updated_at` after the saved cursor (minus a 1-minute overlap), in
  pages. Postgres `+00:00` times are rewritten to the app's `…Z` form. A version already applied
  is skipped, so the overlap never causes false conflicts.
- **Conflicts:** last write wins by `updated_at`; a local change not uploaded yet is kept only if
  newer. Every real disagreement is written to the local `sync_conflicts` table.
- **Same thing, two ids:** rows that mean "the same thing" (`NATURAL_KEYS`: one check-in per date,
  one setting per key, starter areas by name, starter routines by title, …) are merged into the
  cloud's id, and rows that pointed at the local id are re-pointed (`REFERENCES`). This is how two
  devices that each seeded their own starter areas end up sharing one set.
- `startSyncScheduler` decides when: on start, on `online`, when the app becomes visible, 3 s after
  local changes, and every 5 minutes. One run at a time. Its state (signed out / offline /
  syncing / synced / error, plus pending count) lives in `status.ts` for the UI.
- The engine talks to the cloud only through the `SyncRemote` interface. Tests use an in-memory
  `FakeRemote`; the Supabase implementation arrives with sign-in.
- `sync_state` (cursors) and `sync_conflicts` are local-only tables: not synced, not backed up.

## Consequences
- A row the server rejects (for example a CHECK constraint) stops that sync with an error shown to
  the owner, rather than being skipped silently. Fixing the row lets sync continue.
- Last-write-wins trusts device clocks for `updated_at`; with one person on two devices this is
  acceptable (the cursor itself uses server time, so skew can't hide changes).
