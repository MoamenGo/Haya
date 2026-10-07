# Route map

Only routes for built phases appear in navigation. Later modules are added when their phase ships,
so the bottom bar never shows empty sections.

| Route                            | Screen                                                                                                                                                                | Phase           |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `/`                              | redirect to `/today`                                                                                                                                                  | 0               |
| `/today`                         | Today: dates (Gregorian + Hijri), day type, next prayer, capacity bar, Big Rocks (≤3), prayer-block timeline, routine dots, parking lot, Minimum mode, Evening review | 0 shell, 1 full |
| `/today/review`                  | Daily (evening) review                                                                                                                                                | 1               |
| `/inbox`                         | Inbox processing                                                                                                                                                      | 1               |
| `/tasks`                         | Tasks list (filters: next / scheduled / waiting / done)                                                                                                               | 1               |
| `/tasks/$taskId`                 | Task detail / edit                                                                                                                                                    | 1               |
| `/projects`                      | Projects grouped by status, WIP indicator, small steps per project, starter goals                                                                                     | 1               |
| `/projects/$projectId`           | Project detail, next action                                                                                                                                           | 1               |
| `/goals`                         | Goals by horizon (`idea` = Not Now)                                                                                                                                   | 1               |
| `/goals/$goalId`                 | Goal detail                                                                                                                                                           | 1               |
| `/habits`                        | Habits: add (with a hard-day version), pause, remove, suggested presets                                                                                               | 1               |
| `/week`                          | Week view (Sat to Fri)                                                                                                                                                | 1               |
| `/reviews/weekly`                | Simple weekly review                                                                                                                                                  | 1               |
| `/more`                          | Phone only: sections that don't fit the bottom bar                                                                                                                    | 1               |
| `/settings`                      | Language, theme, location + prayer method, day types, limits, life areas                                                                                              | 0 basic, 1 full |
| `/settings/data`                 | JSON export / import (dry-run preview)                                                                                                                                | 1               |
| `/login`                         | Magic-link sign-in                                                                                                                                                    | 2               |
| `/quran`                         | Qur'an tracking, sessions, heatmap                                                                                                                                    | 3               |
| `/learn/*`                       | Learning OS, resources, reading, notes, search                                                                                                                        | 4               |
| `/work/*`, `/ideas`, `/calendar` | Hospital, freelance, Idea Lab, calendar                                                                                                                               | 5               |
| `/family/*`, `/finance/*`        | Family, finance, zakat                                                                                                                                                | 6               |

Global (every screen): Capture (`+` on mobile, `Ctrl/Cmd+K` on desktop), sync indicator (Phase 2).

Navigation after Phase 1:

- Mobile bottom bar: **Today · Week · Inbox · Tasks · More** + floating Capture. Routines live on Today. It becomes
  Today · Qur'an · Learn · Work · More as those modules ship (spec §9).
- Desktop sidebar: Today, Week, Inbox, Tasks, Projects, Goals, Weekly review, Settings.
