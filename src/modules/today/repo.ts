import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { DayType } from '@/core/time/config'

/** The only code that reads or writes `daily_plans`. */

export async function isMinimumMode(dateISO: string): Promise<boolean> {
  const plan = await db.daily_plans.where('date').equals(dateISO).first()
  return Boolean(plan && !plan.deleted_at && plan.minimum_mode)
}

/** "Hard day": logged per date, and it counts as a fully successful day. */
export async function setMinimumMode(
  dateISO: string,
  dayType: DayType,
  on: boolean,
): Promise<void> {
  await db.transaction('rw', db.daily_plans, async () => {
    const plan = await db.daily_plans.where('date').equals(dateISO).first()
    if (plan) {
      await db.daily_plans.update(plan.id, { minimum_mode: on, deleted_at: null, ...touchMeta() })
    } else {
      await db.daily_plans.add({
        ...newRowMeta(),
        date: dateISO,
        day_type: dayType,
        minimum_mode: on,
      })
    }
  })
}

/** Dates between two days (inclusive) that were lived in Minimum mode. */
export async function minimumModeDates(startISO: string, endISO: string): Promise<Set<string>> {
  const plans = await db.daily_plans.where('date').between(startISO, endISO, true, true).toArray()
  return new Set(plans.filter((p) => !p.deleted_at && p.minimum_mode).map((p) => p.date))
}
