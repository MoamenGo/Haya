/**
 * Study-time constants. Heuristics, not laws: tune them here.
 *
 * Both plans together are sized to fit the day types' plannable time
 * (CLAUDE.md §4.3, 70% of free minutes):
 *   hospital  30 + 45  = 75  of 84
 *   deep_work 75 + 150 = 225 of 252
 *   rest      10 + 30  = 40  of 42
 * That leaves little room for other planned work, on purpose visible on the
 * capacity bar. Pausing one plan frees its time.
 *
 * Dutch (added later) uses the same shape as English: 30 on hospital days, 75
 * on deep-work days, 10 on Friday. With all three active, days go over their
 * plannable time and the capacity bar says so (a warning, never a block).
 */

/** Work-in-progress limit for learning paths (CLAUDE.md §6.10). */
export const MAX_ACTIVE_PATHS = 3

/**
 * Built-in plans start on this Saturday. The owner restarted every plan from
 * here on 2026-10-21 (ADR-009); before that they started on 2026-10-17.
 */
export const BUILT_IN_PLANS_START = '2026-10-24'

/**
 * The one-time restart of 2026-10-21 (ADR-009, Dexie v12): every plan moves to
 * BUILT_IN_PLANS_START, and ticks and edits of built-in plans are cleared.
 * Rows it changes get this fixed time as `updated_at`, and it only touches rows
 * older than it. So a device that upgrades days later never undoes something
 * the owner did on another device after the restart: newer changes win the sync.
 */
export const PLANS_RESET_AT = '2026-10-21T04:45:00.000Z'

export const ENGLISH_WEEKS = 78
export const ENGLISH_STAGE_WEEKS = 26

/** Minutes per English activity. */
export const ENGLISH_MIN = {
  anki: 10,
  listening: 20,
  reading: 20,
  grammarLesson: 25,
  output: 20,
  longOutput: 25,
  levelCheck: 45,
} as const

export const DUTCH_WEEKS = 96

/** Dutch starts with the others (it was added on 2026-10-17). */
export const DUTCH_PLAN_START = BUILT_IN_PLANS_START

/** Minutes per Dutch activity. */
export const DUTCH_MIN = {
  anki: 10,
  listening: 20,
  reading: 20,
  grammarLesson: 25,
  arabicReview: 20,
  output: 20,
  longOutput: 25,
  exam: 45,
} as const

/**
 * German follows Piece of German day by day (ADR-009). The site asks 1–3 hours
 * per site day; four site days a week land on deep-work days and Friday, and
 * hospital days get a short review. About 57 weeks for what the site has now.
 */
export const GERMAN_SESSIONS_PER_WEEK = 4

/** Minutes per German activity. */
export const GERMAN_MIN = {
  /** One site day, at the middle of the site's 1–3 hours. */
  session: 90,
  review: 15,
  minimum: 15,
} as const

/** Minutes per Health Tech activity. */
export const HEALTH_TECH_MIN = {
  topic: 50,
  practice: 50,
  projectStart: 100,
  projectPlan: 50,
  projectPush: 20,
  weeklyNote: 10,
  deepDive: 60,
  lightLong: 35,
  lightShort: 10,
  lightReview: 25,
  lightIntro: 20,
  minimum: 10,
} as const

/** Limits for plans the owner writes himself. */
export const CUSTOM_PLAN = {
  defaultWeeks: 12,
  maxWeeks: 156,
  /** A new step's default length, in minutes. */
  defaultMinutes: 25,
  maxMinutes: 240,
} as const
