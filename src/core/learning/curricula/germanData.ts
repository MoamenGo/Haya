import type { Link } from '../types'

/**
 * The German plan follows Piece of German (pieceofgerman.com, by Ahmed Essam):
 * a free, day-by-day path for Arabic speakers, 1–3 hours per site day.
 *
 * Only the site's *structure* is kept here (levels, units, how many study days
 * each unit has), read on 2026-10-21. Each step in Khatwa says which site day
 * to do and links to that unit's page, where the day's tasks, videos and PDFs
 * live. The content stays on the site, credited to its author.
 *
 * At that date A1 and A2 were complete; B1 had 3 of 16 weeks, B2 2 of 11
 * lessons, C1 2 of 18 lessons. When the site adds units, add them at the end of
 * their level here: session keys are per unit and day, so ticks never move.
 */

export const PIECE_OF_GERMAN = {
  home: 'https://www.pieceofgerman.com/',
  roadmap: 'https://www.pieceofgerman.com/roadmap',
} as const

export type GermanLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export interface GermanUnit {
  level: GermanLevel
  /** Part of the session key and of the address: `w3`, `l1`, `exam`. */
  slug: string
  /** As shown in Khatwa, e.g. «الأسبوع 3». */
  name: string
  url: string
  /** The unit's sessions in the site's order. */
  sessions: readonly GermanSessionSpec[]
}

export interface GermanSessionSpec {
  /** Stable inside the unit: `d1`…`d11`, `extra`, `review`, `s1`. Never change it. */
  id: string
  /** As shown in Khatwa, e.g. «اليوم 3». */
  label: string
}

export interface GermanLevelInfo {
  level: GermanLevel
  title: string
  /** True while the site is still adding units to this level. */
  inProgress: boolean
}

export const GERMAN_LEVELS: readonly GermanLevelInfo[] = [
  { level: 'A1', title: 'من الأصوات لأول محادثة', inProgress: false },
  { level: 'A2', title: 'الألمانية في مواقف الحياة اليومية', inProgress: false },
  { level: 'B1', title: 'طلاقة مستقلة', inProgress: true },
  { level: 'B2', title: 'Aspekte وإعلام حقيقي', inProgress: true },
  { level: 'C1', title: 'مواد معقدة وطلاقة مهنية', inProgress: true },
]

const days = (count: number): GermanSessionSpec[] =>
  Array.from({ length: count }, (_, i) => ({ id: `d${i + 1}`, label: `اليوم ${i + 1}` }))

const base = 'https://www.pieceofgerman.com'

function weeks(level: GermanLevel, count: number, daysPerWeek = 7): GermanUnit[] {
  const path = level.toLowerCase()
  return Array.from({ length: count }, (_, i) => ({
    level,
    slug: `w${i + 1}`,
    name: `الأسبوع ${i + 1}`,
    url: `${base}/${path}/week-${i + 1}`,
    sessions: days(daysPerWeek),
  }))
}

function lesson(level: GermanLevel, n: number, dayCount: number): GermanUnit {
  return {
    level,
    slug: `l${n}`,
    name: `الدرس ${n}`,
    url: `${base}/${level.toLowerCase()}/lesson-${n}`,
    sessions: days(dayCount),
  }
}

/** Every unit in the site's order. A1 = 80 study days, A2 = 78, B1, B2 and C1 = 21 each. */
export const GERMAN_UNITS: readonly GermanUnit[] = [
  // A1 week 1 has an extra pronunciation session between days 4 and 5.
  {
    level: 'A1',
    slug: 'w1',
    name: 'الأسبوع 1',
    url: `${base}/a1/week-1`,
    sessions: [...days(4), { id: 'extra', label: 'جلسة نطق إضافية' }, ...days(7).slice(4)],
  },
  ...weeks('A1', 11).slice(1),
  { level: 'A1', slug: 'w12', name: 'الأسبوع 12', url: `${base}/a1/week-12`, sessions: days(3) },
  {
    level: 'A1',
    slug: 'exam',
    name: 'أسبوع الامتحان',
    url: `${base}/a1/exam-week`,
    sessions: [
      { id: 's1', label: 'تدريب الاستماع والتحدث' },
      { id: 's2', label: 'تدريب امتحان Goethe' },
    ],
  },
  ...weeks('A2', 11),
  {
    level: 'A2',
    slug: 'w12',
    name: 'الأسبوع 12',
    url: `${base}/a2/week-12`,
    sessions: [...days(1), { id: 'review', label: 'مراجعة A2' }],
  },
  ...weeks('B1', 3),
  lesson('B2', 1, 11),
  lesson('B2', 2, 10),
  lesson('C1', 1, 11),
  lesson('C1', 2, 10),
]

export const GERMAN_ROADMAP_LINK: Link = {
  title: 'خريطة Piece of German',
  url: PIECE_OF_GERMAN.roadmap,
}
