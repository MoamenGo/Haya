import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { DailyLogRow, ReviewKind, ReviewRow } from '@/core/db/types'
import { dailyLogInput, reviewInput, type DailyLogInput, type ReviewInput } from './schema'

/** The only code that reads or writes `daily_logs` and `reviews`. */

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

export async function dailyLogsBetween(startISO: string, endISO: string): Promise<DailyLogRow[]> {
  const rows = await db.daily_logs.where('date').between(startISO, endISO, true, true).toArray()
  return rows.filter((r) => !r.deleted_at)
}

export async function getReview(
  kind: ReviewKind,
  periodStartISO: string,
): Promise<ReviewRow | undefined> {
  const row = await db.reviews.where('[kind+period_start]').equals([kind, periodStartISO]).first()
  return row && !row.deleted_at ? row : undefined
}

/** One review per kind and period: saving again updates it. */
export async function saveReview(input: ReviewInput): Promise<void> {
  const valid = reviewInput.parse(input)
  await db.transaction('rw', db.reviews, async () => {
    const existing = await db.reviews
      .where('[kind+period_start]')
      .equals([valid.kind, valid.period_start])
      .first()
    if (existing) {
      await db.reviews.update(existing.id, { ...valid, deleted_at: null, ...touchMeta() })
    } else {
      await db.reviews.add({ ...newRowMeta(), ...valid })
    }
  })
}
