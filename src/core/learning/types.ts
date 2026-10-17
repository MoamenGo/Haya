import type { DayType } from '@/core/time/config'

/** A source to open. `url` is null for things like "an episode of a series". */
export interface Link {
  title: string
  url: string | null
}

/** Built-in study plans. Each one is a learning path the owner can pause or resume. */
export const CURRICULUM_KEYS = ['english_a2_c1', 'health_tech', 'dutch_a1_c1'] as const
export type CurriculumKey = (typeof CURRICULUM_KEYS)[number]

/** Plans the owner writes himself are keyed `custom:<uuid>`. */
export const CUSTOM_PLAN_PREFIX = 'custom:'
export type CustomPlanKey = `${typeof CUSTOM_PLAN_PREFIX}${string}`
export type PlanKey = CurriculumKey | CustomPlanKey

export function isBuiltInPlan(key: PlanKey): key is CurriculumKey {
  return (CURRICULUM_KEYS as readonly string[]).includes(key)
}

export const STUDY_ITEM_KINDS = ['study', 'practice', 'project', 'review', 'check'] as const
export type StudyItemKind = (typeof STUDY_ITEM_KINDS)[number]

/** One thing to do in a study session, with a rough time estimate. */
export interface StudyItem {
  /**
   * Stable id inside the plan, e.g. `w12:b1:topic0`. Ticks are saved by this
   * key, so it must not change when the text of the plan is edited.
   */
  key: string
  text: string
  minutes: number
  kind: StudyItemKind
  link: Link | null
}

/** What a week is about, for the plan map. */
export interface WeekOverview {
  week: number
  /** Stage or phase name, e.g. "A2 → B1" or "B1 · الواجهات Frontend". */
  phase: string
  title: string
  topics: readonly string[]
  project: string | null
  milestone: string | null
  resources: readonly Link[]
}

export interface Curriculum {
  key: PlanKey
  totalWeeks: number
  overview(week: number): WeekOverview
  /**
   * The week's sessions, one list per day (Saturday first), shaped by each
   * day's type: light on hospital days, deep on deep-work days, short on rest days.
   */
  planWeek(week: number, dayTypes: readonly DayType[]): StudyItem[][]
  /**
   * The hard-day version for a day (CLAUDE.md §4.5): small, and it counts.
   * `null` when the day has nothing to shrink (an empty day of a custom plan).
   */
  minimum(week: number, dayIndex: number): StudyItem | null
}
