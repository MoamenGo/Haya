import { z } from 'zod'
import { PRAYER_BLOCKS } from '@/core/db/types'

const TITLE_MAX = 120
const TEXT_MAX = 300

/** What the owner sets when adding a habit. Every habit is daily for now. */
export const newRoutineInput = z.object({
  title: z.string().trim().min(1).max(TITLE_MAX),
  anchor: z.enum(PRAYER_BLOCKS),
  full_version: z.string().trim().max(TEXT_MAX).default(''),
  /** The hard-day version. Doing it counts as a full success (CLAUDE.md §4.5). */
  minimum_version: z.string().trim().min(1).max(TEXT_MAX),
  is_worship: z.boolean().default(false),
})
export type NewRoutineInput = z.input<typeof newRoutineInput>
