import Dexie, { type EntityTable } from 'dexie'
import { seedLearningPaths, seedLifeAreas, seedRoutines } from './seed'
import type {
  DailyLogRow,
  DailyPlanRow,
  DayOverrideRow,
  GoalRow,
  HabitLogRow,
  InboxItemRow,
  ProjectRow,
  ResourceRow,
  LearningPathRow,
  LifeAreaRow,
  NoteAudioRow,
  NoteRow,
  ReviewRow,
  SyncConflictRow,
  SyncStateRow,
  RoutineRow,
  SettingRow,
  StudyCheckRow,
  StudyItemRow,
  TaskRow,
} from './types'

export const DB_NAME = 'haya'

/**
 * The local database (IndexedDB through Dexie). It is the source of truth on
 * each device; the UI never talks to the cloud directly.
 *
 * How versions work: IndexedDB stores a schema version number. When the app
 * needs a new table or index, add a new `this.version(n + 1).stores({...})`
 * block below the old ones. Never edit an old block: devices that already
 * have version n upgrade by running only the new blocks.
 */
export class HayaDB extends Dexie {
  settings!: EntityTable<SettingRow, 'id'>
  life_areas!: EntityTable<LifeAreaRow, 'id'>
  routines!: EntityTable<RoutineRow, 'id'>
  habit_logs!: EntityTable<HabitLogRow, 'id'>
  daily_plans!: EntityTable<DailyPlanRow, 'id'>
  daily_logs!: EntityTable<DailyLogRow, 'id'>
  inbox_items!: EntityTable<InboxItemRow, 'id'>
  tasks!: EntityTable<TaskRow, 'id'>
  projects!: EntityTable<ProjectRow, 'id'>
  goals!: EntityTable<GoalRow, 'id'>
  day_overrides!: EntityTable<DayOverrideRow, 'id'>
  reviews!: EntityTable<ReviewRow, 'id'>
  resources!: EntityTable<ResourceRow, 'id'>
  learning_paths!: EntityTable<LearningPathRow, 'id'>
  study_checks!: EntityTable<StudyCheckRow, 'id'>
  study_items!: EntityTable<StudyItemRow, 'id'>
  notes!: EntityTable<NoteRow, 'id'>
  note_audio!: EntityTable<NoteAudioRow, 'note_id'>
  sync_state!: EntityTable<SyncStateRow, 'table'>
  sync_conflicts!: EntityTable<SyncConflictRow, 'id'>

  constructor(name: string = DB_NAME) {
    super(name)

    // Only indexed fields are listed. The first one is the primary key.
    // `&key` means unique. Other fields are stored but not indexed.
    this.version(1).stores({
      settings: 'id, &key, updated_at, _dirty',
      life_areas: 'id, sort_order, updated_at, _dirty',
    })

    // v2 (Phase 1): routines and the daily loop.
    // `&[routine_id+date]` is a unique compound index: one log per routine per day.
    this.version(2)
      .stores({
        routines: 'id, sort_order, updated_at, _dirty',
        habit_logs: 'id, &[routine_id+date], date, updated_at, _dirty',
        daily_plans: 'id, &date, updated_at, _dirty',
        daily_logs: 'id, &date, updated_at, _dirty',
      })
      // Devices that already had v1 get the starter routines here…
      .upgrade((tx) => seedRoutines(tx.table('life_areas'), tx.table('routines')))

    // v3 (Phase 1): capture inbox and tasks.
    this.version(3).stores({
      inbox_items: 'id, processed_at, created_at, updated_at, _dirty',
      tasks: 'id, status, scheduled_date, project_id, updated_at, _dirty',
    })

    // v4 (Phase 1): projects and goals.
    this.version(4).stores({
      projects: 'id, status, goal_id, updated_at, _dirty',
      goals: 'id, status, horizon, updated_at, _dirty',
    })

    // v5 (Phase 1): per-date day types and weekly reviews.
    // `&[kind+period_start]`: one review per kind per period.
    this.version(5).stores({
      day_overrides: 'id, &date, updated_at, _dirty',
      reviews: 'id, &[kind+period_start], updated_at, _dirty',
    })

    // v6 (Phase 2): local-only sync bookkeeping. These two tables never sync
    // and are not in backups (see LOCAL_ONLY_TABLES in src/core/sync/tables.ts).
    this.version(6).stores({
      sync_state: 'table',
      sync_conflicts: 'id, at',
    })

    // v7: links to sources, shown on each goal's map.
    this.version(7).stores({
      resources: 'id, goal_id, project_id, url_normalized, updated_at, _dirty',
    })

    // v8: study plans (English and Health Tech) followed day by day on Today.
    // `&[path_id+item_key]`: one tick per plan item.
    this.version(8)
      .stores({
        learning_paths: 'id, &curriculum_key, status, updated_at, _dirty',
        study_checks: 'id, &[path_id+item_key], path_id, date, updated_at, _dirty',
      })
      .upgrade((tx) => seedLearningPaths(tx.table('learning_paths')))

    // v9: daily notes, typed or spoken. `note_audio` is local only (recordings
    // stay on the device; see LOCAL_ONLY_TABLES in src/core/sync/tables.ts).
    this.version(9).stores({
      notes: 'id, date, updated_at, _dirty',
      note_audio: 'note_id',
    })

    // v10: the owner's own study plans and his edits to any plan's steps.
    // `&[path_id+item_key]`: one change per step (re-used after an undo).
    this.version(10)
      .stores({
        study_items: 'id, &[path_id+item_key], path_id, updated_at, _dirty',
      })
      .upgrade((tx) =>
        tx
          .table('learning_paths')
          .toCollection()
          .modify((row: { total_weeks?: number | null }) => {
            row.total_weeks ??= null
          }),
      )

    // v11: the Dutch plan joins the built-in plans. No index changes; the
    // upgrade only adds the missing plan row (see seedLearningPaths).
    this.version(11)
      .stores({})
      .upgrade((tx) => seedLearningPaths(tx.table('learning_paths')))

    // …and brand-new databases get everything here (upgrades don't run for them).
    this.on('populate', async (tx) => {
      await seedLifeAreas(tx.table('life_areas'))
      await seedRoutines(tx.table('life_areas'), tx.table('routines'))
      await seedLearningPaths(tx.table('learning_paths'))
    })
  }
}

export const db = new HayaDB()
