import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/core/db/db'
import { DEFAULT_LIFE_AREAS } from '@/core/db/seed'
import { listActiveAreas } from '@/modules/areas/repo'
import { getSetting, setSetting } from '@/modules/settings/repo'

beforeEach(async () => {
  await db.open()
})

afterEach(async () => {
  // Deleting gives every test a fresh database, so the seed runs again.
  await db.delete()
})

describe('local database', () => {
  it('seeds the default life areas in order on first open', async () => {
    const areas = await listActiveAreas()
    expect(areas.map((a) => a.name_ar)).toEqual(DEFAULT_LIFE_AREAS.map((a) => a.name_ar))
    expect(areas.every((a) => a._dirty === 1 && a.deleted_at === null)).toBe(true)
  })

  it('returns defaults for settings that were never saved', async () => {
    expect(await getSetting('language')).toBe('ar')
    expect(await getSetting('theme')).toBe('system')
  })

  it('saves a setting once and updates it in place', async () => {
    await setSetting('theme', 'dark')
    await setSetting('theme', 'light')
    expect(await getSetting('theme')).toBe('light')
    expect(await db.settings.where('key').equals('theme').count()).toBe(1)
  })

  it('rejects invalid values', async () => {
    // @ts-expect-error: testing a value the type system already forbids
    await expect(setSetting('language', 'fr')).rejects.toThrow()
  })

  it('falls back to the default when a stored value is invalid', async () => {
    await setSetting('language', 'en')
    await db.settings.where('key').equals('language').modify({ value: 'fr' })
    expect(await getSetting('language')).toBe('ar')
  })
})
