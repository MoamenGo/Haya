# ADR-005: Editable and custom study plans

**Status:** accepted · 2026-10-15 · at the owner's request

## Context

ADR-004 put the two built-in plans in code. The owner wants to change them from inside the app
(fix a step, drop one that doesn't suit him, add his own) and to write new plans himself, with
changes syncing between phone and desktop.

## Decision

- Built-in curricula **stay in code**: they are generated week by week (rotating sources, day-type
  shaping), which a static copy in the database would lose.
- The owner's changes are rows in a new synced table, `study_items`, layered on top by pure
  functions in `src/core/learning/edits.ts`:
  - a row with a built-in step's key **edits** it (text, minutes, kind, link) or **hides** it
    (`hidden = true`); deleting the row restores the original;
  - a row keyed `x:<uuid>` is a step **he added**, placed on a week and a day (0 = Saturday).
- A **custom plan** is a `learning_paths` row keyed `custom:<uuid>` with `total_weeks`; its base is an
  empty curriculum, so all its steps are his own. "Copy last week's steps" helps repeating plans.
- Keys never change, so ticks (`study_checks`) survive edits.
- A new plan starts active only while fewer than 3 are active; otherwise it starts paused (the WIP
  limit says "not now", it never refuses). Built-in plans can't be deleted, only paused or finished.

## Consequences

- An edit of a built-in step whose key includes the day (e.g. English `w3:d2:anki`) applies to that
  day only; Health Tech keys are per week, so an edit follows the step if its day moves.
- The full Learning OS (Phase 4) can keep using `learning_paths` + `study_items`.
