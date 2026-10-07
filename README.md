# حياة (Haya)

A private, single-user life operating system. One app (PWA) that opens in the browser on a
desktop, installs on a phone like a native app, and works offline.

The full specification is [`CLAUDE.md`](CLAUDE.md). Decisions are in [`docs/decisions/`](docs/decisions/),
the data model in [`docs/erd.md`](docs/erd.md), and the screen map in [`docs/routes.md`](docs/routes.md).

**New to the code?** Start with the Arabic code guide: [`docs/code-guide-ar.md`](docs/code-guide-ar.md).

## Status
**Phase 0 — Foundation** (this version): Arabic-first RTL shell with English, light/dark theme,
responsive navigation (phone bottom bar, desktop sidebar), local database (Dexie) with settings and
the 11 seeded life areas, installable PWA with offline app shell, CI.

**Phase 1, part 1 — Daily habits**: the 3 starter habits of the 14-day plan (each with a
hard-day version that counts as success), Minimum mode, prayer times computed on the device,
a gentle 7-day dot view, the one-minute evening check-in, and JSON backup export/import.

**Phase 1, part 2 — Capture and tasks**: a floating + (Ctrl/Cmd+K on desktop) that saves
anything to the Inbox in seconds, one-tap inbox processing, a Tasks screen (today / later / done),
up to 3 Big Rocks per day, rough estimates, and a capacity bar on Today.

**Phase 1, part 3 — Projects and goals**: at most 3 active projects (starting a 4th asks which
one to pause), a clear next action per active project, and light goals that start in "Not now"
with at most 3 active per horizon.

**Phase 1, part 4 — Week and weekly review**: a Saturday-to-Friday week view where any date's
type can be changed (leave, exam, travel) with its own free minutes and a note, a calm Friday
review (a few optional questions plus neutral facts about the week), and next week's top 3 shown
on the week view. On the phone, a "More" screen holds the sections that don't fit the bottom bar.

Phase 1 is now complete.

**Phase 2, part 1 — Cloud schema**: `supabase/migrations/` mirrors every local table with Row
Level Security (owner only) and a server timestamp for syncing. `pnpm test:rls` (needs
`DATABASE_URL` to an empty Postgres) proves a second user can't read or write the owner's rows;
CI runs it on every PR. See ADR-002.

**Phase 2, part 2 — Sync engine**: pull-then-push sync with merges and a conflict log (ADR-003).

**Phase 2, part 3 — Sign-in**: Settings → Account & sync signs in with an emailed 6-digit code
(or link), and a small indicator shows synced / syncing / offline / problem. Without the two
`VITE_SUPABASE_*` variables the app stays local-only. One-time setup: `docs/setup-cloud.md`.

**Phase 2, part 4 — Keep-alive and backups**: a daily GitHub Action keeps the free Supabase project
from pausing, and a Friday Action commits an `age`-encrypted dump to a separate private repository.
Both stay idle until their secrets are added (see `docs/setup-cloud.md`).

**Design**: a quiet, flat interface (cool mineral greys, hairline panels, one Nile-green colour)
with a single rich element: the prayer "sky" on Today, whose colour follows the real time of day and
shows the five prayers on one track. Readex Pro for text, Reem Kufi for titles, and a fluid type scale
that adapts from phone to wide desktop. All design tokens live in `src/index.css`.

## Run it locally
Requires Node.js 22+ and pnpm (`corepack enable`).

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # unit tests
pnpm lint
pnpm typecheck
pnpm build && pnpm preview   # test the installable/offline build here
```

## Project layout
```
src/
  app/                 router, PWA registration, language/theme sync
  components/layout/   app shell, sidebar, bottom nav, page header
  index.css            design tokens: colours, fluid type scale, radii, shadows
  components/ui/       small UI primitives (shadcn/ui style)
  core/db/             Dexie schema (versions), row helpers, seed data
  core/time/           day types, Gregorian + Hijri formatting
  i18n/                ar.json, en.json
  modules/<module>/    pages, components, hooks, repo.ts (the only code touching the DB)
tests/unit/            Vitest tests (IndexedDB is faked in Node)
```

## Deploy (Cloudflare Pages, free)
1. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, pick this repository.
2. Build command `pnpm build`, output directory `dist`.
3. Security headers come from `public/_headers`.

## Install on the phone
Open the deployed URL. Android Chrome: menu → **Install app**. iPhone Safari: Share →
**Add to Home Screen**.
