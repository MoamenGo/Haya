# ADR-007: A month calendar and moving between days on Today

**Status:** accepted · 2026-10-20 · at the owner's request

## Context

The owner asked for a calendar where tapping a day shows that day's tasks, and for arrows on
the Today screen to go back to the previous day or ahead to the next one. CLAUDE.md §6.7 puts the
full calendar in Phase 5; this brings a first, internal month view forward because the owner
asked for it. Shifts, events, family events and ICS export stay in Phase 5.

## Decision

- **`/today?date=YYYY-MM-DD`** shows another day on the Today screen. No `date` means today, so
  old links and the Android reminder still open today. Arrows go one day back or forward, the date
  in the middle opens the calendar on that day, and a "back to today" pill appears on other days.
  - Today keeps everything (prayer sky, vision, habits, notes, check-in).
  - A past day shows its tasks, its study and its habits, so a forgotten tick can be added later.
  - A future day shows its tasks and study only; habits and the check-in can't be logged ahead.
- **`/calendar?date=YYYY-MM-DD`** is a month grid that starts on Saturday (`monthGridISO` in
  `src/core/time/calendar.ts`). Each cell shows the Gregorian day, the Hijri day, up to three dots
  (open tasks filled, done tasks hollow) and a soft tint on hospital days. Tapping a day shows its
  day type, its tasks (tickable), a quick "add a task for this day" field and that day's study.
  Choosing a day replaces the history entry; changing month adds one.
- **Navigation.** On the phone the calendar takes the Week slot in the bottom bar; Week moves to
  "More" and the calendar links to it. The desktop sidebar has both.
- **Checking `date`.** `dateSearch()` accepts only a real calendar date (2026-02-30 is rejected)
  and always returns the `date` key, as `undefined` when invalid. TanStack Router merges what
  `validateSearch` returns over the raw query, so leaving the key out would let a bad value
  through and crash the date formatting.

## Consequences

- The calendar reads only tasks and study plans for now; Phase 5 adds shifts, events and family
  events to the same grid instead of building a second one.
- Any screen can link to a given day with `/today?date=` or `/calendar?date=`.
