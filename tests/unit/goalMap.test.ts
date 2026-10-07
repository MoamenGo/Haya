import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/core/db/db'
import { createGoal, deleteGoal, getGoal, updateGoal } from '@/modules/goals/repo'
import {
  addProjectStep,
  createProject,
  deleteProject,
  listProjects,
  projectsForGoal,
  stepsForProject,
} from '@/modules/projects/repo'
import {
  DuplicateResourceError,
  InvalidUrlError,
  addResource,
  deleteResource,
  resourcesForGoal,
} from '@/modules/resources/repo'
import { renameTask } from '@/modules/tasks/repo'

beforeEach(async () => {
  await db.open()
})

afterEach(async () => {
  await db.delete()
})

describe('goal map', () => {
  it('edits a goal and renames a step', async () => {
    const goal = await createGoal({ title: 'أتعلم' })
    await updateGoal(goal.id, { title: 'أتعلم البرمجة', desired_outcome: 'تطبيق شغال' })
    expect((await getGoal(goal.id))?.desired_outcome).toBe('تطبيق شغال')

    const project = await createProject({ title: 'كورس', goal_id: goal.id })
    const step = await addProjectStep(project.id, 'درس 1')
    await renameTask(step.id, 'الدرس الأول')
    expect((await stepsForProject(project.id))[0]?.title).toBe('الدرس الأول')
    expect(await projectsForGoal(goal.id)).toHaveLength(1)
  })

  it('deleting a project hides it and its steps, and keeps its links on the goal', async () => {
    const goal = await createGoal({ title: 'هدف' })
    const project = await createProject({ title: 'مشروع', goal_id: goal.id })
    await addProjectStep(project.id, 'خطوة')
    const link = await addResource({
      url: 'youtube.com/watch?v=1',
      goal_id: goal.id,
      project_id: project.id,
    })

    await deleteProject(project.id)
    expect(await listProjects()).toHaveLength(0)
    expect(await stepsForProject(project.id)).toHaveLength(0)
    // Soft delete: the rows are still there, marked, so the deletion can sync.
    expect((await db.projects.get(project.id))?.deleted_at).not.toBeNull()
    const [kept] = await resourcesForGoal(goal.id)
    expect(kept?.id).toBe(link.id)
    expect(kept?.project_id).toBeNull()
  })

  it('deleting a goal keeps its projects and removes its links', async () => {
    const goal = await createGoal({ title: 'هدف' })
    const project = await createProject({ title: 'مشروع', goal_id: goal.id })
    await addResource({ url: 'https://example.com/a', goal_id: goal.id })

    await deleteGoal(goal.id)
    expect(await getGoal(goal.id)).toBeUndefined()
    expect((await db.projects.get(project.id))?.goal_id).toBeNull()
    expect(await resourcesForGoal(goal.id)).toHaveLength(0)
  })
})

describe('resources', () => {
  it('clean the link, guess its type, and refuse the same link twice on one goal', async () => {
    const goal = await createGoal({ title: 'هدف' })
    const row = await addResource({
      url: 'https://www.youtube.com/watch?v=abc&utm_source=x',
      goal_id: goal.id,
    })
    expect(row.type).toBe('video')
    expect(row.status).toBe('queued')
    expect(row.url_normalized).toBe('https://youtube.com/watch?v=abc')

    await expect(
      addResource({ url: 'youtube.com/watch?v=abc', goal_id: goal.id }),
    ).rejects.toBeInstanceOf(DuplicateResourceError)

    // Another goal may use the same link, and a deleted one can be added again.
    const other = await createGoal({ title: 'تاني' })
    await addResource({ url: 'youtube.com/watch?v=abc', goal_id: other.id })
    await deleteResource(row.id)
    await addResource({ url: 'youtube.com/watch?v=abc', goal_id: goal.id })
  })

  it('reject text that is not a link', async () => {
    await expect(addResource({ url: 'ملاحظة' })).rejects.toBeInstanceOf(InvalidUrlError)
  })
})
