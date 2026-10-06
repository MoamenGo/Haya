import { MAX_ACTIVE_GOALS_PER_HORIZON, MAX_ACTIVE_PROJECTS } from './config'

/**
 * WIP limits are hard: starting something new while at the limit means
 * pausing something first. The UI asks which one; nothing is paused silently.
 */
export function canActivateProject(activeCount: number, limit = MAX_ACTIVE_PROJECTS): boolean {
  return activeCount < limit
}

export function canActivateGoal(
  activeInHorizon: number,
  limit = MAX_ACTIVE_GOALS_PER_HORIZON,
): boolean {
  return activeInHorizon < limit
}
