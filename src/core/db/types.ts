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
