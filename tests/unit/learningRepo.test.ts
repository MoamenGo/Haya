import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/core/db/db'
import { seedLearningPaths } from '@/core/db/seed'
import { BUILT_IN_PLANS_START } from '@/core/learning/config'
import {
  TooManyActivePathsError,
  checkedKeys,
  listActivePaths,
  listPaths,
  setChecked,
  setPathStart,
  setPathStatus,
} from '@/modules/learning/repo'

beforeEach(async () => {
  await db.open()
})

afterEach(async () => {
  await db.delete()
})

describe('learning paths', () => {
  it('starts with both plans active from the same Saturday', async () => {
    const paths = await listActivePaths()
    expect(paths.map((p) => p.curriculum_key).sort()).toEqual(['english_a2_c1', 'health_tech'])
    expect(paths.every((p) => p.start_date === BUILT_IN_PLANS_START)).toBe(true)
  })

  it('does not seed twice', async () => {
    await seedLearningPaths(db.table('learning_paths'))
    expect(await db.learning_paths.count()).toBe(2)
  })

  it('pauses, resumes and moves the start date', async () => {
    const [first] = await listPaths()
    if (!first) throw new Error('seed missing')
    await setPathStatus(first.id, 'paused')
    expect(await listActivePaths()).toHaveLength(1)
    await setPathStatus(first.id, 'active')
    await setPathStart(first.id, '2026-11-07')
    expect((await db.learning_paths.get(first.id))?.start_date).toBe('2026-11-07')
    await expect(setPathStart(first.id, '7/11/2026')).rejects.toThrow()
  })

  it('refuses a fourth active plan', async () => {
    const [first] = await listPaths()
    if (!first) throw new Error('seed missing')
    await setPathStatus(first.id, 'paused')
    const extra = { ...first, user_id: null, deleted_at: null, _dirty: 1 as const }
    await db.learning_paths.bulkAdd([
      { ...extra, id: 'p3', curriculum_key: 'x3' as never, status: 'active' },
      { ...extra, id: 'p4', curriculum_key: 'x4' as never, status: 'active' },
    ])
    await expect(setPathStatus(first.id, 'active')).rejects.toBeInstanceOf(TooManyActivePathsError)
  })
})

describe('study checks', () => {
  it('ticks, unticks and ticks again with one row', async () => {
    const [path] = await listPaths()
    if (!path) throw new Error('seed missing')
    await setChecked(path.id, 'w1:grammar', true, '2026-10-19')
    expect(await checkedKeys(path.id)).toEqual(new Set(['w1:grammar']))
    await setChecked(path.id, 'w1:grammar', false, '2026-10-19')
    expect((await checkedKeys(path.id)).size).toBe(0)
    await setChecked(path.id, 'w1:grammar', true, '2026-10-20')
    expect(await checkedKeys(path.id)).toEqual(new Set(['w1:grammar']))
    expect(await db.study_checks.count()).toBe(1)
  })
})
