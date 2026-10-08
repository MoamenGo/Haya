#!/usr/bin/env bash
# Brings a database up to date: applies every file in supabase/migrations that it
# has not seen yet, oldest first, each in its own transaction, and records it in
# haya_meta.applied_migrations so it never runs twice.
#
# Migrations that were pasted into the SQL Editor by hand (before this script
# existed) fail with "already exists"; those are recorded as applied and skipped.
# Any other error stops the script, and that migration's transaction is rolled
# back, so the database is never left half-changed.
#
# Used by .github/workflows/migrate.yml (after every merge) and by the RLS tests.
# Needs DATABASE_URL.
set -euo pipefail
cd "$(dirname "$0")"
: "${DATABASE_URL:?set DATABASE_URL to the database to update}"

psql_run() { psql "$DATABASE_URL" -X -q -t -A -v ON_ERROR_STOP=1 "$@"; }

# A schema of its own: not exposed by the Supabase API, and no migration creates it.
psql_run -c "set client_min_messages = warning;
  create schema if not exists haya_meta;
  create table if not exists haya_meta.applied_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  );"

record() { psql_run -c "insert into haya_meta.applied_migrations (name) values ('$1') on conflict do nothing"; }

for file in migrations/*.sql; do
  name=$(basename "$file")
  if [ -n "$(psql_run -c "select 1 from haya_meta.applied_migrations where name = '$name'")" ]; then
    echo "= $name (already applied)"
    continue
  fi
  # The migration and its record succeed or fail together.
  if output=$({ cat "$file"; printf '\ninsert into haya_meta.applied_migrations (name) values (%s);\n' "'$name'"; } |
    psql_run --single-transaction -f - 2>&1); then
    echo "+ $name applied"
  elif grep -q "already exists" <<<"$output"; then
    record "$name"
    echo "= $name was already run by hand; recorded"
  else
    echo "! $name failed, nothing from it was kept:" >&2
    echo "$output" >&2
    exit 1
  fi
done
