import Dexie, { type EntityTable } from 'dexie'
import { seedLifeAreas, seedRoutines } from './seed'
import type {
  DailyLogRow,
  DailyPlanRow,
  HabitLogRow,
  LifeAreaRow,
  RoutineRow,
  SettingRow,
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

    // …and brand-new databases get everything here (upgrades don't run for them).
    this.on('populate', async (tx) => {
      await seedLifeAreas(tx.table('life_areas'))
      await seedRoutines(tx.table('life_areas'), tx.table('routines'))
    })
  }
}

export const db = new HayaDB()
