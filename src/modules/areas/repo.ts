import { db } from '@/core/db/db'
import type { LifeAreaRow } from '@/core/db/types'

/** Active (not archived, not deleted) life areas in display order. */
export async function listActiveAreas(): Promise<LifeAreaRow[]> {
  const rows = await db.life_areas.orderBy('sort_order').toArray()
  return rows.filter((area) => !area.archived && !area.deleted_at)
}
