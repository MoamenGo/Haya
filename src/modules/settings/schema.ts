import { z } from 'zod'
import { DEFAULT_LOCATION } from '@/core/time/config'
import { DEFAULT_PALETTE, PALETTES } from './palettes'

/**
 * Every setting has a Zod schema and a default. The repo validates on read
 * and write, so a bad value (e.g. from an old version) falls back to the
 * default instead of breaking the app.
 */
export const settingSchemas = {
  language: z.enum(['ar', 'en']),
  /** "glass" = frosted surfaces that follow the device's light / dark (ADR-006). */
  theme: z.enum(['system', 'light', 'dark', 'glass']),
  /** Colour palette, independent of light / dark (see palettes.ts). */
  palette: z.enum(PALETTES),
  vision: z.string().max(500),
  /** Used only on the device to compute prayer times. */
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  /**
   * Turn speech into text while recording a note. Off until the owner opts in,
   * because the browser's speech service (Chrome's) sends the audio to Google.
   */
  voice_transcribe: z.boolean(),
  /** Which phone notifications the Android app shows (ADR-008). */
  notifications: z.object({
    morning: z.boolean(),
    evening: z.boolean(),
    prayers: z.boolean(),
    due: z.boolean(),
  }),
} as const

export type SettingKey = keyof typeof settingSchemas
export type SettingValue<K extends SettingKey> = z.infer<(typeof settingSchemas)[K]>

export const settingDefaults: { [K in SettingKey]: SettingValue<K> } = {
  language: 'ar',
  theme: 'system',
  palette: DEFAULT_PALETTE,
  vision: '',
  location: DEFAULT_LOCATION,
  voice_transcribe: false,
  notifications: { morning: true, evening: true, prayers: true, due: true },
}
