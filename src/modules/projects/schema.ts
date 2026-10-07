import { z } from 'zod'

const TITLE_MAX = 200
const TEXT_MAX = 1000

export const newProjectInput = z.object({
  title: z.string().trim().min(1).max(TITLE_MAX),
  /** What "done" looks like, in one sentence. */
  outcome: z.string().trim().max(TEXT_MAX).default(''),
  goal_id: z.string().nullable().default(null),
  area_id: z.string().nullable().default(null),
})
export type NewProjectInput = z.input<typeof newProjectInput>

/** What can be edited on an existing project. */
export const projectChange = z
  .object({
    title: z.string().trim().min(1).max(TITLE_MAX),
    outcome: z.string().trim().max(TEXT_MAX),
  })
  .partial()
export type ProjectChange = z.input<typeof projectChange>
