import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { ProjectRow, ProjectStatus, TaskRow } from '@/core/db/types'
import { canActivateProject } from '@/core/planner/wip'
import { createGoal } from '@/modules/goals/repo'
import { createTask } from '@/modules/tasks/repo'
import { newProjectInput, projectChange, type NewProjectInput, type ProjectChange } from './schema'
import { STARTER_GOALS, type StarterGoal } from './starterGoals'

/** The only code that reads or writes `projects`. */

export class ProjectWipLimitError extends Error {
  constructor() {
    super('At most 3 projects can be active. Pause one first.')
  }
}

export interface ProjectWithNext {
  project: ProjectRow
  /** The next open step, or null when the project needs one. */
  nextAction: TaskRow | null
}

/** New projects start as "planned": nothing becomes a commitment automatically. */
export async function createProject(input: NewProjectInput): Promise<ProjectRow> {
  const valid = newProjectInput.parse(input)
  const row: ProjectRow = {
    ...newRowMeta(),
    ...valid,
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

const isOpenTask = (t: TaskRow) => !t.deleted_at && t.status !== 'done' && t.status !== 'cancelled'

/**
 * Every project except archived ones, each with its next action. The next action
 * is the step the owner picked; when there is none (or it is done), it is the
 * first open step, so finishing one step brings up the next on its own.
 */
export async function listProjects(): Promise<ProjectWithNext[]> {
  const projects = (await db.projects.toArray()).filter(
    (p) => !p.deleted_at && p.status !== 'archived',
  )
  const steps = await db.tasks
    .where('project_id')
    .anyOf(projects.map((p) => p.id))
    .toArray()
  const openSteps = steps
    .filter(isOpenTask)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
  return projects
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((project) => {
      const mine = openSteps.filter((t) => t.project_id === project.id)
      const picked = mine.find((t) => t.id === project.next_action_task_id)
      return { project, nextAction: picked ?? mine[0] ?? null }
    })
}

/** All steps (tasks) of one project, oldest first, done ones included to show progress. */
export async function stepsForProject(projectId: string): Promise<TaskRow[]> {
  const rows = await db.tasks.where('project_id').equals(projectId).toArray()
  return rows
    .filter((t) => !t.deleted_at && t.status !== 'cancelled')
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

/** Adds one small step to a project, without scheduling it (it waits for "today" or "tomorrow"). */
export async function addProjectStep(
  projectId: string,
  title: string,
  minutes: number | null = null,
): Promise<TaskRow> {
  return createTask({ title, project_id: projectId, est_minutes: minutes })
}

/** The starter goals that are not in the database yet (matched by goal title). */
export async function missingStarterGoals(): Promise<StarterGoal[]> {
  const existing = new Set(
    (await db.goals.toArray()).filter((g) => !g.deleted_at).map((g) => g.title),
  )
  return STARTER_GOALS.filter((s) => !existing.has(s.goal))
}

/**
 * Adds the starter goals (starterGoals.ts) that are missing, each with its
 * project and first steps. Safe to run twice: goals already there are skipped.
 * Everything starts as "Not now"; nothing becomes active by itself.
 * Returns how many goals were added.
 */
export async function addStarterGoals(): Promise<number> {
  return db.transaction('rw', db.goals, db.projects, db.tasks, db.life_areas, async () => {
    const missing = await missingStarterGoals()
    const areas = await db.life_areas.toArray()
    const areaId = (nameEn: string) => areas.find((a) => a.name_en === nameEn)?.id ?? null
    for (const starter of missing) {
      const area_id = areaId(starter.area)
      const goal = await createGoal({
        title: starter.goal,
        why: starter.why,
        horizon: starter.horizon,
        area_id,
      })
      const project = await createProject({
        title: starter.project,
        outcome: starter.outcome,
        goal_id: goal.id,
        area_id,
      })
      for (const step of starter.steps) {
        await createTask({
          title: step.title,
          est_minutes: step.minutes,
          project_id: project.id,
          area_id,
        })
      }
    }
    return missing.length
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

export async function updateProject(projectId: string, change: ProjectChange): Promise<void> {
  await db.projects.update(projectId, { ...projectChange.parse(change), ...touchMeta() })
}

/**
 * Soft-deletes a project and its steps. Its links stay on the goal. Soft
 * delete means rows are hidden and the deletion syncs; nothing is erased.
 */
export async function deleteProject(projectId: string): Promise<void> {
  const deleted = { deleted_at: new Date().toISOString(), ...touchMeta() }
  await db.transaction('rw', db.projects, db.tasks, db.resources, async () => {
    await db.projects.update(projectId, deleted)
    await db.tasks
      .where('project_id')
      .equals(projectId)
      .filter((t) => !t.deleted_at)
      .modify(deleted)
    await db.resources
      .where('project_id')
      .equals(projectId)
      .modify({ project_id: null, ...touchMeta() })
  })
}

/** Projects under one goal, each with its next step (for the goal map). */
export async function projectsForGoal(goalId: string): Promise<ProjectWithNext[]> {
  return (await listProjects()).filter((item) => item.project.goal_id === goalId)
}
