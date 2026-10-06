import { describe, expect, it } from 'vitest'
import { continuity, isDone } from '@/core/habits/continuity'
import { newRowMeta } from '@/core/db/rows'
import type { HabitLogRow, HabitStatus } from '@/core/db/types'

const log = (
  routine_id: string,
  date: string,
  status: HabitStatus,
  deleted = false,
): HabitLogRow => ({
  ...newRowMeta(),
  routine_id,
  date,
  status,
  deleted_at: deleted ? '2026-10-06T00:00:00Z' : null,
})

describe('continuity', () => {
  it('fills missing days with null and ignores other routines and deleted logs', () => {
    const logs = [
      log('a', '2026-10-04', 'full'),
      log('a', '2026-10-06', 'minimum'),
      log('b', '2026-10-05', 'full'),
      log('a', '2026-10-05', 'full', true),
    ]
    expect(continuity(logs, 'a', '2026-10-06', 3).map((d) => d.status)).toEqual([
      'full',
      null,
      'minimum',
    ])
  })

  it('counts the minimum version as done', () => {
    expect(isDone('minimum')).toBe(true)
    expect(isDone('full')).toBe(true)
    expect(isDone('skipped')).toBe(false)
    expect(isDone(null)).toBe(false)
  })
})
