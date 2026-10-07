import { z } from 'zod'

const TITLE_MAX = 300
const NOTES_MAX = 2000
const EST_MINUTES_MAX = 24 * 60

/** What the owner can set when creating a task. Everything else gets a default. */
export const newTaskInput = z.object({
  title: z.string().trim().min(1).max(TITLE_MAX),
  notes: z.string().trim().max(NOTES_MAX).default(''),
  scheduled_date: z.iso.date().nullable().default(null),
  is_big_rock: z.boolean().default(false),
  priority: z.enum(['critical', 'important', 'normal', 'low']).default('normal'),
  est_minutes: z.number().int().positive().max(EST_MINUTES_MAX).nullable().default(null),
  area_id: z.string().nullable().default(null),
  project_id: z.string().nullable().default(null),
})
export type NewTaskInput = z.input<typeof newTaskInput>

/** What the task dialog can change on an existing task. */
export const taskChange = newTaskInput
  .pick({
    title: true,
    notes: true,
    scheduled_date: true,
    priority: true,
    est_minutes: true,
    project_id: true,
  })
  .partial()
export type TaskChange = z.input<typeof taskChange>
