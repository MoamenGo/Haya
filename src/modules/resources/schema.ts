import { z } from 'zod'

const URL_MAX = 2000
const TITLE_MAX = 300

export const newResourceInput = z.object({
  url: z.string().trim().min(1).max(URL_MAX),
  title: z.string().trim().max(TITLE_MAX).default(''),
  goal_id: z.string().nullable().default(null),
  project_id: z.string().nullable().default(null),
})
export type NewResourceInput = z.input<typeof newResourceInput>
