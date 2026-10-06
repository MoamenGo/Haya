import { describe, expect, it } from 'vitest'
import { canAddBigRock, dayCapacity } from '@/core/planner/capacity'

describe('dayCapacity', () => {
  it('keeps 30% of a deep-work day free', () => {
    expect(dayCapacity('deep_work', 0)).toMatchObject({ discretionary: 360, plannable: 252 })
  })

  it('warns (never blocks) when a hospital day is over-planned', () => {
    const c = dayCapacity('hospital', 90)
    expect(c.plannable).toBe(84)
    expect(c.over).toBe(true)
  })

  it('treats custom days as light until they have their own settings', () => {
    expect(dayCapacity('custom', 0).discretionary).toBe(60)
  })
})

describe('canAddBigRock', () => {
  it('allows at most 3', () => {
    expect(canAddBigRock(2)).toBe(true)
    expect(canAddBigRock(3)).toBe(false)
  })
})
