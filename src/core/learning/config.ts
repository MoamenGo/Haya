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
 */

/** Work-in-progress limit for learning paths (CLAUDE.md §6.10). */
export const MAX_ACTIVE_PATHS = 3

/** Both built-in plans start on this Saturday (the date the owner's two plans used). */
export const BUILT_IN_PLANS_START = '2026-10-17'

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
