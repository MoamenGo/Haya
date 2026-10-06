import { useLiveQuery } from 'dexie-react-hooks'
import { getSetting, setSetting } from './repo'
import { settingDefaults, type SettingKey, type SettingValue } from './schema'

/**
 * Reads a setting and re-renders whenever it changes (in this tab or another).
 * Returns the default while the database is still opening.
 */
export function useSetting<K extends SettingKey>(
  key: K,
): [SettingValue<K>, (value: SettingValue<K>) => Promise<void>] {
  const value = useLiveQuery(() => getSetting(key), [key])
  return [value ?? settingDefaults[key], (next) => setSetting(key, next)]
}
