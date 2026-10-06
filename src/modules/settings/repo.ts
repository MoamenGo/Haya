import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import { settingDefaults, settingSchemas, type SettingKey, type SettingValue } from './schema'

/** The only code that reads or writes the `settings` table. */

export async function getSetting<K extends SettingKey>(key: K): Promise<SettingValue<K>> {
  const row = await db.settings.where('key').equals(key).first()
  if (!row || row.deleted_at) return settingDefaults[key]
  const parsed = settingSchemas[key].safeParse(row.value)
  return parsed.success ? (parsed.data as SettingValue<K>) : settingDefaults[key]
}

export async function setSetting<K extends SettingKey>(
  key: K,
  value: SettingValue<K>,
): Promise<void> {
  const valid = settingSchemas[key].parse(value)
  // A transaction makes "read, then insert or update" atomic.
  await db.transaction('rw', db.settings, async () => {
    const existing = await db.settings.where('key').equals(key).first()
    if (existing) {
      await db.settings.update(existing.id, { value: valid, deleted_at: null, ...touchMeta() })
    } else {
      await db.settings.add({ ...newRowMeta(), key, value: valid })
    }
  })
}
