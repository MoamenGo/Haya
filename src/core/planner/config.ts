/** Planning constants (CLAUDE.md §4.3). Heuristics, not laws: tune them here. */

/** Share of the day's free time that may be planned; the rest is buffer. */
export const PLANNING_UTILIZATION = 0.7

/** At most this many top priorities per day. */
export const MAX_BIG_ROCKS = 3

/** Work-in-progress limits (CLAUDE.md §6.3, §6.4): the system helps say no. */
export const MAX_ACTIVE_PROJECTS = 3
export const MAX_ACTIVE_GOALS_PER_HORIZON = 3
