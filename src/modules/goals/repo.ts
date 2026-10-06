import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { GoalRow, GoalStatus } from '@/core/db/types'
import { canActivateGoal } from '@/core/planner/wip'
import { newGoalInput, type NewGoalInput } from './schema'

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
    area_id: null,
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
