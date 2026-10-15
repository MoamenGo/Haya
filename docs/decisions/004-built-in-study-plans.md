# ADR-004: Built-in study plans (English and Health Tech)

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
