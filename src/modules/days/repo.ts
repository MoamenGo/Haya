import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { DayOverrideRow } from '@/core/db/types'
import { dayTypeForDate } from '@/core/time/dayType'
import type { DayType } from '@/core/time/config'
import { dayOverrideInput, type DayOverrideInput } from './schema'

/** The only code that reads or writes `day_overrides`. */

export interface DayInfo {
  date: string
  dayType: DayType
  /** Set only when the owner changed this date. */
  override: DayOverrideRow | null
}

export async function getOverride(dateISO: string): Promise<DayOverrideRow | null> {
  const row = await db.day_overrides.where('date').equals(dateISO).first()
  return row && !row.deleted_at ? row : null
}

/** Day type for each date, with overrides applied. */
export async function daysInfo(dates: string[]): Promise<DayInfo[]> {
  const rows = await db.day_overrides.where('date').anyOf(dates).toArray()
  const byDate = new Map(rows.filter((r) => !r.deleted_at).map((r) => [r.date, r]))
  return dates.map((date) => {
    const override = byDate.get(date) ?? null
    return { date, dayType: dayTypeForDate(date, override), override }
  })
}

export async function dayInfo(dateISO: string): Promise<DayInfo> {
  const [info] = await daysInfo([dateISO])
  if (!info) throw new Error('unreachable: one date in, one day out')
  return info
}

export async function setOverride(input: DayOverrideInput): Promise<void> {
  const valid = dayOverrideInput.parse(input)
  await db.transaction('rw', db.day_overrides, async () => {
    const existing = await db.day_overrides.where('date').equals(valid.date).first()
    if (existing) {
      await db.day_overrides.update(existing.id, { ...valid, deleted_at: null, ...touchMeta() })
    } else {
      await db.day_overrides.add({ ...newRowMeta(), ...valid })
    }
  })
}

/** Back to the weekly pattern. A soft delete, so the change can sync later. */
export async function clearOverride(dateISO: string): Promise<void> {
  const existing = await db.day_overrides.where('date').equals(dateISO).first()
  if (!existing || existing.deleted_at) return
  const meta = touchMeta()
  await db.day_overrides.update(existing.id, { deleted_at: meta.updated_at, ...meta })
}
