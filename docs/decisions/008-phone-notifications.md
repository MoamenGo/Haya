# ADR-008: Phone notifications planned in Khatwa, shown by the Android app

**Status:** accepted · 2026-10-21 · at the owner's request

## Context

The owner uses Khatwa on his phone through the small Android app that opens this site in a
WebView. He asked for notifications in that app and chose four kinds: a morning brief, an evening
review reminder, prayer times, and deadlines. CLAUDE.md §6.21 plans notifications for Phase 7
through a Telegram bot and Web Push, both of which need a server, and Web Push does not work inside
an Android WebView at all.

He also found that changes to the site (the calendar, ADR-007) did not reach the phone: the app
stays alive in the background, and a page only looks for a new service worker when it loads.

## Decision

- **Khatwa decides, the phone shows.** `planNotifications()` in `src/core/notify/plan.ts` (pure,
  unit-tested) turns the next 3 days into a list of `{ id, at, category, title, body, path }`.
  `NativeNotifications` (in the app shell) rebuilds it whenever tasks, study, settings, language
  or the date change, and passes it as JSON to `AndroidBridge.scheduleNotifications`. The app
  (version 2.2) replaces its previous alarms with the new list, so there is one source of truth.
  Everything runs on the phone: no server, no network, and nothing leaves the device.
- **Times follow prayers** (§1.3): morning brief 20 min after Fajr (skipped on an empty day),
  deadlines 5 min later, evening review 30 min after Maghrib, and each prayer at its time.
  Constants live in `src/core/notify/config.ts`.
- **Quiet hours** (§6.21): from an hour after Isha until Fajr nothing arrives except prayer times.
  Without prayer times the owner gets at most three a day. No streaks, no guilt wording.
- **Settings › Notifications** has one switch per kind, stored as the synced `notifications`
  setting, so the choice made on any device applies to the phone. All four are on by default
  because the owner asked for all four.
- **Updates reach the phone.** The page checks for a new version whenever it becomes visible
  and once an hour. The app now forwards `onResume`/`onPause` to the WebView and asks for the
  check on resume as well.

## Consequences

- In a normal browser nothing is sent; the settings screen says notifications come from the
  Android app. Older app versions ignore the list until updated to 2.2.
- If the app is not opened for 3 days, the list runs out until it is opened again. Prayer times
  are the only kind that would make sense further ahead; the horizon can grow if that matters.
- Telegram and Web Push (Phase 7) can reuse `planNotifications()` later instead of a second planner.
