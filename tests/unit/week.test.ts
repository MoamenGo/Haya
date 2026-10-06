import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/core/db/db'
import type { DailyLogRow, HabitLogRow, TaskRow } from '@/core/db/types'
import { BACKUP_TABLES } from '@/core/export/backup'
import { dayCapacity } from '@/core/planner/capacity'
import { dayLoad, weekSummary } from '@/core/planner/week'
import { weekDaysISO, weekStartISO, weekdayOfISO } from '@/core/time/date'
import { dayTypeForDate } from '@/core/time/dayType'
import { clearOverride, dayInfo, daysInfo, setOverride } from '@/modules/days/repo'
import { getReview, saveReview } from '@/modules/reviews/repo'
import { createTask, setTaskDone, tasksBetween, tasksCompletedBetween } from '@/modules/tasks/repo'

// 2026-10-06 is a Tuesday; its week starts on Saturday 2026-10-03.
const TUESDAY = '2026-10-06'
const SATURDAY = '2026-10-03'
const FRIDAY = '2026-10-09'

describe('week dates', () => {
  it('finds weekdays and the Saturday week start', () => {
    expect(weekdayOfISO(TUESDAY)).toBe(2)
    expect(weekStartISO(TUESDAY)).toBe(SATURDAY)
    expect(weekStartISO(SATURDAY)).toBe(SATURDAY)
    expect(weekStartISO(FRIDAY)).toBe(SATURDAY)
    expect(weekDaysISO(SATURDAY)).toEqual([
      SATURDAY,
      '2026-10-04',
      '2026-10-05',
      TUESDAY,
      '2026-10-07',
      '2026-10-08',
      FRIDAY,
    ])
  })

  it('uses the weekly pattern unless a date is overridden', () => {
    expect(dayTypeForDate(SATURDAY)).toBe('hospital')
    expect(dayTypeForDate(TUESDAY)).toBe('deep_work')
    expect(dayTypeForDate(FRIDAY)).toBe('rest')
    expect(dayTypeForDate(TUESDAY, { day_type: 'custom' })).toBe('custom')
  })
})

describe('capacity with overrides', () => {
  it("prefers the owner's own minutes for a date", () => {
    expect(dayCapacity('custom', 0, { customMinutes: 200 })).toMatchObject({
      discretionary: 200,
      plannable: 140,
    })
  })
})

const task = (over: Partial<TaskRow>): TaskRow =>
  ({ status: 'scheduled', est_minutes: null, is_big_rock: false, ...over }) as TaskRow

describe('dayLoad and weekSummary', () => {
  it('counts only open estimates as planned', () => {
    const load = dayLoad(
      [
        task({ est_minutes: 30, is_big_rock: true }),
        task({ est_minutes: 60, status: 'done' }),
        task({ est_minutes: 15 }),
      ],
      'hospital',
    )
    expect(load).toMatchObject({ total: 3, done: 1, bigRocks: 1 })
    expect(load.capacity.planned).toBe(45)
  })

  it('states neutral facts and has no average without energies', () => {
    const logs = [{ energy: 3 }, { energy: 4 }, { energy: null }] as DailyLogRow[]
    const habits = [
      { date: SATURDAY, status: 'full' },
      { date: SATURDAY, status: 'minimum' },
      { date: TUESDAY, status: 'skipped' },
    ] as HabitLogRow[]
    expect(weekSummary([task({ status: 'done' })], logs, habits)).toEqual({
      tasksDone: 1,
      checkIns: 3,
      averageEnergy: 3.5,
      habitDays: 1,
    })
    expect(weekSummary([], [], []).averageEnergy).toBeNull()
  })
})

describe('day overrides and weekly reviews (repo)', () => {
  beforeEach(async () => {
    await db.open()
  })
  afterEach(async () => {
    await db.delete()
  })

  it('overrides one date and can go back to the pattern', async () => {
    await setOverride({ date: TUESDAY, day_type: 'custom', capacity_min: 90, note: ' امتحان ' })
    const info = await dayInfo(TUESDAY)
    expect(info.dayType).toBe('custom')
    expect(info.override).toMatchObject({ capacity_min: 90, note: 'امتحان' })

    await setOverride({ date: TUESDAY, day_type: 'rest', capacity_min: null, note: '' })
    expect(await db.day_overrides.count()).toBe(1)

    await clearOverride(TUESDAY)
    const days = await daysInfo(weekDaysISO(SATURDAY))
    expect(days.map((d) => d.dayType)).toEqual([
      'hospital',
      'hospital',
      'deep_work',
      'deep_work',
      'hospital',
      'deep_work',
      'rest',
    ])
    // Soft delete: the row stays so the change can sync.
    expect((await db.day_overrides.toArray())[0]?.deleted_at).not.toBeNull()
  })

  it('keeps one weekly review per week and updates it', async () => {
    const base = { kind: 'weekly' as const, period_start: SATURDAY, period_end: FRIDAY }
    await saveReview({ ...base, answers: { went_well: 'الحمد لله' } })
    await saveReview({ ...base, answers: { went_well: 'الحمد لله', next_1: 'أخلص الجزء 4' } })
    expect(await db.reviews.count()).toBe(1)
    expect((await getReview('weekly', SATURDAY))?.answers.next_1).toBe('أخلص الجزء 4')
  })

  it('finds tasks by scheduled week and by completion day', async () => {
    const inWeek = await createTask({ title: 'أ', scheduled_date: TUESDAY })
    await createTask({ title: 'ب', scheduled_date: '2026-10-10' })
    expect((await tasksBetween(SATURDAY, FRIDAY)).map((t) => t.title)).toEqual(['أ'])
    await setTaskDone(inWeek, true)
    // 23:30 UTC on Friday is already Saturday in Cairo, so it belongs to next week.
    await db.tasks.update(inWeek.id, { completed_at: '2026-10-09T23:30:00.000Z' })
    expect(await tasksCompletedBetween(SATURDAY, FRIDAY)).toHaveLength(0)
    await db.tasks.update(inWeek.id, { completed_at: '2026-10-09T10:00:00.000Z' })
    expect(await tasksCompletedBetween(SATURDAY, FRIDAY)).toHaveLength(1)
  })

  it('backs up every table in the database', () => {
    expect([...BACKUP_TABLES].sort()).toEqual(db.tables.map((t) => t.name).sort())
  })
})
