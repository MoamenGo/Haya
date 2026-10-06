# ADR-002: Cloud schema and how it is tested

**Status:** accepted · 2026-10-06 · Phase 2

## Context

Phase 2 adds a Supabase (Postgres) copy of the local Dexie database so the phone and desktop stay
in sync (CLAUDE.md §7.3–7.4). The cloud must never show one user's rows to anyone else, and the
sync engine must not lose changes when a device clock is wrong.

## Decision

- One migration per change in `supabase/migrations/`; Dexie versions and migrations change in the
  same PR. Column names are identical on both sides.
- Every table gets the same treatment from one helper, `private.make_synced(table)`: a trigger that
  stamps `server_updated_at` with `clock_timestamp()`, RLS with one owner-only policy per operation
  (`user_id = (select auth.uid())`), no access for `anon`, and a `(user_id, server_updated_at)`
  index for pulls. One helper means a new table can't forget a rule.
- `user_id` defaults to `auth.uid()` and cascades from `auth.users`, so "delete my account" removes
  everything; the app itself only soft-deletes (`deleted_at`).
- "One per day" rules (`habit_logs`, `daily_logs`, `daily_plans`, `day_overrides`, `reviews`,
  `settings.key`) are partial unique indexes `where deleted_at is null`, so a tombstone never blocks
  a new row.
- `projects.next_action_task_id` and `inbox_items.converted_id` have no foreign key: the first
  forms a cycle with `tasks.project_id`, the second can point at different tables. The app keeps
  them valid. Every other reference is a real foreign key.
- RLS is tested without the full Supabase stack: `supabase/tests/supabase-shim.sql` recreates the
  `anon`/`authenticated` roles, `auth.users` and `auth.uid()` on plain Postgres, then
  `supabase/tests/rls.test.sql` signs in as a second user and checks it can't read, update, delete
  or insert-as-owner in any table. CI runs it on every PR (`rls` job).

## Consequences

- The shim must stay a faithful copy of the few Supabase pieces it imitates; it is never applied
  to a real project.
- The sync engine (next step) must handle a unique-index conflict when two offline devices create
  "the same day's" row with different ids, and must normalise Postgres timestamps
  (`+00:00`) to the app's `toISOString()` form before comparing them.
