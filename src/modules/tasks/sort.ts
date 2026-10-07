import type { TaskPriority, TaskRow } from '@/core/db/types'

export type TaskSort = 'date' | 'priority'

const PRIORITY_RANK: Record<TaskPriority, number> = { critical: 0, important: 1, normal: 2, low: 3 }
/** Undated tasks sort after every real date. */
const NO_DATE = '9999-12-31'

const byDate = (a: TaskRow, b: TaskRow) =>
  (a.scheduled_date ?? NO_DATE).localeCompare(b.scheduled_date ?? NO_DATE) ||
  a.created_at.localeCompare(b.created_at)

/** Returns a new array: by date (then creation), or by priority (then date). */
export function sortTasks(tasks: readonly TaskRow[], sort: TaskSort): TaskRow[] {
  const copy = [...tasks]
  if (sort === 'priority') {
    return copy.sort(
      (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || byDate(a, b),
    )
  }
  return copy.sort(byDate)
}
