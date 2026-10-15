import { z } from 'zod'

/** A calendar date, `YYYY-MM-DD`. */
export const startDateInput = z.iso.date()
