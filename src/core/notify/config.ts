/**
 * Phone notifications (ADR-008). Defaults only: the owner turns each kind on
 * or off in Settings. Times are tied to prayers, like the rest of the day.
 */

export const NOTIFY_CATEGORIES = ['morning', 'evening', 'prayers', 'due'] as const
export type NotifyCategory = (typeof NOTIFY_CATEGORIES)[number]

/** How many days ahead the phone gets its notifications (today included). */
export const NOTIFY_HORIZON_DAYS = 3

/** Morning brief: this long after Fajr. */
export const MORNING_AFTER_FAJR_MIN = 20
/** Deadlines: a few minutes after the morning brief, so the two don't arrive together. */
export const DUE_AFTER_MORNING_MIN = 5
/** Evening review reminder: this long after Maghrib. */
export const EVENING_AFTER_MAGHRIB_MIN = 30
/** Quiet hours (§6.21): from this long after Isha until Fajr, only prayer times may arrive. */
export const QUIET_AFTER_ISHA_MIN = 60

/** At most this many titles are named in one notification; the rest become "+n". */
export const MAX_TITLES_IN_BODY = 3

/** Wait this long after the last change before re-sending the plan to the phone. */
export const NOTIFY_RESEND_DEBOUNCE_MS = 2_000
