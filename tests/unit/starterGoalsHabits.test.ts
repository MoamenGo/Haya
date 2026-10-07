import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/core/db/db'
import {
  activateProject,
  addProjectStep,
  addStarterGoals,
  createProject,
  listProjects,
  missingStarterGoals,
  stepsForProject,
} from '@/modules/projects/repo'
import { STARTER_GOALS } from '@/modules/projects/starterGoals'
import {
  createRoutine,
  deleteRoutine,
  listActiveRoutines,
  listRoutines,
  setRoutineActive,
} from '@/modules/routines/repo'
import { openTasksExcept, setTaskDone } from '@/modules/tasks/repo'

const TODAY = '2026-10-07'

beforeEach(async () => {
  await db.open()
})

afterEach(async () => {
  await db.delete()
})

describe('starter goals', () => {
  it('add every goal with a project and steps, all "Not now"', async () => {
    expect(await addStarterGoals()).toBe(STARTER_GOALS.length)

    const goals = await db.goals.toArray()
    const projects = await db.projects.toArray()
    expect(goals).toHaveLength(STARTER_GOALS.length)
    expect(goals.every((g) => g.status === 'idea' && g.area_id !== null)).toBe(true)
    expect(projects.every((p) => p.status === 'planned' && p.goal_id !== null)).toBe(true)
    expect(await db.tasks.count()).toBe(STARTER_GOALS.length * 3)
  })

  it('are safe to add twice', async () => {
    await addStarterGoals()
    expect(await missingStarterGoals()).toHaveLength(0)
    expect(await addStarterGoals()).toBe(0)
    expect(await db.goals.count()).toBe(STARTER_GOALS.length)
  })

  it('keep steps of "Not now" projects out of the task list until started', async () => {
    await addStarterGoals()
    expect(await openTasksExcept(TODAY)).toHaveLength(0)

    const [first] = await listProjects()
    await activateProject(first!.project.id)
    expect(await openTasksExcept(TODAY)).toHaveLength(3)
  })
})

describe('project steps', () => {
  it('the next action moves to the following step when one is done', async () => {
    const project = await createProject({ title: 'كورس' })
    await activateProject(project.id)
    await addProjectStep(project.id, 'الدرس 1')
    await addProjectStep(project.id, 'الدرس 2')

    let [item] = await listProjects()
    expect(item?.nextAction?.title).toBe('الدرس 1')

    await setTaskDone(item!.nextAction!, true)
    ;[item] = await listProjects()
    expect(item?.nextAction?.title).toBe('الدرس 2')
    expect(await stepsForProject(project.id)).toHaveLength(2)
  })
})

describe('habits', () => {
  it('can be added, paused and removed', async () => {
    const before = (await listActiveRoutines()).length
    const walk = await createRoutine({
      title: 'مشي',
      anchor: 'after_asr',
      minimum_version: '10 دقايق',
    })
    expect(walk.active).toBe(true)
    expect(await listActiveRoutines()).toHaveLength(before + 1)
    expect((await listActiveRoutines()).at(-1)?.title).toBe('مشي')

    await setRoutineActive(walk.id, false)
    expect(await listActiveRoutines()).toHaveLength(before)
    expect(await listRoutines()).toHaveLength(before + 1)

    await deleteRoutine(walk.id)
    expect(await listRoutines()).toHaveLength(before)
  })

  it('need a hard-day version', async () => {
    await expect(
      createRoutine({ title: 'قراءة', anchor: 'after_isha', minimum_version: ' ' }),
    ).rejects.toThrow()
  })
})
