import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/core/db/db'
import { restartPlans } from '@/core/db/planRestart'
import type { LearningPathRow, StudyCheckRow, StudyItemRow } from '@/core/db/types'
import { german, GERMAN_SESSION_COUNT } from '@/core/learning/curricula/german'
import { GERMAN_UNITS } from '@/core/learning/curricula/germanData'
import { BUILT_IN_PLANS_START, GERMAN_MIN, PLANS_RESET_AT } from '@/core/learning/config'
import { planWeekDates } from '@/core/learning/week'
import type { DayType } from '@/core/time/config'
import { dayTypeForDate } from '@/core/time/dayType'
import { addStep, editStep, listPaths, setChecked } from '@/modules/learning/repo'

const USUAL_WEEK: DayType[] = planWeekDates(BUILT_IN_PLANS_START, 1).map((d) => dayTypeForDate(d))
const sessionsIn = (week: number, types = USUAL_WEEK) =>
  german.planWeek(week, types).map((day) => day.filter((i) => i.minutes === GERMAN_MIN.session))

describe('German plan (Piece of German)', () => {
  it('holds every site day: A1 83 sessions, A2 79, B1/B2/C1 21 each', () => {
    const count = (level: string) =>
      GERMAN_UNITS.filter((u) => u.level === level).reduce((n, u) => n + u.sessions.length, 0)
    expect([count('A1'), count('A2'), count('B1'), count('B2'), count('C1')]).toEqual([
      83, 79, 21, 21, 21,
    ])
    expect(GERMAN_SESSION_COUNT).toBe(225)
    expect(german.totalWeeks).toBe(57)
  })

  it('puts the 4 site days on Monday, Tuesday, Thursday and Friday', () => {
    expect(USUAL_WEEK).toEqual([
      'hospital',
      'hospital',
      'deep_work',
      'deep_work',
      'hospital',
      'deep_work',
      'rest',
    ])
    const days = sessionsIn(1).map((d) => d.map((i) => i.key))
    expect(days).toEqual([[], [], ['a1-w1-d1'], ['a1-w1-d2'], [], ['a1-w1-d3'], ['a1-w1-d4']])
    // The extra pronunciation session comes right after day 4.
    expect(sessionsIn(2).flat()[0]?.key).toBe('a1-w1-extra')
  })

  it('gives hospital days a short review of the latest site day', () => {
    const week2 = german.planWeek(2, USUAL_WEEK)
    expect(week2[0]?.[0]?.text).toContain('اليوم 4')
    expect(week2[0]?.[0]?.minutes).toBe(GERMAN_MIN.review)
    expect(german.planWeek(1, USUAL_WEEK)[0]?.[0]?.key).toBe('w1:d0:intro')
  })

  it('moves site days with the week, not out of it, when a day changes type', () => {
    const examOnMonday: DayType[] = [...USUAL_WEEK]
    examOnMonday[2] = 'custom'
    const days = sessionsIn(1, examOnMonday).map((d) => d.length)
    expect(days.reduce((a, b) => a + b, 0)).toBe(4)
    expect(days[2]).toBe(1) // custom days come before hospital days
  })

  it('links every site day to its unit page and keeps keys unique', () => {
    const keys = new Set<string>()
    for (let w = 1; w <= german.totalWeeks; w++) {
      for (const item of german.planWeek(w, USUAL_WEEK).flat()) {
        expect(keys.has(item.key)).toBe(false)
        keys.add(item.key)
        expect(item.link?.url).toMatch(/^https:\/\/www\.pieceofgerman\.com\//)
      }
    }
  })

  it('marks the A1 exam week and the A2 review', () => {
    const milestones = Array.from(
      { length: german.totalWeeks },
      (_, i) => german.overview(i + 1).milestone,
    ).filter(Boolean)
    expect(milestones.some((m) => m?.includes('A1'))).toBe(true)
    expect(milestones.some((m) => m?.includes('A2'))).toBe(true)
    expect(german.overview(1).phase.startsWith('A1')).toBe(true)
    expect(german.overview(german.totalWeeks).phase.startsWith('C1')).toBe(true)
  })
})

describe('restart of 2026-10-21', () => {
  beforeEach(async () => {
    await db.open()
  })
  afterEach(async () => {
    await db.delete()
  })

  const before = '2026-10-19T10:00:00.000Z'
  const after = '2026-10-22T10:00:00.000Z'
  const tables = () => ({
    paths: db.table<LearningPathRow, string>('learning_paths'),
    checks: db.table<StudyCheckRow, string>('study_checks'),
    items: db.table<StudyItemRow, string>('study_items'),
  })

  /** The owner's state before the restart: three plans from 10-17, Dutch active, no German. */
  async function oldState() {
    const german = await db.learning_paths.where('curriculum_key').equals('german_a1_c1').first()
    if (german) await db.learning_paths.delete(german.id)
    await db.learning_paths.toCollection().modify({
      status: 'active',
      start_date: '2026-10-17',
      updated_at: before,
    })
  }

  it('adds German, pauses Dutch, moves every start and clears ticks and edits', async () => {
    await oldState()
    const [english] = (await listPaths()).filter((p) => p.curriculum_key === 'english_a2_c1')
    await setChecked(english!.id, 'w1:d0:anki', true, '2026-10-17')
    await editStep(
      english!.id,
      1,
      { key: 'w1:grammar', text: 'x', minutes: 10, kind: 'study', link: null },
      {
        text: 'my edit',
        minutes: 10,
        kind: 'study',
        link_title: '',
        link_url: '',
      },
    )
    await db.study_checks.toCollection().modify({ updated_at: before })
    await db.study_items.toCollection().modify({ updated_at: before })

    await restartPlans(tables())

    const paths = await listPaths()
    const status = Object.fromEntries(paths.map((p) => [p.curriculum_key, p.status]))
    expect(status).toEqual({
      english_a2_c1: 'active',
      health_tech: 'active',
      dutch_a1_c1: 'paused',
      german_a1_c1: 'active',
    })
    expect(paths.every((p) => p.start_date === BUILT_IN_PLANS_START)).toBe(true)
    expect(paths.every((p) => p.updated_at === PLANS_RESET_AT && p._dirty === 1)).toBe(true)
    expect((await db.study_checks.toArray()).every((c) => c.deleted_at)).toBe(true)
    expect((await db.study_items.toArray()).every((i) => i.deleted_at)).toBe(true)
  })

  it('keeps what the owner did after the restart, and his own plans steps', async () => {
    await oldState()
    const english = (await listPaths()).find((p) => p.curriculum_key === 'english_a2_c1')!
    await setChecked(english.id, 'w1:d2:anki', true, '2026-10-26')
    await db.study_checks.toCollection().modify({ updated_at: after })
    // The owner resumed Dutch on another device after the restart.
    await db.learning_paths
      .where('curriculum_key')
      .equals('dutch_a1_c1')
      .modify({ updated_at: after })

    await db.learning_paths.add({
      ...english,
      id: 'mine',
      curriculum_key: 'custom:00000000-0000-7000-8000-000000000002',
      status: 'paused',
      updated_at: before,
    })
    await addStep('mine', 1, 0, {
      text: 'my own step',
      minutes: 20,
      kind: 'study',
      link_title: '',
      link_url: '',
    })
    await db.study_items.toCollection().modify({ updated_at: before })

    await restartPlans(tables())

    expect((await db.study_checks.toArray()).every((c) => !c.deleted_at)).toBe(true)
    const dutch = await db.learning_paths.where('curriculum_key').equals('dutch_a1_c1').first()
    expect(dutch?.status).toBe('active')
    expect((await db.study_items.toArray()).every((i) => !i.deleted_at)).toBe(true)
    expect((await db.learning_paths.get('mine'))?.start_date).toBe(BUILT_IN_PLANS_START)
  })

  it('does nothing more the second time', async () => {
    await oldState()
    await restartPlans(tables())
    const first = await db.learning_paths.toArray()
    await restartPlans(tables())
    expect(await db.learning_paths.toArray()).toEqual(first)
  })
})
