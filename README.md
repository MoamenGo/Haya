# حياة (Haya)

A private, single-user life operating system. One app (PWA) that opens in the browser on a
desktop, installs on a phone like a native app, and works offline.

The full specification is [`CLAUDE.md`](CLAUDE.md). Decisions are in [`docs/decisions/`](docs/decisions/),
the data model in [`docs/erd.md`](docs/erd.md), and the screen map in [`docs/routes.md`](docs/routes.md).

## Status
**Phase 0 — Foundation** (this version): Arabic-first RTL shell with English, light/dark theme,
responsive navigation (phone bottom bar, desktop sidebar), local database (Dexie) with settings and
the 11 seeded life areas, installable PWA with offline app shell, CI.

**Phase 1, part 1 — Daily habits**: the 3 starter habits of the 14-day plan (each with a
hard-day version that counts as success), Minimum mode, prayer times computed on the device,
a gentle 7-day dot view, the one-minute evening check-in, and JSON backup export/import.

Next in Phase 1: capture + inbox, tasks and Big Rocks, projects with WIP limits, goals,
day-type overrides, week view and weekly review.

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
  components/layout/   app shell, sidebar, bottom nav
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
