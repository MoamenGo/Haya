# CLAUDE.md — Hayah OS (حياة) · Personal Life Operating System

> **Read this whole file before any architectural change.** It is the single source of truth for this project.
> If code and this file disagree, stop and ask — do not silently pick one.
> Personal values (city, shift hours, family members, Qur'an progress, currencies…) live in the app's **Settings**, not in this file. This file defines rules and defaults only.

---

## 0. Project Identity

A private, **single-user** Personal Life Operating System for one person: a hospital pharmacist in Egypt who is learning programming, memorizing the Qur'an, studying Islamic knowledge, learning many technical subjects, working as a freelancer, building startup ideas, and caring for his family.

It is **not** a generic productivity app, not multi-tenant, not social, not commercial.

**Final design goal:**
> "One quiet place where I can see what matters, decide what to do next, protect my time, learn continuously, fulfil my responsibilities, care for my family, keep my worship, build meaningful work — and avoid destroying myself through overcommitment."

The system must make life simpler — it must never become another life project that consumes the owner's life.

---

## 1. Non-Negotiable Principles

1. **Sustainability over output.** Optimize for consistency, clarity, low cognitive load, realistic execution. Never equate productivity with personal worth.
2. **The system helps the owner say NO.** Hard WIP limits on active projects and learning paths. Ideas never become commitments automatically ("Not Now" is a first-class state).
3. **The day is anchored to prayer.** Time blocks are expressed relative to prayers (after Fajr, Duha, after Dhuhr, after Asr, Maghrib–Isha, after Isha), not only clock hours.
4. **Minimum Viable Day (MVD).** Every important area has a minimum version. On hard days, doing the minimum counts as a fully successful day and never breaks continuity.
5. **No guilt mechanics.** No red "failure" states for worship or habits, no harsh streak resets, no motivational spam, no compulsive gamification. Progress indicators support reflection, not pressure.
6. **Capture in under 5 seconds.** Capture first, classify later.
7. **Local-first / offline-first.** Every core screen works without network on phone and desktop; sync runs in the background. Never *claim* a feature works offline until it is tested offline.
8. **Free forever.** No mandatory paid service. Ask before adding any recurring paid dependency.
9. **Privacy first.** This database holds worship, family, finance, and reflections. No analytics, no third-party tracking, no public indexing. The owner can export and delete everything.
10. **Low maintenance.** If a feature needs constant manual upkeep, redesign or remove it. Every feature must answer: *"Does this reduce cognitive load or improve a meaningful decision?"*
11. **Learner-readable code.** The owner is learning to program. Code must be clear and conventional, not clever.
12. **Smallest reliable version first.** Each phase ships something actually used before the next begins.

---

## 2. Owner Context (defaults — editable in Settings)

| Item | Default |
|---|---|
| Timezone | `Africa/Cairo` |
| Week starts | **Saturday** |
| Hospital days | Saturday, Sunday, Wednesday (hours entered by user) |
| Deep-work days | Monday, Tuesday, Thursday |
| Rest / family day | Friday |
| Prayer calculation | Egyptian General Authority of Survey |
| UI language | Arabic (primary, RTL) + English |
| Canonical date storage | Gregorian ISO; Hijri is display/computed only |
| Currency | EGP (multi-currency supported) |

---

## 3. Product Boundary

This system is **not** a medical device, therapist, religious authority, or financial advisor.
- It never diagnoses. Wellbeing output is neutral: `light` / `balanced` / `heavy` / `recovery recommended`.
- It never issues religious rulings. User notes are labelled as notes, distinct from sources and quotations. Where a fiqh choice affects a calculation (e.g., zakat nisab basis), the choice is a user setting with a "confirm with a qualified scholar" hint.
- It never stores identifiable patient data (no names, file numbers, IDs) — hospital notes and case logs must be de-identified. Show a reminder in the case-log form.
- It organizes information and supports decisions; it never makes high-stakes decisions for the owner.

---

## 4. Planning Philosophy

### 4.1 Commitment levels (what gets cut first when overloaded)
| Level | Contents | Rule |
|---|---|---|
| **L1 — Non-negotiable** | prayers & worship minimum, essential sleep/health, hospital shifts, family responsibilities, critical financial/work deadlines | never auto-removed |
| **L2 — Important** | active goals, active projects, freelance deliverables, professional development | reduced only after L3/L4 |
| **L3 — Growth** | learning paths, reading, hobbies, experiments | deferred before L2 |
| **L4 — Optional** | ideas, exploration, nice-to-haves | removed first |

Every task/project/routine carries a `commitment_level`. When a day or week is over capacity: remove L4 → defer L3 → reschedule L2 → **protect L1, recovery, and family time.**

### 4.2 Day types
The planner generates each day from its type. All values are defaults stored in Settings.

| Day type | Default days | Discretionary capacity | Focus |
|---|---|---|---|
| `hospital` | Sat, Sun, Wed | 120 min | Qur'an review (light), pharmacy cards, family, recovery |
| `deep_work` | Mon, Tue, Thu | 360 min | freelance/startup, learning, new Qur'an memorization |
| `rest` | Fri | 60 min | family, free reading, weekly review, Surat Al-Kahf |
| `custom` | any date override | user-defined | exams, travel, illness, Ramadan, Eid |

Day type can be overridden per date. Ramadan and Eid are supported as seasonal profiles (different capacity + anchors).

### 4.3 Capacity model
```
discretionary_capacity = day_type default (or computed:
    waking time − sleep − fixed commitments − shift − commute − meals/personal care − family block)
plannable = discretionary_capacity × planning_utilization   // default 0.70
buffer    = discretionary_capacity − plannable               // 30% kept free
```
- A task's `estimated_minutes` counts against `plannable`. The planner warns — never silently blocks — when over.
- **Adaptive:** if the owner completes < 60% of planned minutes for 2 consecutive weeks, suggest lowering utilization by 0.05 (never below 0.50). Always a suggestion, never automatic.
- Max **3 Big Rocks** (top priorities) per day.
- The day is never filled minute-by-minute.
- These are planning heuristics, not scientific laws. All constants live in `src/core/planner/config.ts` — no magic numbers in logic.

### 4.4 Hospital-day rule
On `hospital` days: no heavy deep-work blocks unless explicitly scheduled; Qur'an minimum and family connection preserved; optional learning reduced; recovery prioritized. The day **after** a hospital day avoids heavy tasks before Dhuhr where possible.

### 4.5 Minimum Viable Day
One button on Today: **"Hard day → Minimum mode"**. It hides everything except L1 + each area's configured minimum (e.g., Qur'an 1 page review, adhkar, 10 min family, 5 min planning). Logged as `minimum_mode = true`, counted as success, never breaks continuity.

### 4.6 Weekly capacity check
At weekly planning (default Friday evening, before the Saturday week start): compute the week's capacity per day type vs. demand from scheduled tasks/projects/deadlines. Show overload **before** the week begins and propose cuts in commitment-level order. The owner confirms every change.

---

## 5. Domain Model

```
Vision (one short text)
 └─ Life Areas
     └─ Goals (horizon: month / quarter / year / long-term)
         └─ Projects (finite outcome, has a Next Action)
             └─ Tasks → Subtasks (checklist inside task)

Routines → Routine Items → Habit Logs   (separate from tasks)
Daily Plan → Daily Plan Items → Daily Review

Learning Domains → Learning Paths → Resources → Study Sessions → Notes → Review Items
Qur'an Pages → Review Items (shared review engine)
Books → Reading Sessions → Notes
Ideas (Idea Lab) → may convert to Project
People → Family Events / Contact Log
Clients → Freelance Projects (= Projects with kind=freelance) → Invoices
Accounts → Transactions → Budgets / Savings Goals / Zakat Records
Events + Work Shifts → Calendar
Reviews: daily / weekly / monthly / quarterly
```

### 5.1 Life Areas (seeded, editable, custom allowed)
Keep areas **few**; subjects of study are *learning domains*, not areas.
1. Deen & Worship (عبادة)
2. Qur'an (القرآن)
3. Islamic Knowledge (العلم الشرعي)
4. Family & Relationships (الأسرة)
5. Health & Recovery (الصحة)
6. Hospital & Pharmacy (المستشفى والصيدلة)
7. Learning (التعلم) — contains learning domains: AI, Cybersecurity, Bioinformatics, Mathematics, Physics, Drones/Robotics, Programming, Software Architecture, Pharmacy, + any future subject
8. Reading (القراءة)
9. Freelancing (العمل الحر)
10. Ventures & Ideas (المشاريع الناشئة والأفكار)
11. Finance (المال)

Areas need no active maintenance; an area with nothing active simply stays quiet.

---

## 6. Modules

### 6.1 Capture & Inbox
- Global capture: floating **+** on mobile, `Ctrl/Cmd+K` on desktop.
- Capture types: task, idea, note, link/resource, expense, reminder, book. Default = untyped inbox item.
- Smart parsing (light, deterministic, no AI): a URL → resource; `#tag`; `!` → important; `ج` / `$` + number → expense candidate.
- Capture works offline (writes to IndexedDB immediately).
- Inbox processing screen: convert to task/project/note/idea/resource/expense, or delete.

### 6.2 Tasks
Fields: `title, notes, area_id, project_id?, goal_id?, status, priority, commitment_level, energy (light|medium|heavy), estimated_minutes, actual_minutes, due_date?, scheduled_date?, prayer_block?, is_big_rock, recurrence_rule?, completed_at`.
- Status: `inbox · next · scheduled · in_progress · waiting · done · cancelled`
- Priority: `critical · important · normal · low`
- Tasks must be actionable. UI hint: *Bad: "Study AI" → Good: "Watch lesson 3 on attention and write 5 notes."*
- Recurrence via RRULE strings (`rrule` library).
- Subtasks are a checklist field, not a separate hierarchy level.

### 6.3 Projects
Fields: `title, outcome, reason, area_id, goal_id?, kind (personal|freelance|venture|learning|hospital), status, priority, commitment_level, next_action_task_id, deadline?, estimated_hours, actual_hours (derived from time entries), energy, review_date, client_id?`.
- Status: `inbox · planned · active · blocked · waiting · paused · done · archived`
- **WIP limit:** default **3 major active projects** total across all kinds (configurable). Activating a 4th requires pausing one — the UI asks which.
- Every active project must have a next action; projects without one are flagged in weekly review.
- Desktop: Kanban + list. Mobile: list grouped by status.

### 6.4 Goals
Fields: `title, why, desired_outcome, area_id, horizon, success_metric, baseline, target, unit, start_date, target_date, status, priority, estimated_weekly_hours, review_frequency`.
- Status: `idea · planned · active · paused · done · cancelled · archived` — `idea` is the "Not Now" state.
- Limit active goals per horizon (default: 3 quarterly). Goals measure outcomes, not hours.

### 6.5 Routines & Habits
- Each routine: `title, area_id, anchor (prayer or clock time), frequency (RRULE), duration, minimum_version, full_version, is_worship, commitment_level`.
- Log statuses: `full · minimum · skipped`. No "failed".
- Continuity shown as a gentle calendar/dot view. Streaks are optional, hidden by default, and allow one grace day per week. Never the primary metric.
- Worship routines (prayer on time/congregation, morning & evening adhkar, witr, Sunnah fasting Mon/Thu & white days by Hijri date, Kahf on Friday) show only encouragement — no percentages, no red.
- Health: sleep hours, energy 1–5, optional stress 1–5, movement. All optional.

### 6.6 Today (the heart of the system)
Answers: what matters today, what's fixed, what's the minimum, what fits, what to postpone, what NOT to do.

Layout (mobile, top to bottom):
1. Gregorian + Hijri date, day type, next prayer with countdown.
2. Capacity bar: "planned 180 of 252 min".
3. Big Rocks (≤ 3).
4. Fixed commitments (shift, events).
5. Timeline grouped by prayer blocks.
6. Qur'an today (new memorization + due revision) — one tap to start.
7. Due review cards (pharmacy/learning/Islamic) — count + start.
8. Routine dots.
9. Parking lot (deferred today, one tap to move to another day).
10. Buttons: **Minimum mode** · **Evening review**.

Desktop: Today + week strip + active projects side panel. Calm UI — no chart walls.

### 6.7 Calendar
Internal calendar first: day / week / month views showing shifts, events, scheduled tasks, study sessions, family events, deadlines. Hijri dates optional overlay. ICS export (and later import). Google Calendar only if the owner asks.

### 6.8 Qur'an
Purpose: support memorization and revision — never replaces a teacher.
- **Unit:** Madinah Mushaf page (1–604). Each page also stores its surah/ayah range (from Tanzil metadata) so progress can be viewed by page, juz, hizb, or surah.
- Page state: `not_started · memorizing · memorized` + `strength`, `mistakes_count`, `last_reviewed`, `next_review`, notes.
- Session modes: `new` · `near_review` (recent pages, daily) · `far_review` · `listening` · `recitation_with_teacher`.
- **Two revision strategies (user chooses, can combine):**
  1. **Fixed cycle (manzil):** e.g., N pages/day rotating through all memorized pages — the traditional method.
  2. **Adaptive:** shared review engine (FSRS) schedules each page; rating after recitation: forgot / hard / good / easy.
- Daily caps by day type. Near-review window default = last 20 pages.
- Heatmap of the Mushaf (strength by page/juz) — neutral colour scale, no red.
- Text: Tanzil Uthmani text bundled locally as JSON with attribution and **unmodified**, following Tanzil's license terms. Font: an openly licensed Uthmani/Qur'an font (verify license before bundling). Text display is optional in MVP — tracking works without it.

### 6.9 Islamic Knowledge
Learning paths of kind `islamic`: subject (fiqh, aqeedah, hadith, tafsir, usul, seerah, arabic…), teacher/scholar, book/mutn, lesson, progress, source link.
Note sub-types that must stay distinct: `source_excerpt · quotation · personal_note · interpretation · question`.
"Questions for scholars" list. Review cards for definitions, evidences, mutun lines.

### 6.10 Learning OS
Generic engine for any subject (AI, cybersecurity, bioinformatics, math, physics, drones, programming, pharmacy…).
- **Learning Domain** (user-defined) → **Learning Path**: `objective, prerequisites, syllabus (ordered topics), milestones, status (active|parked|done), skill_map (topic → level 0–3)`.
- **WIP limit:** default **3 active learning paths**. Activating a 4th requires parking one.
- **Evidence over hours:** progress = concepts learned, exercises done, projects built, explanations written, reviews completed, assessments passed. Minutes are recorded but secondary.
- Study session: `path_id, resource_id?, date, minutes, what_i_learned, evidence_link?, created_cards_count`.
- Pharmacy is a learning domain with extras: drug/topic cards, de-identified case log (see §3), Anki CSV import/export.

### 6.11 Resource Library & Ingestion
All links live here — never scattered across the app.
Fields: `url (normalized), title, author_provider, type (course|book|paper|documentation|video|playlist|article|repository|dataset|tool|podcast|lecture|other), domain_id, path_id?, tags, difficulty, estimated_hours, language, free_or_paid, status (queued|in_progress|done|dropped), quality_rating, reliability_note, date_added, last_verified`.

**Ingestion workflow** (owner pastes a batch of URLs or a text list):
1. Normalize URL (strip tracking params, canonical host) → **deduplicate**.
2. Classify type by URL pattern (youtube → video/playlist, github → repository, arxiv/doi → paper, …).
3. Owner assigns domain/path in a review table (bulk edit).
4. Save as `queued`. Fetching titles is optional and must go through a server function (no client-side scraping).
Religious, medical, and scientific sources must keep: URL, provider, author, date accessed, reliability note. A professional-looking URL is not automatically trustworthy.

Seed file: `docs/resources.md` (owner's links, grouped by domain) → imported once via the ingestion screen.

### 6.12 Reading
Books/papers/articles: `status (want_to_read|planned|reading|paused|done|abandoned)`, pages/chapters, reading sessions, highlights, summary, rating, linked domain/project. Flexible yearly target (books or daily minutes). Only one or two "reading" at a time recommended (soft limit).

### 6.13 Knowledge / Notes
Lightweight Zettelkasten — no forced complexity.
- Types: `fleeting · literature · permanent · question · summary · project · study · reflection`.
- Markdown body, tags, `[[wiki links]]` with backlinks, source reference, optional `review_at`.
- Export to Markdown files (Obsidian-compatible folder structure).

### 6.14 Shared Review Engine (spaced repetition)
One engine for Qur'an pages, pharmacy, Islamic knowledge, programming, math, etc.
- Interface `ReviewScheduler` in `src/core/review/` with two implementations:
  - `FsrsScheduler` (default) — wraps **ts-fsrs**. Isolated behind the interface so it can be swapped.
  - `FixedIntervalScheduler` — simple configurable intervals (used for the Qur'an fixed cycle and as fallback).
- Stores: `review_items (kind, ref_id, front?, back?, scheduler, state jsonb, due_at, mistakes, review_count)` and `review_logs (item_id, rating, reviewed_at, elapsed_days, scheduled_days)`.
- Daily review cap per day type so reviews never snowball into guilt; overflow rolls forward silently.

### 6.15 Work
**Hospital:** recurring shift schedule (start, end, location, role, commute, prep, recovery need), per-date overrides (swaps, leave). De-identified case log. Hospital tasks.

**Freelance:** clients; freelance projects are `projects` with `kind=freelance` plus `quoted_amount, received_amount, expenses, deliverables, proposal_link`. Pipeline status: `lead · proposal · negotiating · active · waiting · delivered · paid · archived`. Time tracking (start/stop timer → `time_entries`). Invoices with due/paid dates. Warn when committed hours exceed weekly capacity.

**Idea Lab (startups & software ideas):**
Fields: `title, problem, target_user, solution, why_now, market_hypothesis, technical_complexity (1–5), expected_value (1–5), learning_value (1–5), estimated_effort, next_validation_step, status`.
Status: `captured · exploring · validating · promising · parked · rejected · converted_to_project`.
- **Idea Graveyard:** rejected ideas kept with reason, out of sight.
- Converting to a project respects the project WIP limit.
- Monthly review surfaces parked ideas once.

### 6.16 Family & Relationships
- People: `name, relation, birthday (Gregorian or Hijri), contact_every_days?, last_contact_at, notes, gift_ideas`.
- Family events (recurring, Hijri-aware: Eid, Ramadan gatherings).
- Protected family blocks in the plan (default: Friday + Maghrib–Isha).
- Gentle silaturrahim reminders (never nagging). Promises list ("things I said I would do").
- Weekly review asks about family time; Burnout Guard watches for days without it.

### 6.17 Finance
Manual entry only — **never connect bank accounts.**
- Accounts, transactions (income/expense, category, account, date, note, linked project?), recurring expenses, monthly budgets, savings goals.
- Income sources: hospital, freelance (linked to invoices), other. Startup spending tracked per venture project.
- Money stored as **integer minor units** (`amount_minor`) + `currency`. Never floats.
- **Zakat helper:** tracks zakatable assets and the Hijri hawl date; nisab basis (gold 85 g or silver 595 g) and current gold/silver price are **user inputs**; shows estimate + reminder + disclaimer to confirm with a scholar.
- Reports: monthly income/expenses, savings rate, freelance revenue, project cost, category trends. Simple charts only.

### 6.18 Reviews (rituals)
- **Daily (evening, ~3 min):** what got done, energy 1–5, sleep, one gratitude (الحمد لله على…), top 3 for tomorrow.
- **Weekly (Friday, 10–20 min):** process inbox → what went well / didn't → what gave/drained energy → worship → family time → learning → neglected areas → stop/continue/reduce → is the system creating pressure? → capacity check for next week (§4.6) → top 3 outcomes. The system **suggests** a weekly plan; the owner confirms.
- **Monthly:** goals, projects, finances, learning, reading, Qur'an, family, health, work, lessons; parked ideas surfaced once.
- **Quarterly:** keep / stop / start / defer / redesign. This is the main mechanism for **reducing** commitments.

### 6.19 Burnout Guard (core, not optional)
Lives in `src/core/wellbeing/`. Pure functions, fully unit-tested.

Signals (all configurable thresholds):
- 7-day average energy < 2.5
- sleep < 6 h for 3 consecutive nights
- weekly work hours (shifts + freelance + ventures) > configured limit
- active projects or learning paths > WIP limit
- big-rock completion < 40% for 2 weeks
- overdue tasks > threshold
- 3+ consecutive days without a family block
- several consecutive `heavy` days

Responses (suggestions only, each dismissible):
- suggest a **light week** (capacity × 0.6)
- suggest a specific project/path to pause, or tasks to reschedule rather than add
- recommend a recovery day after several heavy days
- gentle sleep/family nudge

Never: blame messages, red failure stats, comparisons, medical language.

### 6.20 Search
Local-first search over IndexedDB using **MiniSearch** (in-browser full-text). Indexes tasks, projects, goals, notes, books, resources, ideas, paths, people, transactions.
**Arabic normalization is mandatory** for both indexing and querying: strip tashkeel and tatweel, unify أ/إ/آ → ا, ى → ي, ة → ه (search only, never alter stored text).

### 6.21 Notifications
Minimal. Default max 3/day, per-category toggles, quiet hours (default after Isha + 1 h until Fajr).
- **Primary channel: Telegram Bot** (free, reliable on Android/iOS/desktop) via a Supabase Edge Function triggered by `pg_cron`. Messages: morning brief, evening review reminder, important deadlines, family events, weekly review.
- **Secondary:** Web Push for the installed PWA (note: iOS requires the PWA to be added to the home screen).
- Never: motivational spam, streak pressure, guilt-based reminders.

### 6.22 AI Layer — future (Phase 9), not MVP
Possible: daily/weekly plan suggestions, note summaries, notes → tasks, resource classification, study plan drafts, overload detection explanations, natural-language questions about own data.
Rules: AI never silently modifies data; every AI change shows assumptions + affected items + approve/reject + undo. No personal data sent to external AI APIs without explicit opt-in per category, with the provider's data policy shown. API keys live only in server secrets.

---

## 7. Technical Architecture

### 7.1 Final stack (all free)
| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript (`strict`) | safety, great for a learner |
| App | **React + Vite SPA** | simplest fit for an offline-first PWA; deploys as static files anywhere |
| PWA | `vite-plugin-pwa` (Workbox) | one app installed on phone + desktop |
| Routing | TanStack Router (type-safe) | |
| UI | Tailwind CSS + shadcn/ui (Radix) + Lucide icons | accessible primitives, RTL via logical properties |
| Local DB | **Dexie.js** (IndexedDB) + `dexie-react-hooks` | local-first source of truth |
| UI state | Zustand (small, only for UI state) | |
| Forms / validation | React Hook Form + **Zod** | schemas shared by UI, DB layer, and Edge Functions |
| Cloud | **Supabase Free**: Postgres, Auth, RLS, Edge Functions, `pg_cron` | sync, auth, notifications |
| Hosting | **Cloudflare Pages** (static) | free, fast; Vercel/Netlify as drop-in alternatives |
| Review engine | `ts-fsrs` | modern FSRS algorithm |
| Prayer times | `adhan` (adhan-js), computed locally | no API, works offline |
| Dates | `date-fns` + `date-fns-tz`; Hijri via `Intl.DateTimeFormat` (`islamic-umalqura`) | |
| Recurrence | `rrule` | |
| IDs | UUID v7 (`uuid` package) generated on the client | offline creation, time-sortable |
| Search | MiniSearch | in-browser full-text |
| Markdown | `react-markdown` + `remark-gfm` | |
| Charts | Recharts (sparingly) | |
| i18n | `i18next` + `react-i18next` | AR/EN, RTL/LTR switching |
| Tests | Vitest, Testing Library, Playwright, `fake-indexeddb` | |
| Tooling | pnpm, ESLint, Prettier, GitHub (private) + Actions, Dependabot | |
| Local dev | Node.js LTS, VS Code, Git, Supabase CLI (Docker only if local Supabase is used) | |

**Why not Next.js** (decision recorded): the core requirement is offline-first on phone and desktop. Server Actions and server components need the network, and Next.js on Cloudflare needs an adapter. A Vite SPA + Dexie + Supabase keeps one simple mental model: *the app talks to the local DB; the sync engine talks to the cloud.* Revisit only if server rendering becomes a real need.

**Supabase Free caveats** (re-check limits before deploying): ~500 MB database, free projects **pause after 7 days of inactivity**, limited backups. Mitigations: daily use keeps it active + a daily keep-alive GitHub Action; weekly backup Action; in-app export. Never store large files in Postgres.

### 7.2 Layers
```
UI (routes, components)          ← no business logic
  ↓ hooks
Application services (src/core/*) ← planner, review, wellbeing, capacity, zakat… pure & tested
  ↓
Repositories (src/modules/*/repo.ts) ← the ONLY code that touches Dexie
  ↓
Dexie (IndexedDB)  ⇄  Sync Engine (src/core/sync)  ⇄  Supabase (Postgres + RLS)
```
Modular monolith. No microservices. The Supabase client is used only inside `src/core/sync`, `src/core/auth`, and Edge Functions.

### 7.3 Sync design
- Every synced row has: `id uuid (v7)`, `user_id`, `created_at`, `updated_at` (client clock, used for conflict resolution), `deleted_at` (tombstone — soft delete), and on the server `server_updated_at` (set by a Postgres trigger; used as the pull cursor so device clock skew can't lose changes).
- Local-only fields: `_dirty` (0/1).
- **Push:** rows with `_dirty=1` → batched `upsert` → clear flag on success.
- **Pull:** rows with `server_updated_at > last_pull_cursor` per table → write locally unless local row is dirty and newer.
- **Conflicts:** last-write-wins by `updated_at` (single user, conflicts are rare). Log conflicts to a local `sync_conflicts` table for inspection.
- Triggers: app start, regaining connectivity, 3 s after a write (debounced), every 5 min while open.
- UI indicator: synced ✓ / syncing / offline / error (tap for details).
- Dexie schema versions and Postgres migrations must change **together** in the same PR.
- Hard deletes happen only via the "delete my data" flow.

### 7.4 Security model
- Supabase Auth with email magic link (+ optional passkey later). Exactly one account; **disable public sign-ups** after creating it.
- **RLS enabled on every table:** `user_id = auth.uid()` for select/insert/update/delete. RLS has automated tests.
- Client holds only the anon key. Service-role key and Telegram bot token exist only in Edge Function secrets / GitHub Actions secrets.
- All writes validated with Zod on the client and in Edge Functions; Postgres constraints (CHECK, NOT NULL, FK) as the last line.
- Content Security Policy headers on Cloudflare Pages; no third-party scripts; no analytics.
- Optional app lock (PIN) on the device for the PWA.
- Secrets never committed; `.env.example` only.

### 7.5 Backups & data ownership
- In-app **Export**: everything as JSON (re-importable), per-module CSV, notes as Markdown folder, calendar as ICS.
- **Import** from JSON backup (with preview + dry-run).
- GitHub Action weekly: dump data with the service key → encrypt (`age`) → commit to a separate private backup repo.
- "Delete all my data" with typed confirmation.

---

## 8. Database (tables)

All tables: `id uuid pk, user_id uuid not null, created_at, updated_at, server_updated_at, deleted_at`. Money in `*_minor bigint` + `currency`. Dates-only as `date`, instants as `timestamptz` (UTC). Never store formatted Arabic strings as dates.

```
settings(key, value jsonb)                         -- incl. day types, limits, location, prayer method
life_areas(name_ar, name_en, icon, color, sort_order, archived)
goals(area_id, title, why, desired_outcome, horizon, success_metric, baseline, target, unit,
      start_date, target_date, status, priority, est_weekly_hours, review_frequency)
projects(area_id, goal_id, kind, title, outcome, reason, status, priority, commitment_level,
         next_action_task_id, deadline, est_hours, energy, review_date, client_id,
         quoted_minor, received_minor, currency, pipeline_status)
tasks(area_id, project_id, goal_id, title, notes, checklist jsonb, status, priority, commitment_level,
      energy, est_minutes, actual_minutes, due_date, scheduled_date, prayer_block, is_big_rock,
      rrule, completed_at)
time_entries(project_id, task_id, started_at, ended_at, note)
routines(area_id, title, anchor, rrule, duration_min, minimum_version, full_version,
         is_worship, commitment_level, active)
habit_logs(routine_id, date, status)               -- full|minimum|skipped
day_overrides(date, day_type, note)
daily_plans(date, day_type, capacity_min, utilization, minimum_mode)
daily_plan_items(plan_id, item_type, item_id, block, order)
daily_logs(date, energy, stress, sleep_hours, gratitude, highlights, tomorrow_top3 jsonb)
reviews(kind, period_start, period_end, answers jsonb)   -- weekly|monthly|quarterly
events(title, starts_at, ends_at, all_day, location, category, rrule, hijri_recurring)
work_shifts(date, start_time, end_time, location, role, commute_min, notes)
shift_templates(weekday, start_time, end_time, location, role)
quran_pages(page_no 1..604, status, strength, mistakes_count, memorized_at, last_reviewed, notes)
quran_sessions(date, mode, pages int[], minutes, notes)
learning_domains(name, area_id, icon)
learning_paths(domain_id, kind, title, objective, prerequisites, syllabus jsonb, milestones jsonb,
               status, skill_map jsonb)
resources(url, url_normalized unique, title, author_provider, type, domain_id, path_id, tags text[],
          difficulty, est_hours, language, is_free, status, quality_rating, reliability_note,
          accessed_at, last_verified)
study_sessions(path_id, resource_id, date, minutes, what_learned, evidence_link)
review_items(kind, ref_type, ref_id, front, back, scheduler, state jsonb, due_at, mistakes, review_count)
review_logs(item_id, rating, reviewed_at, elapsed_days, scheduled_days)
books(title, author, type, status, total_pages, current_page, rating, summary, domain_id)
reading_sessions(book_id, date, pages_from, pages_to, minutes)
notes(title, body_md, type, area_id, source_ref, tags text[], review_at)
note_links(from_note_id, to_note_id)
ideas(title, problem, target_user, solution, why_now, market_hypothesis, tech_complexity,
      expected_value, learning_value, est_effort, next_validation_step, status, rejection_reason,
      project_id)
people(name, relation, birthday, birthday_hijri, contact_every_days, last_contact_at, notes, gift_ideas)
contact_logs(person_id, date, note)
clients(name, contact, notes)
invoices(client_id, project_id, amount_minor, currency, issued_at, due_at, paid_at)
finance_accounts(name, type, currency, archived)
transactions(account_id, kind, category, amount_minor, currency, date, note, project_id, recurring_id)
recurring_transactions(...same + rrule)
budgets(month, category, limit_minor, currency)
savings_goals(title, target_minor, currency, target_date)
zakat_records(hawl_start_hijri, nisab_basis, metal_price_minor, assets jsonb, due_minor, paid_at)
inbox_items(text, kind_hint, processed_at, converted_type, converted_id)
notification_prefs(category, channel, enabled, quiet_from, quiet_to)
```
Indexes on `(user_id, server_updated_at)` for every table plus common filters (`tasks.scheduled_date`, `review_items.due_at`, `transactions.date`).

---

## 9. UX, Design, i18n, Accessibility

**Feel:** calm, scholarly, professional, minimal. Generous spacing, excellent typography, few colours, subtle status indicators, light/dark themes. No neon dashboards, no fake-productivity aesthetics.

**Navigation**
- Mobile bottom bar (5): **Today · Qur'an · Learn · Work · More** + floating Capture.
- Desktop sidebar: Today, Calendar, Tasks, Projects, Goals, Qur'an, Learning, Reading, Knowledge, Work, Ideas, Family, Finance, Reviews, Settings. Search + Capture always in the header.
- Mobile is designed for thumbs (large targets, minimal typing, swipe actions) — never a shrunk desktop.
- Keyboard shortcuts on desktop (`Ctrl/Cmd+K` capture/search, `g t` Today, …).

**i18n**
- Arabic is first-class, English supported. All strings in `src/i18n/{ar,en}.json` — no hard-coded UI text.
- `dir` switches with language. Use **logical CSS properties only** (`ms-/me-/ps-/pe-`, `start/end`) — never `left/right` in layout.
- Numerals: Western digits by default, Arabic-Indic optional.
- Fonts: an Arabic UI font (e.g., IBM Plex Sans Arabic) + a Qur'an font for Mushaf text; self-hosted, licenses verified.
- Localized dates; Hijri shown alongside Gregorian where useful.

**Accessibility:** target WCAG 2.2 AA — keyboard navigation, visible focus, semantic HTML, labels, screen-reader names, contrast, `prefers-reduced-motion`, accessible dialogs/forms.

**Performance:** Today screen interactive in < 1 s from local DB; lazy-load module routes; virtualize long lists; no premature optimization.

**Every screen has:** loading, empty (with a helpful first action), and error states.

---

## 10. Repository Structure

```
hayah-os/
├── CLAUDE.md
├── README.md
├── .env.example
├── docs/
│   ├── decisions/            # ADRs: NNN-title.md (context, decision, consequences)
│   ├── resources.md          # owner's learning links, grouped by domain (ingestion seed)
│   └── erd.md
├── public/
│   ├── data/quran/           # Tanzil text + page/ayah metadata (with attribution file)
│   ├── fonts/
│   └── icons/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   ├── tests/                # RLS tests (pgTAP or SQL scripts)
│   └── functions/
│       ├── telegram-notify/
│       ├── morning-brief/
│       └── fetch-resource-title/
├── .github/workflows/        # ci.yml, keepalive.yml, backup.yml
├── src/
│   ├── app/                  # router, layouts, providers, PWA registration
│   ├── core/
│   │   ├── db/               # Dexie schema + versions
│   │   ├── sync/
│   │   ├── auth/
│   │   ├── time/             # day types, prayer times, Hijri, prayer blocks
│   │   ├── planner/          # capacity, daily/weekly planning, config.ts
│   │   ├── review/           # ReviewScheduler, FSRS + fixed interval
│   │   ├── wellbeing/        # Burnout Guard
│   │   ├── search/           # MiniSearch + Arabic normalization
│   │   ├── finance/          # money utils, zakat
│   │   ├── capture/          # parsing rules
│   │   └── export/
│   ├── modules/              # today, capture, tasks, projects, goals, routines, calendar,
│   │                         # quran, islamic, learning, resources, reading, notes,
│   │                         # work, ideas, family, finance, reviews, settings
│   │   └── <module>/{pages,components,hooks,repo.ts,schema.ts,types.ts,README.md}
│   ├── components/ui/        # shadcn primitives
│   ├── components/layout/    # shell, nav, capture button
│   ├── i18n/                 # ar.json, en.json, setup
│   └── lib/                  # tiny generic utils
└── tests/
    ├── unit/
    └── e2e/
```

---

## 11. Build Phases

Each phase ends with a deployed version the owner **actually uses for at least one week** before the next phase starts.

**Phase 0 — Foundation**
Repo, pnpm, Vite + React + TS strict, ESLint/Prettier, Tailwind + shadcn, i18n + RTL, theme (light/dark), app shell + responsive navigation, PWA (installable, app-shell cache), Dexie schema v1, settings store, CI (lint, typecheck, test, build), Cloudflare Pages deploy, ADR-001 (stack).

**Phase 1 — Daily loop (local-only)**
Capture + Inbox, Life Areas, Tasks, Projects (WIP), Goals (light), Routines + MVD, day types + overrides, prayer times + Hijri + prayer blocks, capacity planner, Today screen, Minimum mode, daily review, simple weekly review, week view, JSON export/import.

**Phase 2 — Cloud & security**
Supabase project, migrations mirroring Dexie, Auth (magic link, sign-ups disabled), RLS + RLS tests, sync engine + indicator, keep-alive + encrypted backup Actions. → *Now usable on phone and desktop together.*

**Phase 3 — Qur'an**
Page data + metadata, memorization tracking, fixed-cycle + FSRS revision, Today integration, heatmap, optional Mushaf text.

**Phase 4 — Learning OS**
Shared review engine for cards, learning domains/paths (WIP), resource library + ingestion from `docs/resources.md`, study sessions, pharmacy (cards, case log, Anki CSV), Islamic knowledge, reading, notes + backlinks, global search with Arabic normalization.

**Phase 5 — Work**
Hospital shift templates + overrides, case log, freelance pipeline, clients, time tracking, invoices, Idea Lab + Graveyard, full calendar views (day/week/month) + ICS export.

**Phase 6 — Family & Finance**
People, family events (Hijri-aware), contact log, protected family blocks; accounts, transactions, recurring, budgets, savings goals, zakat helper, reports.

**Phase 7 — Wellbeing & rhythm**
Burnout Guard, adaptive capacity suggestions, weekly capacity check, full weekly/monthly/quarterly reviews, Telegram notifications + morning brief, Web Push, notification preferences.

**Phase 8 — Polish**
Seasonal profiles (Ramadan/Eid), statistics (calm), ICS import, Markdown notes export, PIN lock, accessibility audit, performance pass.

**Phase 9 — AI layer (optional)**
Only after everything above is stable and the owner asks for it (§6.22).

---

## 12. MVP Acceptance (end of Phase 2)

The owner can: open on phone and desktop · install the PWA · log in securely · see today's prayers, day type, commitments, and capacity · capture anything in < 5 s, even offline · process the inbox into tasks/projects/notes · define goals and manage projects with WIP limits · plan a realistic day with ≤ 3 big rocks · use Minimum mode · track routines · do daily and weekly reviews · use Arabic and English · see changes from the phone on the desktop within a minute · export all data.

---

## 13. Definition of Done (every feature)

- Zod schema + DB migration + Dexie version updated together
- RLS correct (and tested for new tables)
- Business logic in `src/core` with unit tests
- Responsive on mobile and desktop, RTL and LTR checked
- Loading, empty, and error states
- Works offline (if it is a core capture/Today feature) — tested
- Accessible (keyboard, labels, contrast)
- No secrets exposed, no new tracking
- Strings in `ar.json` and `en.json`
- Module `README.md` / ADR updated if behaviour or architecture changed

---

## 14. Testing Strategy

- **Unit (Vitest):** planner/capacity, commitment-level cutting, Burnout Guard signals, review schedulers, recurrence, prayer blocks + day types, Hijri helpers, money/zakat math, Arabic normalization, capture parsing, sync merge logic (with `fake-indexeddb`).
- **Component (Testing Library):** Today, capture, forms.
- **RLS:** a second test user must not read/write the owner's rows, for every table.
- **E2E (Playwright, mobile + desktop viewports, ar + en):** login, capture offline → sync, create goal/project/task, complete task, daily plan, Minimum mode, routine log, study session, Qur'an review, expense, weekly review, export.
- CI blocks merge on lint, typecheck, unit tests, build.

---

## 15. Rules for Claude

**Process**
- Before a large task: present a short plan (files, schema changes, tests) and wait for approval.
- Work in the phase order of §11. Do not jump ahead or build AI early.
- Keep PRs/commits small and focused, with conventional commit messages.
- Record significant decisions as ADRs in `docs/decisions/`.
- Do not rewrite the architecture without explaining why and getting approval.

**Correctness**
- Verify current documentation before relying on any library or provider API. Never invent an API or a library capability.
- Prefer free/open-source tools. Justify every new dependency and mention a simpler alternative if one exists.
- Never edit an applied migration — create a new one. Keep migrations reversible where practical.
- Never delete real user data outside the explicit delete flow.

**Code style**
- TypeScript strict; no `any` (if unavoidable, justify in a comment).
- No magic numbers — constants in config files.
- Components small (< 150 lines); composition over giant components; no premature abstractions.
- Business logic outside UI; data access only through `repo.ts`.
- Logical CSS properties only (RTL).
- Comments explain *why*, not *what* — but because the owner is learning, add a brief explanation for any non-obvious pattern (sync, IndexedDB versions, RLS, service workers).
- Preserve existing functionality when refactoring; run tests before and after.

**Domain sensitivity**
- Religious content: never present notes as rulings; keep Qur'an text unmodified with attribution.
- Medical: no identifiable patient data, ever.
- Finance: integers for money; zakat parameters are user inputs.
- Wellbeing: neutral language, suggestions only.

**Commands**
```bash
pnpm dev            # local dev server
pnpm build          # production build
pnpm preview        # preview build (test PWA/offline here)
pnpm test           # unit + component tests
pnpm test:e2e       # Playwright
pnpm lint
pnpm typecheck
pnpm db:migrate     # supabase db push
pnpm db:types       # generate Supabase TS types
```

---

## 16. First Claude Task

Before writing application code:
1. Read this file and list any contradictions or missing decisions.
2. Ask **only** the questions that materially change architecture (max 5).
3. Produce `docs/erd.md` (schema + relationships), the route map, and ADR-001 (stack).
4. Then implement **Phase 0**, step by step, explaining each step briefly for a learning developer.
5. Do not start with random UI mockups.

---

## 17. Technical References
- ts-fsrs — https://github.com/open-spaced-repetition/ts-fsrs
- adhan-js — https://github.com/batoulapps/adhan-js
- Tanzil (Qur'an text & metadata, check license) — https://tanzil.net/download
- Dexie.js — https://dexie.org
- Supabase docs — https://supabase.com/docs
- vite-plugin-pwa — https://vite-pwa-org.netlify.app
- TanStack Router — https://tanstack.com/router
- shadcn/ui — https://ui.shadcn.com
- MiniSearch — https://github.com/lucaong/minisearch
- i18next — https://www.i18next.com

Learning resources from the owner go in `docs/resources.md`, grouped by domain, and are imported through the Resource Ingestion screen (§6.11).
