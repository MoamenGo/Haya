# ADR-001: Application stack

- Status: proposed (waiting for owner approval)
- Date: 2026-10-06

## Context
Hayah OS is a private, single-user life OS (see `CLAUDE.md`). It must run on a phone and a
desktop, work offline, cost nothing to run, and stay readable for an owner who is learning to
program. Past tools failed because they added friction, so the app must open fast and capture in
under 5 seconds.

## Decision
One codebase, shipped as an installable **PWA**:

| Concern | Choice |
|---|---|
| Language | TypeScript, `strict` |
| App | React + Vite single-page app |
| Offline / install | `vite-plugin-pwa` (Workbox service worker) |
| Routing | TanStack Router |
| UI | Tailwind CSS + shadcn/ui (Radix) + Lucide, logical CSS properties only (RTL) |
| Local DB | Dexie.js over IndexedDB, `dexie-react-hooks` (source of truth on each device) |
| UI state | Zustand (UI-only state) |
| Validation | Zod (shared by forms, repos, Edge Functions) |
| Cloud (Phase 2) | Supabase Free: Postgres + Auth (magic link) + RLS + Edge Functions + pg_cron |
| Hosting | Cloudflare Pages (static) |
| Prayer times | `adhan` (computed on device, no API) |
| Dates | `date-fns`; Hijri via `Intl.DateTimeFormat('ar-EG-u-ca-islamic-umalqura')` |
| IDs | UUID v7 generated on the client |
| i18n | `i18next` + `react-i18next` (ar default, en) |
| Tests | Vitest, Testing Library, `fake-indexeddb`, Playwright |
| Tooling | pnpm, ESLint, Prettier, GitHub (private) + Actions |

The UI talks only to the local database. A separate sync engine (`src/core/sync`) moves dirty
rows to Supabase and pulls newer rows back (last-write-wins on `updated_at`, pull cursor on
`server_updated_at`).

## Alternatives considered
- **Next.js**: server components and server actions need the network; offline-first is the core
  requirement, and Cloudflare hosting would need an adapter. Rejected.
- **Native mobile app (React Native / Flutter) + separate desktop app**: two or three codebases
  for one person. A PWA installs on Android, iOS (home screen) and desktop from one build. Rejected.
- **Electron / Tauri desktop app**: adds a build and update channel without giving anything the
  browser PWA lacks for this use. Can be revisited later.
- **Firebase** instead of Supabase: works, but Postgres + RLS + SQL migrations are easier to
  inspect, export and learn from. Supabase chosen.

## Consequences
- Everything works from IndexedDB first; phone and desktop see each other's changes only after
  Phase 2 adds Supabase sync.
- Supabase Free pauses idle projects after about 7 days; daily use plus a keep-alive Action
  mitigates it. Re-check the free-tier limits before Phase 2.
- iOS Web Push requires the PWA to be added to the home screen; Telegram stays the primary
  notification channel (Phase 7).
- Dexie schema versions and Postgres migrations must change together.
