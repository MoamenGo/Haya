import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { ProjectRow, ProjectStatus, TaskRow } from '@/core/db/types'
import { canActivateProject } from '@/core/planner/wip'
import { createTask } from '@/modules/tasks/repo'
import { newProjectInput, type NewProjectInput } from './schema'

/** The only code that reads or writes `projects`. */

export class ProjectWipLimitError extends Error {
  constructor() {
    super('At most 3 projects can be active. Pause one first.')
  }
}

export interface ProjectWithNext {
  project: ProjectRow
  /** The open next-action task, or null when the project needs one. */
  nextAction: TaskRow | null
}

/** New projects start as "planned": nothing becomes a commitment automatically. */
export async function createProject(input: NewProjectInput): Promise<ProjectRow> {
  const valid = newProjectInput.parse(input)
  const row: ProjectRow = {
    ...newRowMeta(),
    ...valid,
    area_id: null,
    kind: 'personal',
    reason: '',
    status: 'planned',
    priority: 'normal',
    commitment_level: 2,
    next_action_task_id: null,
    deadline: null,
    est_hours: null,
    energy: 'medium',
    review_date: null,
    client_id: null,
  }
  await db.projects.add(row)
  return row
}

export async function countActiveProjects(): Promise<number> {
  const rows = await db.projects.where('status').equals('active').toArray()
  return rows.filter((p) => !p.deleted_at).length
}

/** Every project except archived ones, each with its open next action. */
export async function listProjects(): Promise<ProjectWithNext[]> {
  const projects = (await db.projects.toArray()).filter(
    (p) => !p.deleted_at && p.status !== 'archived',
  )
  const nextIds = projects.map((p) => p.next_action_task_id).filter((id): id is string => !!id)
  const tasks = new Map((await db.tasks.bulkGet(nextIds)).flatMap((t) => (t ? [[t.id, t]] : [])))
  return projects
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((project) => {
      const task = project.next_action_task_id ? tasks.get(project.next_action_task_id) : undefined
      const open = task && !task.deleted_at && task.status !== 'done' && task.status !== 'cancelled'
      return { project, nextAction: open ? task : null }
    })
}

/**
 * Makes a project active. At the WIP limit, `pauseId` names the active project
 * to pause in the same transaction; without it the call fails with
 * ProjectWipLimitError so the UI can ask which one.
 */
export async function activateProject(projectId: string, pauseId?: string): Promise<void> {
  await db.transaction('rw', db.projects, async () => {
    if (pauseId) await db.projects.update(pauseId, { status: 'paused', ...touchMeta() })
    if (!canActivateProject(await countActiveProjects())) throw new ProjectWipLimitError()
    await db.projects.update(projectId, { status: 'active', ...touchMeta() })
  })
}

/** Pause, finish, or put back to planned. Use activateProject to make one active. */
export async function setProjectStatus(
  projectId: string,
  status: Exclude<ProjectStatus, 'active'>,
): Promise<void> {
  await db.projects.update(projectId, { status, ...touchMeta() })
}

/** Creates the next-action task and links it, in one transaction. */
export async function setNextAction(project: ProjectRow, title: string): Promise<void> {
  await db.transaction('rw', db.projects, db.tasks, async () => {
    const task = await createTask({ title, project_id: project.id })
    await db.projects.update(project.id, { next_action_task_id: task.id, ...touchMeta() })
  })
}
