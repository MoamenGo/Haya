# ADR-004: Built-in study plans (English, Health Tech, Dutch)

**Status:** accepted · 2026-10-15 · ahead of Phase 4, at the owner's request

## Context

The owner follows two long plans made outside the app: English from A2 to C1 (78 weeks) and a
career shift from pharmacy to Health Tech + healthcare Data/AI (104 weeks). He wants to follow
them day by day inside Haya, on Today, without waiting for the full Learning OS (Phase 4).

## Decision

- Each plan is a **curriculum in code** (`src/core/learning/curricula/`): weeks, topics, projects,
  milestones and sources. The database only stores the owner's choices: one `learning_paths` row
  per plan (status, start date) and one `study_checks` row per ticked item (soft delete on untick).
- Each week is spread over the days by **day type**: light on hospital days, full on deep-work
  days, short on Friday. Minimum mode turns a day into one small item that still counts.
- Open study minutes count against the day's capacity (Today and the week view), so an
  overloaded day is visible, never blocked.
- Both plans start on Saturday 2026-10-17 and stay at full size by the owner's choice; together
  they use 225 of 252 plannable minutes on a deep-work day. Pausing a plan frees its time.
- The WIP limit of 3 active learning paths applies (§6.10).
- A new `/learn` screen shows each plan, its progress, pause/resume, start date and a week map.

## Consequences

- Editing a plan's text is safe; item **keys** must never change, or ticks would be lost.
- The full Learning OS (domains, resources, review cards) in Phase 4 can build on
  `learning_paths` instead of replacing it.

## Addendum · 2026-10-17: the Dutch plan

- A third built-in plan, **Dutch A1 → C1** (96 weeks, five stages), ported from the owner's
  "رحلة الهولندية" map in the خرائطي app: the weekly grammar topics, the rotating sources, the
  end-of-stage checks (weeks 16, 36, 56, 76, 96) and the Arabic grammar reviews.
- Same daily shape as English (30 min on hospital days, 75 on deep-work days, 10 on Friday), as
  the original map's routine asks.
- Dexie v11 + migration `20261017000000_dutch_plan.sql` add it to existing databases.
  `seedLearningPaths` now adds any missing built-in plan by key; a new plan starts **active only
  while the limit of 3 active plans has room**, otherwise paused.
- With all three active, a deep-work day plans 300 of 252 minutes: the capacity bar shows the
  overload (a warning, never a block). Pausing any plan brings the day back under.
- Progress already ticked in the خرائطي app is not carried over: that app keeps it on the phone
  only, out of Haya's reach.

## Addendum · 2026-10-17: the Health Tech plan covers the owner's CV

- The owner asked that, by its end, the Health Tech plan match his CV ("Abdelmoamen Gomaa —
  Resume") exactly, **without removing anything**, and to keep React Native.
- 21 weeks were added (`healthTechCvData.ts`), each placed right after an original week: i18n,
  RTL and PWA; Fastify + Drizzle + SQLite; Web Push and time zones; Redis + BullMQ with email and
  WhatsApp reminders; a monorepo with Docker Compose; an Arabic booking system; Dart and Flutter
  (4 weeks); advanced Next.js; barcode, OCR and Excel; C#, ASP.NET Core and EF Core (5 weeks,
  ending in the AI Drug Interaction Checker); Claude API and Ollama; image and video processing;
  and a two-week MrTool capstone. The plan grows from 104 to 125 weeks.
- The original 104 weeks are unchanged; their phases stretch over the added weeks. The first
  insertion comes after week 18, so ticks already made (week 1) keep their place. Ticks or
  edits on weeks after 18, if any, would now point at a different week.
