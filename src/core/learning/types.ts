import type { DayType } from '@/core/time/config'

/** A source to open. `url` is null for things like "an episode of a series". */
export interface Link {
  title: string
  url: string | null
}

/** Built-in study plans. Each one is a learning path the owner can pause or resume. */
export const CURRICULUM_KEYS = ['english_a2_c1', 'health_tech'] as const
export type CurriculumKey = (typeof CURRICULUM_KEYS)[number]

export type StudyItemKind = 'study' | 'practice' | 'project' | 'review' | 'check'

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
  key: CurriculumKey
  totalWeeks: number
  overview(week: number): WeekOverview
  /**
   * The week's sessions, one list per day (Saturday first), shaped by each
   * day's type: light on hospital days, deep on deep-work days, short on rest days.
   */
  planWeek(week: number, dayTypes: readonly DayType[]): StudyItem[][]
  /** The hard-day version for a day (CLAUDE.md §4.5): small, and it counts. */
  minimum(week: number, dayIndex: number): StudyItem
}
