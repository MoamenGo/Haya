#!/usr/bin/env bash
# Applies the shim + every migration to an empty Postgres, then runs the RLS
# tests. Needs DATABASE_URL pointing at a throwaway database.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DATABASE_URL:?set DATABASE_URL to an empty test database}"
psql_run() { psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q "$@"; }
psql_run -f tests/supabase-shim.sql
# The same script that updates the real database after each merge.
./apply-migrations.sh
psql_run -f tests/rls.test.sql
