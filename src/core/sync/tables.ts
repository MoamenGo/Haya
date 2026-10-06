/**
 * Which tables sync, in which order, and how to match rows that two devices
 * created separately for "the same thing" (CLAUDE.md §7.3).
 *
 * Order matters: a row is uploaded after the rows it points at (areas before
 * routines, routines before habit logs, …) so the cloud's foreign keys accept it.
 */
export const SYNC_TABLES = [
  'settings',
  'life_areas',
  'routines',
  'habit_logs',
  'daily_plans',
  'daily_logs',
  'goals',
  'projects',
  'tasks',
  'inbox_items',
  'day_overrides',
  'reviews',
] as const
export type SyncTable = (typeof SYNC_TABLES)[number]

/** Columns that are instants. Postgres returns them as `…+00:00`; the app uses `…Z`. */
const COMMON_INSTANTS = ['created_at', 'updated_at', 'deleted_at', 'server_updated_at'] as const
export const INSTANT_COLUMNS: Readonly<Record<SyncTable, readonly string[]>> = {
  settings: COMMON_INSTANTS,
  life_areas: COMMON_INSTANTS,
  routines: COMMON_INSTANTS,
  habit_logs: COMMON_INSTANTS,
  daily_plans: COMMON_INSTANTS,
  daily_logs: COMMON_INSTANTS,
  goals: COMMON_INSTANTS,
  projects: COMMON_INSTANTS,
  tasks: [...COMMON_INSTANTS, 'completed_at'],
  inbox_items: [...COMMON_INSTANTS, 'processed_at'],
  day_overrides: COMMON_INSTANTS,
  reviews: COMMON_INSTANTS,
}

/**
 * Natural keys: columns that identify "the same thing" across devices. Two
 * offline devices can each create a check-in for the same evening with
 * different ids; when they meet, the rows are merged instead of duplicated.
 * Areas and routines are matched by name so each device's starter rows merge.
 */
export const NATURAL_KEYS: Readonly<Partial<Record<SyncTable, readonly string[]>>> = {
  settings: ['key'],
  life_areas: ['name_en'],
  routines: ['title'],
  habit_logs: ['routine_id', 'date'],
  daily_plans: ['date'],
  daily_logs: ['date'],
  day_overrides: ['date'],
  reviews: ['kind', 'period_start'],
}

/** When a row is merged into another id, these columns elsewhere must follow it. */
export const REFERENCES: Readonly<Partial<Record<SyncTable, ReadonlyArray<[SyncTable, string]>>>> =
  {
    life_areas: [
      ['routines', 'area_id'],
      ['goals', 'area_id'],
      ['projects', 'area_id'],
      ['tasks', 'area_id'],
    ],
    routines: [['habit_logs', 'routine_id']],
    goals: [
      ['projects', 'goal_id'],
      ['tasks', 'goal_id'],
    ],
    projects: [['tasks', 'project_id']],
    tasks: [
      ['projects', 'next_action_task_id'],
      ['inbox_items', 'converted_id'],
    ],
  }

/** Local-only tables: device bookkeeping, never uploaded or backed up. */
export const LOCAL_ONLY_TABLES = ['sync_state', 'sync_conflicts'] as const
