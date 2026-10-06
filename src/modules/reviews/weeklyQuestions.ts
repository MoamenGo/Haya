/**
 * The simple weekly review (CLAUDE.md §6.18). Answers are stored by these
 * ids, so wording can change in ar.json/en.json without losing old answers.
 */
export const WEEKLY_QUESTIONS = [
  'went_well',
  'didnt_go',
  'energy',
  'worship',
  'family',
  'learning',
  'pressure',
] as const

/** Up to three outcomes for next week; the week view shows them. */
export const WEEKLY_NEXT_KEYS = ['next_1', 'next_2', 'next_3'] as const
