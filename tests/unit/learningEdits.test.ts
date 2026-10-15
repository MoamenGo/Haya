import { describe, expect, it } from 'vitest'
import { english } from '@/core/learning/curricula/english'
import { editableWeek, emptyCurriculum, withEdits, type StudyItemEdit } from '@/core/learning/edits'
import { curriculumFor, studyDay } from '@/core/learning/plan'
import { planWeekDates } from '@/core/learning/week'
import type { DayType } from '@/core/time/config'
import { dayTypeForDate } from '@/core/time/dayType'

const START = '2026-10-17' // a Saturday
const USUAL_WEEK: DayType[] = planWeekDates(START, 1).map((d) => dayTypeForDate(d))

function edit(fields: Partial<StudyItemEdit> & Pick<StudyItemEdit, 'item_key'>): StudyItemEdit {
  return {
    week: 1,
    day: null,
    text: 'خطوة',
    minutes: 15,
    kind: 'study',
    link_title: null,
    link_url: null,
    hidden: false,
    created_at: '2026-10-15T10:00:00.000Z',
    ...fields,
  }
}

describe('owner edits on a built-in plan', () => {
  const saturday = english.planWeek(1, USUAL_WEEK)[0] ?? []
  const [first, second] = saturday
  if (!first || !second) throw new Error('English week 1 needs two Saturday steps')

  it('changes a step by its key and keeps the key (so ticks stay)', () => {
    const plan = withEdits(english, [
      edit({ item_key: first.key, text: 'كلمات Anki فقط', minutes: 5 }),
    ])
    const day = plan.planWeek(1, USUAL_WEEK)[0] ?? []
    expect(day[0]).toMatchObject({ key: first.key, text: 'كلمات Anki فقط', minutes: 5 })
    expect(day).toHaveLength(saturday.length)
  })

  it('hides a step from the plan but keeps it in the editor', () => {
    const edits = [edit({ item_key: second.key, hidden: true })]
    const plan = withEdits(english, edits)
    expect(plan.planWeek(1, USUAL_WEEK)[0]?.map((i) => i.key)).not.toContain(second.key)
    const steps = editableWeek(english, edits, 1, USUAL_WEEK)[0] ?? []
    expect(steps.find((s) => s.item.key === second.key)?.hidden).toBe(true)
  })

  it('adds his own steps to a day, after the built-in ones, oldest first', () => {
    const edits = [
      edit({ item_key: 'x:b', day: 2, text: 'تانية', created_at: '2026-10-15T11:00:00.000Z' }),
      edit({ item_key: 'x:a', day: 2, text: 'أولى' }),
      edit({ item_key: 'x:other-week', week: 2, day: 2 }),
    ]
    const monday = withEdits(english, edits).planWeek(1, USUAL_WEEK)[2] ?? []
    expect(monday.slice(-2).map((i) => i.text)).toEqual(['أولى', 'تانية'])
    expect(monday.map((i) => i.key)).not.toContain('x:other-week')
  })

  it('counts his steps against the day, and shrinks to the minimum on a hard day', () => {
    const edits = [edit({ item_key: 'x:a', day: 0, minutes: 20 })]
    const plan = withEdits(english, edits)
    const usual = studyDay(english, START, START, USUAL_WEEK, new Set(), false)
    const mine = studyDay(plan, START, START, USUAL_WEEK, new Set(), false)
    expect(mine.remainingMinutes).toBe(usual.remainingMinutes + 20)
    expect(studyDay(plan, START, START, USUAL_WEEK, new Set(), true).items).toHaveLength(1)
  })
})

describe('custom plans', () => {
  const path = { curriculum_key: 'custom:1' as const, total_weeks: 4 }

  it('starts empty, with the length he chose', () => {
    const plan = curriculumFor(path, [])
    expect(plan.totalWeeks).toBe(4)
    expect(plan.planWeek(1, USUAL_WEEK).flat()).toEqual([])
    expect(studyDay(plan, START, START, USUAL_WEEK, new Set(), false).items).toEqual([])
  })

  it('uses his steps, with links, and his first step as the hard-day minimum', () => {
    const plan = curriculumFor(path, [
      edit({
        item_key: 'x:a',
        day: 0,
        text: 'درس',
        link_title: 'Docs',
        link_url: 'https://docs.python.org',
      }),
    ])
    const [step] = plan.planWeek(1, USUAL_WEEK)[0] ?? []
    expect(step?.link).toEqual({ title: 'Docs', url: 'https://docs.python.org' })
    expect(plan.minimum(1, 0)?.text).toBe('درس')
    expect(plan.minimum(1, 1)).toBeNull()
    expect(studyDay(plan, START, '2026-10-18', USUAL_WEEK, new Set(), true).items).toEqual([])
  })

  it('has no built-in overview', () => {
    expect(emptyCurriculum('custom:1', 2).overview(1)).toMatchObject({ phase: '', topics: [] })
  })
})
