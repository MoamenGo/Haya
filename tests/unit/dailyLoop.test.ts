import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/core/db/db'
import { STARTER_ROUTINES } from '@/core/db/seed'
import { getDailyLog, saveDailyLog } from '@/modules/reviews/repo'
import { listActiveRoutines, logsBetween, setHabitStatus } from '@/modules/routines/repo'
import { isMinimumMode, setMinimumMode } from '@/modules/today/repo'

const DAY = '2026-10-06'

beforeEach(async () => {
  await db.open()
})

afterEach(async () => {
  await db.delete()
})

describe('routines', () => {
  it('seeds the three starter habits linked to their areas', async () => {
    const routines = await listActiveRoutines()
    expect(routines.map((r) => r.title)).toEqual(STARTER_ROUTINES.map((r) => r.title))
    expect(routines.every((r) => r.area_id !== null)).toBe(true)
  })

  it('keeps one log per routine per day, and clearing is a soft delete', async () => {
    const [quran] = await listActiveRoutines()
    await setHabitStatus(quran!.id, DAY, 'full')
    await setHabitStatus(quran!.id, DAY, 'minimum')
    expect((await logsBetween(DAY, DAY)).map((l) => l.status)).toEqual(['minimum'])

    await setHabitStatus(quran!.id, DAY, null)
    expect(await logsBetween(DAY, DAY)).toEqual([])
    expect(await db.habit_logs.count()).toBe(1) // tombstone kept for sync

    await setHabitStatus(quran!.id, DAY, 'full')
    expect((await logsBetween(DAY, DAY)).map((l) => l.status)).toEqual(['full'])
  })
})

describe('minimum mode', () => {
  it('is off by default and can be toggled per day', async () => {
    expect(await isMinimumMode(DAY)).toBe(false)
    await setMinimumMode(DAY, 'hospital', true)
    expect(await isMinimumMode(DAY)).toBe(true)
    expect(await isMinimumMode('2026-10-07')).toBe(false)
    await setMinimumMode(DAY, 'hospital', false)
    expect(await isMinimumMode(DAY)).toBe(false)
  })
})

describe('evening check-in', () => {
  it('saves and updates one log per day', async () => {
    const entry = { date: DAY, energy: 3, sleep_hours: 6.5, gratitude: 'الصحة', tomorrow_top3: [] }
    await saveDailyLog(entry)
    await saveDailyLog({ ...entry, energy: 4, tomorrow_top3: ['أخلص الدرس'] })
    const saved = await getDailyLog(DAY)
    expect(saved?.energy).toBe(4)
    expect(saved?.tomorrow_top3).toEqual(['أخلص الدرس'])
    expect(await db.daily_logs.count()).toBe(1)
  })

  it('rejects out-of-range energy', async () => {
    await expect(
      saveDailyLog({ date: DAY, energy: 9, sleep_hours: null, gratitude: '', tomorrow_top3: [] }),
    ).rejects.toThrow()
  })
})
