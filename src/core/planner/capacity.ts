import { DEFAULT_CAPACITY_MIN, type DayType } from '@/core/time/config'
import { MAX_BIG_ROCKS, PLANNING_UTILIZATION } from './config'

export interface Capacity {
  /** Free minutes the day type allows. */
  discretionary: number
  /** The part that may be planned (the rest is kept free). */
  plannable: number
  planned: number
  /** True when planned work is more than plannable. A warning, never a block. */
  over: boolean
}

/** Custom days have no default yet, so they borrow the lightest day's value. */
const CUSTOM_DAY_FALLBACK = DEFAULT_CAPACITY_MIN.rest

export function dayCapacity(
  dayType: DayType,
  plannedMinutes: number,
  utilization: number = PLANNING_UTILIZATION,
): Capacity {
  const discretionary = dayType === 'custom' ? CUSTOM_DAY_FALLBACK : DEFAULT_CAPACITY_MIN[dayType]
  const plannable = Math.round(discretionary * utilization)
  return { discretionary, plannable, planned: plannedMinutes, over: plannedMinutes > plannable }
}

export function canAddBigRock(currentCount: number): boolean {
  return currentCount < MAX_BIG_ROCKS
}
