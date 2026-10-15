import { z } from 'zod'
import { CUSTOM_PLAN } from '@/core/learning/config'
import { STUDY_ITEM_KINDS } from '@/core/learning/types'

/** A calendar date, `YYYY-MM-DD`. */
export const startDateInput = z.iso.date()

const TITLE_MAX = 200
const STEP_TEXT_MAX = 300
const LINK_MAX = 500

/** A plan's own settings: name, length (custom plans) and start date. */
export const planInput = z.object({
  title: z.string().trim().min(1).max(TITLE_MAX),
  total_weeks: z.number().int().min(1).max(CUSTOM_PLAN.maxWeeks),
  start_date: startDateInput,
})
export type PlanInput = z.infer<typeof planInput>

/** One step, as the owner types it. An empty link field means "no link". */
export const stepInput = z.object({
  text: z.string().trim().min(1).max(STEP_TEXT_MAX),
  minutes: z.number().int().min(1).max(CUSTOM_PLAN.maxMinutes),
  kind: z.enum(STUDY_ITEM_KINDS),
  link_title: z
    .string()
    .trim()
    .max(LINK_MAX)
    .transform((v) => v || null),
  link_url: z
    .string()
    .trim()
    .max(LINK_MAX)
    .pipe(z.union([z.literal(''), z.url({ protocol: /^https?$/ })]))
    .transform((v) => v || null),
})
export type StepInput = z.input<typeof stepInput>
