import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/core/db/db'
import { BACKUP_TABLES, applyImport, createBackup, previewImport } from '@/core/export/backup'
import { SYNC_TABLES } from '@/core/sync/tables'
import { checkedKeys, listPaths, setChecked } from '@/modules/learning/repo'
import { listActiveRoutines, setHabitStatus } from '@/modules/routines/repo'
import { getSetting, setSetting } from '@/modules/settings/repo'

beforeEach(async () => {
  await db.open()
})

afterEach(async () => {
  await db.delete()
})

describe('backup', () => {
  it('round-trips all data through JSON', async () => {
    const [routine] = await listActiveRoutines()
    await setHabitStatus(routine!.id, '2026-10-06', 'full')
    await setSetting('vision', 'مكان هادي')
    const backup = JSON.parse(JSON.stringify(await createBackup(db)))

    await db.delete()
    await db.open() // fresh database with only seed data (new ids)
    const preview = await previewImport(db, backup)
    expect(preview.counts.habit_logs).toEqual({ added: 1, replaced: 0 })
    await applyImport(db, preview)

    expect(await getSetting('vision')).toBe('مكان هادي')
    expect(await db.habit_logs.count()).toBe(1)
  })

  it('restores study ticks onto the plans a fresh device already has', async () => {
    const [path] = await listPaths()
    await setChecked(path!.id, 'w1:grammar', true, '2026-10-19')
    const backup = JSON.parse(JSON.stringify(await createBackup(db)))

    await db.delete()
    await db.open() // fresh database: the two plans again, with new ids
    await applyImport(db, await previewImport(db, backup))

    const paths = await listPaths()
    expect(paths).toHaveLength(3)
    const same = paths.find((p) => p.curriculum_key === path!.curriculum_key)
    expect(await checkedKeys(same!.id)).toEqual(new Set(['w1:grammar']))
    expect(await db.life_areas.count()).toBe(11)
  })

  it('covers exactly the synced tables', () => {
    expect([...BACKUP_TABLES].sort()).toEqual([...SYNC_TABLES].sort())
  })

  it('previews without changing anything', async () => {
    const backup = await createBackup(db)
    const before = await db.life_areas.count()
    const preview = await previewImport(db, backup)
    expect(preview.counts.life_areas).toEqual({ added: 0, replaced: before })
    expect(await db.life_areas.count()).toBe(before)
  })

  it('rejects files that are not Haya backups', async () => {
    await expect(previewImport(db, { hello: 'world' })).rejects.toThrow()
  })

  it('rejects backups from a newer app version', async () => {
    const backup = { ...(await createBackup(db)), schema_version: db.verno + 1 }
    await expect(previewImport(db, backup)).rejects.toThrow(/newer version/)
  })
})
