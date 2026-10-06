import { z } from 'zod'
import { DAY_TYPES } from '@/core/time/config'

/** A whole day is 1440 minutes; nobody has more free time than that. */
export const CAPACITY_MAX_MIN = 1440
const NOTE_MAX = 200

export const dayOverrideInput = z.object({
  date: z.iso.date(),
  day_type: z.enum(DAY_TYPES),
  capacity_min: z.number().int().min(0).max(CAPACITY_MAX_MIN).nullable(),
  note: z.string().trim().max(NOTE_MAX),
})

export type DayOverrideInput = z.infer<typeof dayOverrideInput>
