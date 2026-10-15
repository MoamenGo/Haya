import { z } from 'zod'
import { NOTE_BODY_MAX } from '@/core/notes/config'

const DATE_ISO = /^\d{4}-\d{2}-\d{2}$/

export const noteInput = z.object({
  date: z.string().regex(DATE_ISO),
  body_md: z.string().trim().max(NOTE_BODY_MAX),
})
export type NoteInput = z.input<typeof noteInput>

/** A finished recording, before it is saved with its note. */
export interface RecordingInput {
  blob: Blob
  mime_type: string
  seconds: number
}
