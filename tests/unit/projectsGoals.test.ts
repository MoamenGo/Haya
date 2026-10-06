import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/core/db/db'
import { canActivateGoal, canActivateProject } from '@/core/planner/wip'
import { GoalLimitError, createGoal, listGoals, setGoalStatus } from '@/modules/goals/repo'
import {
  ProjectWipLimitError,
  activateProject,
  countActiveProjects,
  createProject,
  listProjects,
  setNextAction,
} from '@/modules/projects/repo'
import { setTaskDone } from '@/modules/tasks/repo'

beforeEach(async () => {
  await db.open()
})

afterEach(async () => {
  await db.delete()
})

describe('WIP rules', () => {
  it('allow up to 3 active', () => {
    expect(canActivateProject(2)).toBe(true)
    expect(canActivateProject(3)).toBe(false)
    expect(canActivateGoal(3)).toBe(false)
  })
})

describe('projects', () => {
  it('start as planned, never active automatically', async () => {
    const project = await createProject({ title: 'موقع العيادة' })
    expect(project.status).toBe('planned')
    expect(await countActiveProjects()).toBe(0)
  })

  it('refuse a 4th active project unless one is paused in the same step', async () => {
    const ids: string[] = []
    for (const title of ['أ', 'ب', 'ج', 'د']) ids.push((await createProject({ title })).id)
    for (const id of ids.slice(0, 3)) await activateProject(id)

    await expect(activateProject(ids[3]!)).rejects.toBeInstanceOf(ProjectWipLimitError)
    expect(await countActiveProjects()).toBe(3)

    await activateProject(ids[3]!, ids[0])
    expect(await countActiveProjects()).toBe(3)
    expect((await db.projects.get(ids[0]!))?.status).toBe('paused')
    expect((await db.projects.get(ids[3]!))?.status).toBe('active')
  })

  it('track the next action and flag when it is done', async () => {
    const project = await createProject({ title: 'كورس React' })
    await activateProject(project.id)
    await setNextAction(project, 'أتفرج على الدرس 1')

    let [item] = await listProjects()
    expect(item?.nextAction?.title).toBe('أتفرج على الدرس 1')
    expect(item?.nextAction?.project_id).toBe(project.id)

    await setTaskDone(item!.nextAction!, true)
    ;[item] = await listProjects()
    expect(item?.nextAction).toBeNull()
  })
})

describe('goals', () => {
  it('start in "Not now"', async () => {
    const goal = await createGoal({ title: 'أحفظ جزء عم' })
    expect(goal.status).toBe('idea')
    expect(goal.horizon).toBe('quarter')
  })

  it('allow 3 active per horizon, counted separately', async () => {
    const quarter = await Promise.all(
      ['1', '2', '3', '4'].map((title) => createGoal({ title, horizon: 'quarter' })),
    )
    for (const goal of quarter.slice(0, 3)) await setGoalStatus(goal, 'active')
    await expect(setGoalStatus(quarter[3]!, 'active')).rejects.toBeInstanceOf(GoalLimitError)

    const yearly = await createGoal({ title: 'سنة', horizon: 'year' })
    await setGoalStatus(yearly, 'active')
    expect((await listGoals()).filter((g) => g.status === 'active')).toHaveLength(4)
  })
})
