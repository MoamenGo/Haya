import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { TaskRow } from '@/core/db/types'
import { canAddBigRock } from '@/core/planner/capacity'
import { localDateISO } from '@/core/time/date'
import { newTaskInput, type NewTaskInput } from './schema'

/** The only code that reads or writes `tasks`. */

export class BigRockLimitError extends Error {
  constructor() {
    super('A day can have at most 3 Big Rocks.')
  }
}

const isLive = (t: TaskRow) => !t.deleted_at

export async function createTask(input: NewTaskInput): Promise<TaskRow> {
  const valid = newTaskInput.parse(input)
  if (valid.is_big_rock) {
    if (!valid.scheduled_date) throw new Error('A Big Rock needs a date.')
    if (!canAddBigRock(await countBigRocks(valid.scheduled_date))) throw new BigRockLimitError()
  }
  const row: TaskRow = {
    ...newRowMeta(),
    ...valid,
    goal_id: null,
    notes: '',
    checklist: [],
    status: valid.scheduled_date ? 'scheduled' : 'next',
    commitment_level: 2,
    energy: 'medium',
    actual_minutes: null,
    due_date: null,
    prayer_block: null,
    rrule: null,
    completed_at: null,
  }
  await db.tasks.add(row)
  return row
}

/** Tasks scheduled for a day (done ones included, so the day shows its progress). */
export async function tasksForDate(dateISO: string): Promise<TaskRow[]> {
  const rows = await db.tasks.where('scheduled_date').equals(dateISO).toArray()
  return rows.filter((t) => isLive(t) && t.status !== 'cancelled')
}

/** Tasks scheduled between two dates, inclusive (for the week view). */
export async function tasksBetween(startISO: string, endISO: string): Promise<TaskRow[]> {
  const rows = await db.tasks
    .where('scheduled_date')
    .between(startISO, endISO, true, true)
    .toArray()
  return rows.filter((t) => isLive(t) && t.status !== 'cancelled')
}

/** Tasks completed on local dates between two days (inclusive), wherever they were scheduled. */
export async function tasksCompletedBetween(startISO: string, endISO: string): Promise<TaskRow[]> {
  const rows = await db.tasks.where('status').equals('done').toArray()
  return rows.filter((t) => {
    if (!isLive(t) || !t.completed_at) return false
    const day = localDateISO(new Date(t.completed_at))
    return day >= startISO && day <= endISO
  })
}

/**
 * Open tasks that are not scheduled for `dateISO`: overdue, upcoming, or undated.
 * Undated steps of projects that are not active stay on the Projects page, so a
 * long list of "Not now" plans never crowds the task list.
 */
export async function openTasksExcept(dateISO: string): Promise<TaskRow[]> {
  const rows = await db.tasks.where('status').anyOf('next', 'scheduled', 'waiting').toArray()
  const activeProjects = new Set(
    (await db.projects.where('status').equals('active').toArray()).map((p) => p.id),
  )
  const waitsOnProject = (t: TaskRow) =>
    t.project_id !== null && t.scheduled_date === null && !activeProjects.has(t.project_id)
  return rows
    .filter((t) => isLive(t) && t.scheduled_date !== dateISO && !waitsOnProject(t))
    .sort((a, b) => (a.scheduled_date ?? '9999').localeCompare(b.scheduled_date ?? '9999'))
}

export async function recentlyDone(limit: number): Promise<TaskRow[]> {
  const rows = await db.tasks.where('status').equals('done').toArray()
  return rows
    .filter(isLive)
    .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''))
    .slice(0, limit)
}

export async function countBigRocks(dateISO: string): Promise<number> {
  return (await tasksForDate(dateISO)).filter((t) => t.is_big_rock).length
}

export async function setTaskDone(task: TaskRow, done: boolean): Promise<void> {
  await db.tasks.update(task.id, {
    status: done ? 'done' : task.scheduled_date ? 'scheduled' : 'next',
    completed_at: done ? new Date().toISOString() : null,
    ...touchMeta(),
  })
}

/** Moves a task to a day, or to "later" with `null`. A Big Rock stays one only if the new day has room. */
export async function scheduleTask(task: TaskRow, dateISO: string | null): Promise<void> {
  const keepRock =
    task.is_big_rock && dateISO !== null && canAddBigRock(await countBigRocks(dateISO))
  await db.tasks.update(task.id, {
    scheduled_date: dateISO,
    status: task.status === 'done' ? 'done' : dateISO ? 'scheduled' : 'next',
    is_big_rock: keepRock,
    ...touchMeta(),
  })
}

/** Marks or unmarks a Big Rock for `dateISO`, scheduling the task there if needed. */
export async function setBigRock(task: TaskRow, dateISO: string, on: boolean): Promise<void> {
  await db.transaction('rw', db.tasks, async () => {
    if (on && !canAddBigRock(await countBigRocks(dateISO))) throw new BigRockLimitError()
    await db.tasks.update(task.id, {
      is_big_rock: on,
      ...(on
        ? { scheduled_date: dateISO, status: task.status === 'done' ? 'done' : 'scheduled' }
        : {}),
      ...touchMeta(),
    })
  })
}

/** Soft delete, so the deletion can sync to other devices later. */
export async function deleteTask(taskId: string): Promise<void> {
  await db.tasks.update(taskId, { deleted_at: new Date().toISOString(), ...touchMeta() })
}

export async function setEstimate(taskId: string, minutes: number | null): Promise<void> {
  await db.tasks.update(taskId, { est_minutes: minutes, ...touchMeta() })
}

/** Renames a task (titles are validated like new tasks). */
export async function renameTask(taskId: string, title: string): Promise<void> {
  const valid = newTaskInput.shape.title.parse(title)
  await db.tasks.update(taskId, { title: valid, ...touchMeta() })
}
