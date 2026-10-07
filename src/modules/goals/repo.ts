import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { GoalRow, GoalStatus } from '@/core/db/types'
import { canActivateGoal } from '@/core/planner/wip'
import { goalChange, newGoalInput, type GoalChange, type NewGoalInput } from './schema'

/** The only code that reads or writes `goals`. */

export class GoalLimitError extends Error {
  constructor() {
    super('At most 3 active goals per horizon. Move one to "Not now" first.')
  }
}

/** New goals start in "Not now" (`idea`): writing a goal down is not committing to it. */
export async function createGoal(input: NewGoalInput): Promise<GoalRow> {
  const valid = newGoalInput.parse(input)
  const row: GoalRow = {
    ...newRowMeta(),
    ...valid,
    desired_outcome: '',
    success_metric: '',
    status: 'idea',
    target_date: null,
  }
  await db.goals.add(row)
  return row
}

export async function listGoals(): Promise<GoalRow[]> {
  const rows = await db.goals.toArray()
  return rows
    .filter((g) => !g.deleted_at && g.status !== 'archived')
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

/** Changes a goal's status; activating respects the per-horizon limit. */
export async function setGoalStatus(goal: GoalRow, status: GoalStatus): Promise<void> {
  await db.transaction('rw', db.goals, async () => {
    if (status === 'active') {
      const active = await db.goals.where('status').equals('active').toArray()
      const sameHorizon = active.filter((g) => !g.deleted_at && g.horizon === goal.horizon)
      if (!canActivateGoal(sameHorizon.length)) throw new GoalLimitError()
    }
    await db.goals.update(goal.id, { status, ...touchMeta() })
  })
}

/** One goal, or undefined when it doesn't exist or was deleted. */
export async function getGoal(goalId: string): Promise<GoalRow | undefined> {
  const goal = await db.goals.get(goalId)
  return goal && !goal.deleted_at ? goal : undefined
}

/** Edits the goal's words and horizon. Status changes go through setGoalStatus. */
export async function updateGoal(goalId: string, change: GoalChange): Promise<void> {
  await db.goals.update(goalId, { ...goalChange.parse(change), ...touchMeta() })
}

/**
 * Soft-deletes a goal and its links. Its projects are kept (they may still
 * matter) and simply stop pointing at it.
 */
export async function deleteGoal(goalId: string): Promise<void> {
  const deleted = { deleted_at: new Date().toISOString(), ...touchMeta() }
  await db.transaction('rw', db.goals, db.projects, db.resources, async () => {
    await db.goals.update(goalId, deleted)
    await db.projects
      .where('goal_id')
      .equals(goalId)
      .modify({ goal_id: null, ...touchMeta() })
    await db.resources.where('goal_id').equals(goalId).modify(deleted)
  })
}
