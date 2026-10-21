# ADR-009: A German plan from Piece of German, and every plan restarts on 2026-10-24

**Status:** accepted · 2026-10-21 · at the owner's request

## Context

The owner asked to add German as a day-by-day plan following
[Piece of German](https://www.pieceofgerman.com/) (Ahmed Essam's free path for Arabic speakers),
and to restart all plans from the next Saturday. He chose:

- **Pause Dutch** so German fits the limit of 3 active plans (§6.10);
- **pace by day type**: 4 site days a week, a short review on other work days;
- **a clean restart**: clear every tick and every edit of the built-in plans.

## Decision

- **German plan** (`german_a1_c1`, `src/core/learning/curricula/german*.ts`). Only the site's
  structure is stored: levels, units and how many study days each has, read on 2026-10-21
  (A1 13 units, 83 sessions with the extra pronunciation day and the exam week; A2 79 with the
  review; B1, B2, C1 21 each, the site's published part). 225 sessions, 57 plan weeks.
  - A step says which site day to do («اليوم 3 في الأسبوع 2 من مستوى A1») and links to that
    unit's page. The day's tasks, videos and PDFs stay on the site: they load in its page and
    belong to their author.
  - Each plan week takes the next 4 sessions and places them on deep-work days first, then
    Friday, then custom, then hospital days (usual week: Mon, Tue, Thu, Fri, 90 min each).
    Other work days get a 15-min review of the latest site day. Changing a day's type moves the
    sessions inside the week only.
  - Session keys are per unit and day (`a1-w3-d4`), so adding the site's next B1/B2/C1 units at
    the end of their level never moves a tick.
- **Restart** (Dexie v12, `src/core/db/planRestart.ts`): German is added active, Dutch paused,
  every plan starts on 2026-10-24, and ticks plus edits of built-in plans are soft-deleted. The
  owner's own plans keep their steps. Every row it writes gets `updated_at = PLANS_RESET_AT`
  and it only touches older rows: a device that upgrades days later never undoes a tick or a
  change made after the restart on another device, because the newer row wins the sync.
- A new database seeds the same state (German before Dutch, so Dutch starts paused).
- Migration `20261021000000_german_plan.sql` allows the new key.

## Consequences

- A deep-work day now plans 315 of 252 minutes (English 75, Health Tech 150, German 90) and
  Friday 130 of 42. The capacity bar shows it; pausing a plan or moving a site day brings it back.
- When the site publishes more B1, B2 or C1 units, they are added to `germanData.ts`.
