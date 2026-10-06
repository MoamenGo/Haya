/** Sync timing and sizes (CLAUDE.md §7.3). Heuristics, kept in one place. */

/** Rows per upload request. */
export const PUSH_BATCH_SIZE = 200
/** Rows per download request. */
export const PULL_PAGE_SIZE = 500
/**
 * Each pull re-reads the last minute before the saved cursor. A write that
 * was stamped just before another but committed just after it is still seen.
 * Re-reading a row is harmless: applying it twice gives the same result.
 */
export const PULL_OVERLAP_MS = 60_000
/** Wait this long after the last local change before syncing, so typing doesn't sync per key. */
export const SYNC_DEBOUNCE_MS = 1_500
/**
 * While the app is on screen, sync this often even with no local changes.
 * A safety net: normally the other device's "I changed something" nudge
 * (nudge.ts) starts a sync within a second or two.
 */
export const SYNC_INTERVAL_MS = 60_000
