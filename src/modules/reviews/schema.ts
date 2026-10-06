import { z } from 'zod'

export const ENERGY_MIN = 1
export const ENERGY_MAX = 5
export const SLEEP_HOURS_MAX = 24
export const TOMORROW_MAX_ITEMS = 3
const TEXT_MAX = 500

/** The evening check-in. Everything except the date is optional. */
export const dailyLogInput = z.object({
  date: z.iso.date(),
  energy: z.number().int().min(ENERGY_MIN).max(ENERGY_MAX).nullable(),
  sleep_hours: z.number().min(0).max(SLEEP_HOURS_MAX).nullable(),
  gratitude: z.string().trim().max(TEXT_MAX),
  tomorrow_top3: z.array(z.string().trim().min(1).max(TEXT_MAX)).max(TOMORROW_MAX_ITEMS),
})

export type DailyLogInput = z.infer<typeof dailyLogInput>
