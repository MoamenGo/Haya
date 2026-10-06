import { z } from 'zod'
import { GOAL_HORIZONS } from '@/core/db/types'

const TITLE_MAX = 200
const TEXT_MAX = 1000

export const newGoalInput = z.object({
  title: z.string().trim().min(1).max(TITLE_MAX),
  why: z.string().trim().max(TEXT_MAX).default(''),
  horizon: z.enum(GOAL_HORIZONS).default('quarter'),
})
export type NewGoalInput = z.input<typeof newGoalInput>
