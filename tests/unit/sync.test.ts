import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { HayaDB } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { DailyLogRow, HabitLogRow, TaskRow } from '@/core/db/types'
import { BACKUP_TABLES } from '@/core/export/backup'
import { syncOnce } from '@/core/sync/engine'
import type { SyncRemote } from '@/core/sync/remote'
import { startSyncScheduler, type SyncContext } from '@/core/sync/scheduler'
import { getSyncStatus, resetSyncStatus } from '@/core/sync/status'
import { SYNC_TABLES } from '@/core/sync/tables'
import { FakeRemote } from '../helpers/fakeRemote'

const USER = '00000000-0000-7000-8000-0000000000aa'

let phone: HayaDB
let desktop: HayaDB
let cloud: FakeRemote

beforeEach(async () => {
  // Two devices, each with its own local database, sharing one cloud.
  phone = new HayaDB('phone')
  desktop = new HayaDB('desktop')
  await Promise.all([phone.open(), desktop.open()])
  cloud = new FakeRemote()
})

afterEach(async () => {
  await Promise.all([phone.delete(), desktop.delete()])
})

function newTask(title: string, at = new Date('2026-10-06T09:00:00Z')): TaskRow {
  return {
    ...newRowMeta(at),
    area_id: null,
    project_id: null,
    goal_id: null,
    title,
    notes: '',
    checklist: [],
    status: 'next',
    priority: 'normal',
    commitment_level: 2,
    energy: 'medium',
    est_minutes: null,
    actual_minutes: null,
    due_date: null,
    scheduled_date: null,
    prayer_block: null,
    is_big_rock: false,
    rrule: null,
    completed_at: null,
  }
}

function newDailyLog(gratitude: string, at: Date): DailyLogRow {
  return {
    ...newRowMeta(at),
    date: '2026-10-06',
    energy: 3,
    sleep_hours: null,
    gratitude,
    tomorrow_top3: [],
  }
}

describe('sync engine', () => {
  it('syncs every table that is backed up', () => {
    expect([...SYNC_TABLES].sort()).toEqual([...BACKUP_TABLES].sort())
  })

  it('uploads changed rows once, marks them clean and stamps the owner', async () => {
    await phone.tasks.add(newTask('أذاكر درس 3'))
    const first = await syncOnce(phone, cloud, USER)
    expect(first.pushed).toBeGreaterThan(0)
    const [uploaded] = cloud.rows('tasks')
    expect(uploaded).toMatchObject({ title: 'أذاكر درس 3', user_id: USER })
    expect(uploaded).not.toHaveProperty('_dirty')

    const local = await phone.tasks.toArray()
    expect(local.every((t) => t._dirty === 0 && t.user_id === USER)).toBe(true)
    expect((await syncOnce(phone, cloud, USER)).pushed).toBe(0)
  })

  it('carries a change from the phone to the desktop and back', async () => {
    const task = newTask('أكلم الدكتور')
    await phone.tasks.add(task)
    await syncOnce(phone, cloud, USER)
    await syncOnce(desktop, cloud, USER)
    const onDesktop = await desktop.tasks.get(task.id)
    expect(onDesktop?.title).toBe('أكلم الدكتور')
    // Cloud timestamps come back in the app's own format.
    expect(onDesktop?.created_at).toBe(task.created_at)

    await desktop.tasks.update(task.id, { status: 'done', ...touchMeta() })
    await syncOnce(desktop, cloud, USER)
    await syncOnce(phone, cloud, USER)
    expect((await phone.tasks.get(task.id))?.status).toBe('done')
  })

  it('syncs deletes as tombstones', async () => {
    const task = newTask('هتتمسح')
    await phone.tasks.add(task)
    await syncOnce(phone, cloud, USER)
    await syncOnce(desktop, cloud, USER)
    await phone.tasks.update(task.id, { deleted_at: new Date().toISOString(), ...touchMeta() })
    await syncOnce(phone, cloud, USER)
    await syncOnce(desktop, cloud, USER)
    expect((await desktop.tasks.get(task.id))?.deleted_at).not.toBeNull()
  })

  it("merges each device's starter areas and routines instead of duplicating them", async () => {
    // The desktop logged a habit before it ever synced, against its own starter routine.
    const [desktopRoutine] = await desktop.routines.orderBy('sort_order').toArray()
    const log: HabitLogRow = {
      ...newRowMeta(),
      routine_id: desktopRoutine!.id,
      date: '2026-10-06',
      status: 'full',
    }
    await desktop.habit_logs.add(log)

    await syncOnce(phone, cloud, USER)
    await syncOnce(desktop, cloud, USER)

    expect(cloud.rows('life_areas')).toHaveLength(11)
    expect(cloud.rows('routines')).toHaveLength(3)
    const phoneAreaIds = (await phone.life_areas.toArray()).map((a) => a.id).sort()
    const desktopAreaIds = (await desktop.life_areas.toArray()).map((a) => a.id).sort()
    expect(desktopAreaIds).toEqual(phoneAreaIds)

    // The habit log now points at the shared routine, and it reached the cloud.
    const [phoneRoutine] = await phone.routines.orderBy('sort_order').toArray()
    expect((await desktop.habit_logs.get(log.id))?.routine_id).toBe(phoneRoutine!.id)
    expect(cloud.rows('habit_logs')[0]).toMatchObject({ routine_id: phoneRoutine!.id })
  })

  it('merges two check-ins for the same evening, keeping the newer one', async () => {
    await phone.daily_logs.add(newDailyLog('من الموبايل', new Date('2026-10-06T19:00:00Z')))
    await desktop.daily_logs.add(newDailyLog('من الكمبيوتر', new Date('2026-10-06T20:00:00Z')))

    await syncOnce(phone, cloud, USER)
    await syncOnce(desktop, cloud, USER)
    await syncOnce(phone, cloud, USER)

    expect(cloud.rows('daily_logs')).toHaveLength(1)
    expect(cloud.rows('daily_logs')[0]).toMatchObject({ gratitude: 'من الكمبيوتر' })
    const [onPhone] = await phone.daily_logs.toArray()
    expect(onPhone?.gratitude).toBe('من الكمبيوتر')
    expect(await desktop.sync_conflicts.count()).toBe(1)
  })

  it('resolves an edit on both devices by the newer change, and logs it', async () => {
    const task = newTask('العنوان الأصلي')
    await phone.tasks.add(task)
    await syncOnce(phone, cloud, USER)
    await syncOnce(desktop, cloud, USER)

    await phone.tasks.update(task.id, {
      title: 'من الموبايل (أقدم)',
      ...touchMeta(new Date('2026-10-06T10:00:00Z')),
    })
    await desktop.tasks.update(task.id, {
      title: 'من الكمبيوتر (أحدث)',
      ...touchMeta(new Date('2026-10-06T11:00:00Z')),
    })
    await syncOnce(desktop, cloud, USER)
    const result = await syncOnce(phone, cloud, USER)

    expect(result.conflicts).toBe(1)
    expect((await phone.tasks.get(task.id))?.title).toBe('من الكمبيوتر (أحدث)')
    expect((await phone.sync_conflicts.toArray())[0]).toMatchObject({ kept: 'remote' })
  })

  it('keeps an edit made while the upload was in flight', async () => {
    const task = newTask('قبل')
    await phone.tasks.add(task)
    cloud.beforePush = async (table) => {
      if (table === 'tasks') {
        await phone.tasks.update(task.id, { title: 'بعد', ...touchMeta(new Date(Date.now() + 1)) })
      }
    }
    await syncOnce(phone, cloud, USER)
    expect((await phone.tasks.get(task.id))?._dirty).toBe(1)

    cloud.beforePush = undefined
    await syncOnce(phone, cloud, USER)
    expect(cloud.rows('tasks')[0]).toMatchObject({ title: 'بعد' })
  })

  it('pulls in pages and only what changed since the last pull', async () => {
    await phone.tasks.bulkAdd(Array.from({ length: 600 }, (_, i) => newTask(`مهمة ${i}`)))
    await syncOnce(phone, cloud, USER)
    const first = await syncOnce(desktop, cloud, USER)
    expect(await desktop.tasks.count()).toBe(600)
    expect(first.pulled).toBeGreaterThanOrEqual(600)

    const again = await syncOnce(desktop, cloud, USER)
    // Only the overlap window is re-read; nothing new is written.
    expect(again.pushed).toBe(0)
    expect(await desktop.tasks.where('_dirty').equals(1).count()).toBe(0)
  }, 30_000) // fake-indexeddb is slow with hundreds of rows
})

describe('sync scheduler', () => {
  afterEach(() => {
    resetSyncStatus()
  })

  it('reports signed out, offline, then synced', async () => {
    let context: SyncContext | null = null
    let online = false
    const scheduler = startSyncScheduler({
      db: phone,
      getContext: async () => context,
      isOnline: () => online,
    })
    await scheduler.syncNow()
    expect(getSyncStatus().phase).toBe('signed_out')

    context = { remote: cloud, userId: USER }
    await scheduler.syncNow()
    expect(getSyncStatus().phase).toBe('offline')

    online = true
    await scheduler.syncNow()
    expect(getSyncStatus()).toMatchObject({ phase: 'synced', error: null })
    expect(cloud.rows('life_areas')).toHaveLength(11)
    scheduler.stop()
  })

  it('shows the error and recovers on the next run', async () => {
    let fail = true
    const flaky: SyncRemote = {
      push: (table, rows) =>
        fail ? Promise.reject(new Error('network down')) : cloud.push(table, rows),
      pull: (table, since, limit) => cloud.pull(table, since, limit),
    }
    const scheduler = startSyncScheduler({
      db: phone,
      getContext: async () => ({ remote: flaky, userId: USER }),
      isOnline: () => true,
    })
    await scheduler.syncNow()
    expect(getSyncStatus()).toMatchObject({ phase: 'error', error: 'network down' })
    fail = false
    await scheduler.syncNow()
    expect(getSyncStatus().phase).toBe('synced')
    scheduler.stop()
  })
})

describe('sync overlap', () => {
  it('does not report a conflict when the overlap re-reads a version already applied', async () => {
    const task = newTask('أول نسخة')
    await phone.tasks.add(task)
    await syncOnce(phone, cloud, USER)
    await syncOnce(desktop, cloud, USER)
    // Edited on the desktop within the overlap window of the version it pulled.
    await desktop.tasks.update(task.id, { title: 'تعديل', ...touchMeta() })
    const result = await syncOnce(desktop, cloud, USER)
    expect(result.conflicts).toBe(0)
    expect(await desktop.sync_conflicts.count()).toBe(0)
    expect(cloud.rows('tasks')[0]).toMatchObject({ title: 'تعديل' })
  })
})
