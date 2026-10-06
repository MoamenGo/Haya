import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/core/db/db'
import { capture, convertToTask, discardItem, listInbox, processAsTask } from '@/modules/inbox/repo'
import {
  BigRockLimitError,
  countBigRocks,
  createTask,
  deleteTask,
  openTasksExcept,
  scheduleTask,
  setBigRock,
  setTaskDone,
  tasksForDate,
} from '@/modules/tasks/repo'

const TODAY = '2026-10-06'
const TOMORROW = '2026-10-07'

beforeEach(async () => {
  await db.open()
})

afterEach(async () => {
  await db.delete()
})

describe('tasks', () => {
  it('creates scheduled or undated tasks with the right status', async () => {
    const dated = await createTask({ title: 'أذاكر درس 3', scheduled_date: TODAY })
    const undated = await createTask({ title: 'أقرا مقال' })
    expect(dated.status).toBe('scheduled')
    expect(undated.status).toBe('next')
    expect((await tasksForDate(TODAY)).map((t) => t.title)).toEqual(['أذاكر درس 3'])
    expect((await openTasksExcept(TODAY)).map((t) => t.title)).toEqual(['أقرا مقال'])
  })

  it('rejects empty titles', async () => {
    await expect(createTask({ title: '   ' })).rejects.toThrow()
  })

  it('allows at most 3 Big Rocks per day', async () => {
    for (const title of ['1', '2', '3']) {
      await createTask({ title, scheduled_date: TODAY, is_big_rock: true })
    }
    await expect(
      createTask({ title: '4', scheduled_date: TODAY, is_big_rock: true }),
    ).rejects.toBeInstanceOf(BigRockLimitError)
    const extra = await createTask({ title: '4' })
    await expect(setBigRock(extra, TODAY, true)).rejects.toBeInstanceOf(BigRockLimitError)
    expect(await countBigRocks(TODAY)).toBe(3)
  })

  it('making a Big Rock schedules the task for that day', async () => {
    const task = await createTask({ title: 'مهمة' })
    await setBigRock(task, TODAY, true)
    const [saved] = await tasksForDate(TODAY)
    expect(saved).toMatchObject({ is_big_rock: true, status: 'scheduled' })
  })

  it('moving a Big Rock to a full day drops the star, not the task', async () => {
    for (const title of ['1', '2', '3']) {
      await createTask({ title, scheduled_date: TOMORROW, is_big_rock: true })
    }
    const rock = await createTask({ title: 'rock', scheduled_date: TODAY, is_big_rock: true })
    await scheduleTask(rock, TOMORROW)
    const moved = (await tasksForDate(TOMORROW)).find((t) => t.title === 'rock')
    expect(moved?.is_big_rock).toBe(false)
  })

  it('completes, reopens and soft-deletes', async () => {
    const task = await createTask({ title: 'مهمة', scheduled_date: TODAY })
    await setTaskDone(task, true)
    expect((await db.tasks.get(task.id))?.completed_at).not.toBeNull()
    await setTaskDone({ ...task, status: 'done' }, false)
    expect((await db.tasks.get(task.id))?.status).toBe('scheduled')
    await deleteTask(task.id)
    expect(await tasksForDate(TODAY)).toEqual([])
    expect(await db.tasks.count()).toBe(1)
  })
})

describe('inbox', () => {
  it('captures text and ignores blanks', async () => {
    expect(await capture('   ')).toBeNull()
    await capture('!فكرة #مشروع')
    const [item] = await listInbox()
    expect(item).toMatchObject({ text: '!فكرة #مشروع', is_important: true, tags: ['مشروع'] })
  })

  it('converts an item into a task and removes it from the inbox', async () => {
    const item = (await capture('أكلم الدكتور'))!
    await convertToTask(item, { title: item.text, scheduled_date: TODAY })
    expect(await listInbox()).toEqual([])
    const [task] = await tasksForDate(TODAY)
    expect(task?.title).toBe('أكلم الدكتور')
    expect((await db.inbox_items.get(item.id))?.converted_id).toBe(task?.id)
  })

  it('one-tap processing strips ! and keeps it as priority', async () => {
    const item = (await capture('!أدفع الفاتورة'))!
    await processAsTask(item, null)
    const [task] = await db.tasks.toArray()
    expect(task).toMatchObject({ title: 'أدفع الفاتورة', priority: 'important', status: 'next' })
  })

  it('discards an item', async () => {
    const item = (await capture('مش مهمة'))!
    await discardItem(item.id)
    expect(await listInbox()).toEqual([])
  })
})
