import Dexie, { type EntityTable } from 'dexie'
import { seedLifeAreas } from './seed'
import type { LifeAreaRow, SettingRow } from './types'

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

  constructor(name: string = DB_NAME) {
    super(name)

    // Only indexed fields are listed. The first one is the primary key.
    // `&key` means unique. Other fields are stored but not indexed.
    this.version(1).stores({
      settings: 'id, &key, updated_at, _dirty',
      life_areas: 'id, sort_order, updated_at, _dirty',
    })

    // Runs once, when the database is created for the first time.
    this.on('populate', (tx) => seedLifeAreas(tx.table('life_areas')))
  }
}

export const db = new HayaDB()
