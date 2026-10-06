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

/** A custom day without its own minutes borrows the lightest day's value. */
const CUSTOM_DAY_FALLBACK = DEFAULT_CAPACITY_MIN.rest

export interface CapacityOptions {
  utilization?: number
  /** Free minutes the owner set for this date (an override). Wins over the day-type default. */
  customMinutes?: number | null
}

export function dayCapacity(
  dayType: DayType,
  plannedMinutes: number,
  { utilization = PLANNING_UTILIZATION, customMinutes = null }: CapacityOptions = {},
): Capacity {
  const typeDefault = dayType === 'custom' ? CUSTOM_DAY_FALLBACK : DEFAULT_CAPACITY_MIN[dayType]
  const discretionary = customMinutes ?? typeDefault
  const plannable = Math.round(discretionary * utilization)
  return { discretionary, plannable, planned: plannedMinutes, over: plannedMinutes > plannable }
}

export function canAddBigRock(currentCount: number): boolean {
  return currentCount < MAX_BIG_ROCKS
}
