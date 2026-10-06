import { z } from 'zod'

const TITLE_MAX = 300
const EST_MINUTES_MAX = 24 * 60

/** What the owner can set when creating a task. Everything else gets a default. */
export const newTaskInput = z.object({
  title: z.string().trim().min(1).max(TITLE_MAX),
  scheduled_date: z.iso.date().nullable().default(null),
  is_big_rock: z.boolean().default(false),
  priority: z.enum(['critical', 'important', 'normal', 'low']).default('normal'),
  est_minutes: z.number().int().positive().max(EST_MINUTES_MAX).nullable().default(null),
  area_id: z.string().nullable().default(null),
  project_id: z.string().nullable().default(null),
})
export type NewTaskInput = z.input<typeof newTaskInput>
