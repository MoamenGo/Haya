import Dexie from 'dexie'
import { describe, expect, it } from 'vitest'
import { HayaDB } from '@/core/db/db'
import { seedLifeAreas } from '@/core/db/seed'

describe('schema upgrade from v1', () => {
  it('adds the starter routines to a database created by Phase 0', async () => {
    const name = 'upgrade-test'
    // Recreate exactly what a Phase 0 device has: schema v1 with seeded areas.
    const v1 = new Dexie(name)
    v1.version(1).stores({
      settings: 'id, &key, updated_at, _dirty',
      life_areas: 'id, sort_order, updated_at, _dirty',
    })
    v1.on('populate', (tx) => seedLifeAreas(tx.table('life_areas')))
    await v1.open()
    v1.close()

    const upgraded = new HayaDB(name)
    await upgraded.open()
    expect(upgraded.verno).toBe(5)
    expect(await upgraded.life_areas.count()).toBe(11)
    expect(await upgraded.routines.count()).toBe(3)
    await upgraded.delete()
  })
})
