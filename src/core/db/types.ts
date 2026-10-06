import type { DayType } from '@/core/time/config'

/**
 * Columns every synced row carries (see docs/erd.md).
 * The sync engine arrives in Phase 2; the columns exist from day one so
 * no data has to be migrated when it does.
 */
export interface SyncedRow {
  /** UUID v7, created on the device so rows can be made offline. */
  id: string
  /** Owner's account id. Null until the first sign-in (Phase 2) fills it. */
  user_id: string | null
  /** ISO timestamps from the device clock. `updated_at` decides sync conflicts. */
  created_at: string
  updated_at: string
  /** Soft delete: rows are hidden, never removed, so deletes can sync too. */
  deleted_at: string | null
  /** Local only: 1 = changed since the last push to the cloud. */
  _dirty: 0 | 1
}

export interface SettingRow extends SyncedRow {
  key: string
  value: unknown
}

export interface LifeAreaRow extends SyncedRow {
  name_ar: string
  name_en: string
  icon: string
  color: string
  sort_order: number
  archived: boolean
}

/** Prayer-anchored parts of the day (CLAUDE.md §1.3). */
export const PRAYER_BLOCKS = [
  'after_fajr',
  'duha',
  'after_dhuhr',
  'after_asr',
  'maghrib_isha',
  'after_isha',
] as const
export type PrayerBlock = (typeof PRAYER_BLOCKS)[number]

/** L1 non-negotiable … L4 optional (CLAUDE.md §4.1). */
export type CommitmentLevel = 1 | 2 | 3 | 4

export interface RoutineRow extends SyncedRow {
  area_id: string | null
  title: string
  anchor: PrayerBlock
  /** Recurrence as an RRULE string. Every routine is daily for now. */
  rrule: string
  duration_min: number | null
  full_version: string
  minimum_version: string
  is_worship: boolean
  commitment_level: CommitmentLevel
  active: boolean
  sort_order: number
}

/** No "failed" status on purpose: a missing log is just a quiet day. */
export const HABIT_STATUSES = ['full', 'minimum', 'skipped'] as const
export type HabitStatus = (typeof HABIT_STATUSES)[number]

export interface HabitLogRow extends SyncedRow {
  routine_id: string
  /** Local calendar date in the owner's timezone, `YYYY-MM-DD`. */
  date: string
  status: HabitStatus
}

export interface DailyPlanRow extends SyncedRow {
  date: string
  day_type: string
  minimum_mode: boolean
}

export interface DailyLogRow extends SyncedRow {
  date: string
  energy: number | null
  sleep_hours: number | null
  gratitude: string
  tomorrow_top3: string[]
}

export interface InboxItemRow extends SyncedRow {
  text: string
  /** A guess from the capture parser (e.g. `link`); the owner decides later. */
  kind_hint: 'link' | null
  is_important: boolean
  tags: string[]
  processed_at: string | null
  converted_type: 'task' | null
  converted_id: string | null
}

export const TASK_STATUSES = [
  'inbox',
  'next',
  'scheduled',
  'in_progress',
  'waiting',
  'done',
  'cancelled',
] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]
export type TaskPriority = 'critical' | 'important' | 'normal' | 'low'
export type Energy = 'light' | 'medium' | 'heavy'

export interface TaskRow extends SyncedRow {
  area_id: string | null
  project_id: string | null
  goal_id: string | null
  title: string
  notes: string
  checklist: Array<{ text: string; done: boolean }>
  status: TaskStatus
  priority: TaskPriority
  commitment_level: CommitmentLevel
  energy: Energy
  est_minutes: number | null
  actual_minutes: number | null
  due_date: string | null
  scheduled_date: string | null
  prayer_block: PrayerBlock | null
  is_big_rock: boolean
  rrule: string | null
  completed_at: string | null
}

export const PROJECT_STATUSES = [
  'inbox',
  'planned',
  'active',
  'blocked',
  'waiting',
  'paused',
  'done',
  'archived',
] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]
export type ProjectKind = 'personal' | 'freelance' | 'venture' | 'learning' | 'hospital'

export interface ProjectRow extends SyncedRow {
  area_id: string | null
  goal_id: string | null
  kind: ProjectKind
  title: string
  outcome: string
  reason: string
  status: ProjectStatus
  priority: TaskPriority
  commitment_level: CommitmentLevel
  /** The one concrete next step. Every active project should have one. */
  next_action_task_id: string | null
  deadline: string | null
  est_hours: number | null
  energy: Energy
  review_date: string | null
  /** Freelance fields arrive in Phase 5. */
  client_id: string | null
}

export const GOAL_HORIZONS = ['month', 'quarter', 'year', 'long_term'] as const
export type GoalHorizon = (typeof GOAL_HORIZONS)[number]
/** `idea` is the "Not Now" state: kept, but not a commitment. */
export type GoalStatus =
  'idea' | 'planned' | 'active' | 'paused' | 'done' | 'cancelled' | 'archived'

export interface GoalRow extends SyncedRow {
  area_id: string | null
  title: string
  why: string
  desired_outcome: string
  horizon: GoalHorizon
  success_metric: string
  status: GoalStatus
  target_date: string | null
}

/** A per-date change to the weekly pattern: leave, exam, travel, illness (CLAUDE.md §4.2). */
export interface DayOverrideRow extends SyncedRow {
  /** `YYYY-MM-DD`, unique. */
  date: string
  day_type: DayType
  /** Free minutes for a `custom` day. Null = use the default for its type. */
  capacity_min: number | null
  note: string
}

export const REVIEW_KINDS = ['weekly', 'monthly', 'quarterly'] as const
export type ReviewKind = (typeof REVIEW_KINDS)[number]

export interface ReviewRow extends SyncedRow {
  kind: ReviewKind
  /** First and last day of the period, `YYYY-MM-DD`. */
  period_start: string
  period_end: string
  /** Free-text answers keyed by question id. */
  answers: Record<string, string>
}
