/**
 * The colour palettes the owner can pick in Settings. Each id matches a
 * `[data-palette='…']` block in src/styles/palettes.css ("haya" is the default
 * in src/styles/tokens.css). Names and moods are in i18n under settings.palettes.
 */
export const PALETTES = [
  'haya',
  'nile',
  'sahara',
  'zaytoun',
  'andalus',
  'fajr',
  'layl',
  'ward',
  'hibr',
  'maghrib',
] as const

export type Palette = (typeof PALETTES)[number]

export const DEFAULT_PALETTE: Palette = 'haya'
