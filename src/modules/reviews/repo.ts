import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { DailyLogRow } from '@/core/db/types'
import { dailyLogInput, type DailyLogInput } from './schema'

/** The only code that reads or writes `daily_logs`. */

export async function getDailyLog(dateISO: string): Promise<DailyLogRow | undefined> {
  const row = await db.daily_logs.where('date').equals(dateISO).first()
  return row && !row.deleted_at ? row : undefined
}

export async function saveDailyLog(input: DailyLogInput): Promise<void> {
  const valid = dailyLogInput.parse(input)
  await db.transaction('rw', db.daily_logs, async () => {
    const existing = await db.daily_logs.where('date').equals(valid.date).first()
    if (existing) {
      await db.daily_logs.update(existing.id, { ...valid, deleted_at: null, ...touchMeta() })
    } else {
      await db.daily_logs.add({ ...newRowMeta(), ...valid })
    }
  })
}
