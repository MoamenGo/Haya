import { describe, expect, it } from 'vitest'
import { dutch } from '@/core/learning/curricula/dutch'
import { english } from '@/core/learning/curricula/english'
import { healthTech } from '@/core/learning/curricula/healthTech'
import { CURRICULA, defaultWeekDayTypes, planProgress, studyDay } from '@/core/learning/plan'
import { dayIndexInWeek, planWeekDates, planWeekOn } from '@/core/learning/week'
import { dayCapacity } from '@/core/planner/capacity'
import type { DayType } from '@/core/time/config'
import { dayTypeForDate } from '@/core/time/dayType'

const START = '2026-10-17' // a Saturday
const USUAL_WEEK: DayType[] = planWeekDates(START, 1).map((d) => dayTypeForDate(d))
const minutes = (items: { minutes: number }[]) => items.reduce((s, i) => s + i.minutes, 0)

describe('plan weeks', () => {
  it('counts weeks from Saturday', () => {
    expect(planWeekOn(START, '2026-10-15')).toBe(0)
    expect(planWeekOn(START, '2026-10-17')).toBe(1)
    expect(planWeekOn(START, '2026-10-23')).toBe(1)
    expect(planWeekOn(START, '2026-10-24')).toBe(2)
    // A start in mid-week counts from that week's Saturday.
    expect(planWeekOn('2026-10-21', '2026-10-17')).toBe(1)
  })

  it('places a date inside its week, Saturday first', () => {
    expect(dayIndexInWeek('2026-10-17')).toBe(0)
    expect(dayIndexInWeek('2026-10-23')).toBe(6)
  })

  it('uses the usual pattern: hospital, hospital, deep, deep, hospital, deep, rest', () => {
    expect(USUAL_WEEK).toEqual([
      'hospital',
      'hospital',
      'deep_work',
      'deep_work',
      'hospital',
      'deep_work',
      'rest',
    ])
  })
})

describe('daily sessions', () => {
  it('sizes English by day type', () => {
    const days = english.planWeek(1, USUAL_WEEK).map(minutes)
    expect(days).toEqual([30, 30, 75, 75, 30, 75, 10])
  })

  it('sizes Dutch by day type, like the original map (30 / 75 / 10)', () => {
    const days = dutch.planWeek(1, USUAL_WEEK).map(minutes)
    expect(days).toEqual([30, 30, 75, 75, 30, 75, 10])
  })

  it('sizes Health Tech by day type', () => {
    const days = healthTech.planWeek(1, USUAL_WEEK).map(minutes)
    expect(days).toEqual([45, 45, 150, 150, 45, 150, 30])
  })

  it('keeps both plans together inside each day’s plannable time', () => {
    const en = english.planWeek(1, USUAL_WEEK)
    const ht = healthTech.planWeek(1, USUAL_WEEK)
    USUAL_WEEK.forEach((type, day) => {
      const planned = minutes(en[day] ?? []) + minutes(ht[day] ?? [])
      expect(dayCapacity(type, planned).over).toBe(false)
    })
  })

  it('with Dutch too, deep-work days go over and the capacity bar says so', () => {
    const all = [english, healthTech, dutch].map((c) => c.planWeek(1, USUAL_WEEK))
    const planned = (day: number) => all.reduce((sum, plan) => sum + minutes(plan[day] ?? []), 0)
    expect(planned(2)).toBe(300)
    expect(dayCapacity('deep_work', planned(2)).over).toBe(true)
  })

  it('gives every item a unique key in every week', () => {
    for (const curriculum of Object.values(CURRICULA)) {
      for (let w = 1; w <= curriculum.totalWeeks; w++) {
        const keys = curriculum
          .planWeek(w, USUAL_WEEK)
          .flat()
          .map((i) => i.key)
        expect(new Set(keys).size).toBe(keys.length)
      }
    }
  })

  it('puts the English level check on the last deep day of week 13', () => {
    const thursday = english.planWeek(13, USUAL_WEEK)[5] ?? []
    expect(thursday.some((i) => i.kind === 'check')).toBe(true)
    expect(
      english
        .planWeek(12, USUAL_WEEK)
        .flat()
        .some((i) => i.kind === 'check'),
    ).toBe(false)
  })

  it('moves Health Tech blocks when a deep day becomes a day off', () => {
    const exams: DayType[] = [...USUAL_WEEK]
    exams[3] = 'custom' // Tuesday
    exams[5] = 'custom' // Thursday
    const plan = healthTech.planWeek(5, exams)
    const monday = plan[2] ?? []
    expect(monday.map((i) => i.key)).toContain('w5:project')
    expect(monday.map((i) => i.key)).toContain('w5:topic3')
    // The weekly wrap stays on Friday.
    expect((plan[6] ?? []).map((i) => i.key)).toContain('w5:push')
  })
})

describe('studyDay', () => {
  it('waits before the start and stops after the end', () => {
    expect(studyDay(english, START, '2026-10-16', USUAL_WEEK, new Set(), false).state).toBe(
      'not_started',
    )
    expect(studyDay(english, START, '2028-06-01', USUAL_WEEK, new Set(), false).state).toBe(
      'finished',
    )
  })

  it('subtracts ticked items from the remaining minutes', () => {
    const monday = '2026-10-19'
    const first = studyDay(healthTech, START, monday, USUAL_WEEK, new Set(), false)
    expect(first.remainingMinutes).toBe(150)
    const ticked = new Set([first.items[0]?.key ?? ''])
    expect(studyDay(healthTech, START, monday, USUAL_WEEK, ticked, false).remainingMinutes).toBe(
      100,
    )
  })

  it('shows only the small version in Minimum mode', () => {
    const day = studyDay(english, START, '2026-10-19', USUAL_WEEK, new Set(), true)
    expect(day.items).toHaveLength(1)
    expect(day.remainingMinutes).toBe(10)
  })

  it('reports whole-plan progress', () => {
    const keys = english
      .planWeek(1, USUAL_WEEK)
      .flat()
      .map((i) => i.key)
    const progress = planProgress(english, USUAL_WEEK, new Set(keys))
    expect(progress).toBeGreaterThan(0)
    expect(progress).toBeLessThan(0.05)
  })
})

describe('defaultWeekDayTypes', () => {
  it('follows the owner week, Saturday first', () => {
    expect(defaultWeekDayTypes()).toEqual([
      'hospital',
      'hospital',
      'deep_work',
      'deep_work',
      'hospital',
      'deep_work',
      'rest',
    ])
  })
})

describe('Dutch plan', () => {
  it('covers 96 weeks in five stages, A1 to C1', () => {
    expect(dutch.totalWeeks).toBe(96)
    expect(dutch.overview(1).phase.startsWith('A1')).toBe(true)
    expect(dutch.overview(17).phase.startsWith('A2')).toBe(true)
    expect(dutch.overview(96).phase.startsWith('C1')).toBe(true)
  })

  it('gives every week a grammar topic and unique step keys', () => {
    for (let w = 1; w <= dutch.totalWeeks; w++) {
      expect(dutch.overview(w).title).not.toBe('')
      const keys = dutch
        .planWeek(w, USUAL_WEEK)
        .flat()
        .map((i) => i.key)
      expect(new Set(keys).size).toBe(keys.length)
    }
  })

  it('lists each source once per week', () => {
    for (let w = 1; w <= dutch.totalWeeks; w++) {
      const urls = dutch.overview(w).resources.map((r) => r.url)
      expect(new Set(urls).size).toBe(urls.length)
    }
  })

  it('puts a practice exam at the end of each stage', () => {
    const examWeeks: number[] = []
    for (let w = 1; w <= dutch.totalWeeks; w++) {
      if (
        dutch
          .planWeek(w, USUAL_WEEK)
          .flat()
          .some((i) => i.kind === 'check')
      )
        examWeeks.push(w)
    }
    expect(examWeeks).toEqual([16, 36, 56, 76, 96])
  })

  it('reviews grammar in Arabic while Arabic sources exist (not at C1)', () => {
    const arabicIn = (w: number) =>
      dutch
        .planWeek(w, USUAL_WEEK)
        .flat()
        .some((i) => i.key === `w${w}:arabic`)
    expect(arabicIn(1)).toBe(true)
    expect(arabicIn(80)).toBe(false)
  })
})
