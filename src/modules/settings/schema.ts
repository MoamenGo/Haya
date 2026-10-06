import { z } from 'zod'
import { DEFAULT_LOCATION } from '@/core/time/config'

/**
 * Every setting has a Zod schema and a default. The repo validates on read
 * and write, so a bad value (e.g. from an old version) falls back to the
 * default instead of breaking the app.
 */
export const settingSchemas = {
  language: z.enum(['ar', 'en']),
  theme: z.enum(['system', 'light', 'dark']),
  vision: z.string().max(500),
  /** Used only on the device to compute prayer times. */
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
} as const

export type SettingKey = keyof typeof settingSchemas
export type SettingValue<K extends SettingKey> = z.infer<(typeof settingSchemas)[K]>

export const settingDefaults: { [K in SettingKey]: SettingValue<K> } = {
  language: 'ar',
  theme: 'system',
  vision: '',
  location: DEFAULT_LOCATION,
}
