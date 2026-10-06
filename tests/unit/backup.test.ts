import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/core/db/db'
import { applyImport, createBackup, previewImport } from '@/core/export/backup'
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
