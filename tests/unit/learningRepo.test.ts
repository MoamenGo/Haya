import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/core/db/db'
import { seedLearningPaths } from '@/core/db/seed'
import { BUILT_IN_PLANS_START } from '@/core/learning/config'
import {
  TooManyActivePathsError,
  addStep,
  checkedKeys,
  copyWeekSteps,
  createPath,
  deletePath,
  editStep,
  hideStep,
  listActivePaths,
  listItemEdits,
  listPaths,
  resetStep,
  setChecked,
  setPathStart,
  setPathStatus,
  showStep,
  updatePath,
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

describe('editing plans', () => {
  const step = {
    text: 'شوف درس 3',
    minutes: 30,
    kind: 'study' as const,
    link_title: '',
    link_url: '',
  }

  it('creates a custom plan, active while there is room, paused after', async () => {
    const plan = await createPath({ title: 'Python', total_weeks: 8, start_date: '2026-10-24' })
    expect(plan.curriculum_key.startsWith('custom:')).toBe(true)
    expect(plan.status).toBe('active')
    const extra = await createPath({ title: 'Math', total_weeks: 4, start_date: '2026-10-24' })
    expect(extra.status).toBe('paused')
  })

  it('rejects an empty title or a bad link', async () => {
    await expect(
      createPath({ title: ' ', total_weeks: 8, start_date: '2026-10-24' }),
    ).rejects.toThrow()
    const plan = await createPath({ title: 'Python', total_weeks: 8, start_date: '2026-10-24' })
    await expect(addStep(plan.id, 1, 0, { ...step, link_url: 'docs' })).rejects.toThrow()
  })

  it('adds, edits, copies and deletes his own steps', async () => {
    const plan = await createPath({ title: 'Python', total_weeks: 8, start_date: '2026-10-24' })
    await addStep(plan.id, 1, 2, { ...step, link_url: 'https://docs.python.org' })
    const [row] = await listItemEdits(plan.id)
    if (!row) throw new Error('step missing')
    expect(row).toMatchObject({
      week: 1,
      day: 2,
      link_url: 'https://docs.python.org',
      link_title: null,
    })

    const item = {
      key: row.item_key,
      text: row.text,
      minutes: row.minutes,
      kind: row.kind,
      link: null,
    }
    await editStep(plan.id, 1, item, { ...step, minutes: 45 })
    expect((await listItemEdits(plan.id))[0]?.minutes).toBe(45)

    expect(await copyWeekSteps(plan.id, 1, 2)).toBe(1)
    expect((await listItemEdits(plan.id)).map((r) => r.week).sort()).toEqual([1, 2])

    await resetStep(plan.id, row.item_key)
    expect(await listItemEdits(plan.id)).toHaveLength(1)
  })

  it('hides a built-in step and brings it back as written', async () => {
    const [english] = await listPaths()
    if (!english) throw new Error('seed missing')
    const original = {
      key: 'w1:d0:anki',
      text: 'Anki',
      minutes: 10,
      kind: 'review' as const,
      link: null,
    }
    await hideStep(english.id, 1, original)
    expect((await listItemEdits(english.id))[0]?.hidden).toBe(true)
    await showStep(english.id, original)
    expect(await listItemEdits(english.id)).toHaveLength(0)
    // Hiding again revives the same row (one row per step).
    await hideStep(english.id, 1, original)
    expect(await db.study_items.count()).toBe(1)
  })

  it('deletes only custom plans, with their steps and ticks', async () => {
    const [english] = await listPaths()
    if (!english) throw new Error('seed missing')
    await expect(deletePath(english)).rejects.toThrow()

    const plan = await createPath({ title: 'Python', total_weeks: 8, start_date: '2026-10-24' })
    await addStep(plan.id, 1, 0, step)
    await setChecked(plan.id, 'x:any', true, '2026-10-24')
    await deletePath(plan)
    expect((await listPaths()).map((p) => p.id)).not.toContain(plan.id)
    expect(await listItemEdits(plan.id)).toHaveLength(0)
    expect(await checkedKeys(plan.id)).toEqual(new Set())
  })

  it('renames a plan and changes a custom plan’s length', async () => {
    const plan = await createPath({ title: 'Python', total_weeks: 8, start_date: '2026-10-24' })
    await updatePath(plan, { title: 'Python 2', total_weeks: 10, start_date: '2026-10-31' })
    expect(await db.learning_paths.get(plan.id)).toMatchObject({
      title: 'Python 2',
      total_weeks: 10,
    })
  })
})
