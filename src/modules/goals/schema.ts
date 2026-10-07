import { z } from 'zod'
import { GOAL_HORIZONS } from '@/core/db/types'

const TITLE_MAX = 200
const TEXT_MAX = 1000

export const newGoalInput = z.object({
  title: z.string().trim().min(1).max(TITLE_MAX),
  why: z.string().trim().max(TEXT_MAX).default(''),
  horizon: z.enum(GOAL_HORIZONS).default('quarter'),
  area_id: z.string().nullable().default(null),
})
export type NewGoalInput = z.input<typeof newGoalInput>

/** What the goal map can edit later. Every field is optional. */
export const goalChange = z
  .object({
    title: z.string().trim().min(1).max(TITLE_MAX),
    why: z.string().trim().max(TEXT_MAX),
    desired_outcome: z.string().trim().max(TEXT_MAX),
    horizon: z.enum(GOAL_HORIZONS),
  })
  .partial()
export type GoalChange = z.input<typeof goalChange>
