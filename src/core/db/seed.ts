import type { Table } from 'dexie'
import { newRowMeta } from './rows'
import type { LifeAreaRow, RoutineRow } from './types'

/** The 11 default life areas from CLAUDE.md §5.1. Editable later in Settings. */
export const DEFAULT_LIFE_AREAS: ReadonlyArray<
  Pick<LifeAreaRow, 'name_ar' | 'name_en' | 'icon' | 'color'>
> = [
  { name_ar: 'العبادة', name_en: 'Deen & Worship', icon: 'moon', color: 'teal' },
  { name_ar: 'القرآن', name_en: "Qur'an", icon: 'book-open', color: 'emerald' },
  { name_ar: 'العلم الشرعي', name_en: 'Islamic Knowledge', icon: 'library', color: 'green' },
  { name_ar: 'الأسرة', name_en: 'Family & Relationships', icon: 'home', color: 'amber' },
  { name_ar: 'الصحة', name_en: 'Health & Recovery', icon: 'heart-pulse', color: 'rose' },
  { name_ar: 'المستشفى والصيدلة', name_en: 'Hospital & Pharmacy', icon: 'pill', color: 'sky' },
  { name_ar: 'التعلم', name_en: 'Learning', icon: 'graduation-cap', color: 'indigo' },
  { name_ar: 'القراءة', name_en: 'Reading', icon: 'book', color: 'violet' },
  { name_ar: 'العمل الحر', name_en: 'Freelancing', icon: 'briefcase', color: 'slate' },
  {
    name_ar: 'المشاريع الناشئة والأفكار',
    name_en: 'Ventures & Ideas',
    icon: 'lightbulb',
    color: 'yellow',
  },
  { name_ar: 'المال', name_en: 'Finance', icon: 'wallet', color: 'stone' },
]

export async function seedLifeAreas(table: Table<LifeAreaRow, string>): Promise<void> {
  const rows: LifeAreaRow[] = DEFAULT_LIFE_AREAS.map((area, index) => ({
    ...newRowMeta(),
    ...area,
    sort_order: index + 1,
    archived: false,
  }))
  await table.bulkAdd(rows)
}

type StarterRoutine = Pick<
  RoutineRow,
  | 'title'
  | 'anchor'
  | 'duration_min'
  | 'full_version'
  | 'minimum_version'
  | 'is_worship'
  | 'commitment_level'
> & { area_name_en: string }

/**
 * The three habits of the 14-day start plan (plan/phase-1-start.md).
 * Each has a hard-day version that counts as a full success.
 */
export const STARTER_ROUTINES: readonly StarterRoutine[] = [
  {
    title: 'مراجعة القرآن',
    area_name_en: "Qur'an",
    anchor: 'after_fajr',
    duration_min: 15,
    full_version: 'ربع حزب مراجعة أو صفحتين',
    minimum_version: 'صفحة واحدة',
    is_worship: true,
    commitment_level: 1,
  },
  {
    title: 'النوم في ميعاده',
    area_name_en: 'Health & Recovery',
    anchor: 'after_isha',
    duration_min: null,
    full_version: 'الموبايل بعيد والنوم في ميعاد ثابت',
    minimum_version: 'الموبايل بعيد 15 دقيقة قبل النوم',
    is_worship: false,
    commitment_level: 1,
  },
  {
    title: 'تركيز على حاجة واحدة',
    area_name_en: 'Learning',
    anchor: 'after_dhuhr',
    duration_min: 25,
    full_version: '25 دقيقة على حاجة واحدة بس، والموبايل بعيد',
    minimum_version: '10 دقايق',
    is_worship: false,
    commitment_level: 2,
  },
]

export async function seedRoutines(
  areas: Table<LifeAreaRow, string>,
  routines: Table<RoutineRow, string>,
): Promise<void> {
  const allAreas = await areas.toArray()
  const areaId = (nameEn: string) => allAreas.find((a) => a.name_en === nameEn)?.id ?? null
  const rows: RoutineRow[] = STARTER_ROUTINES.map(({ area_name_en, ...routine }, index) => ({
    ...newRowMeta(),
    ...routine,
    area_id: areaId(area_name_en),
    rrule: 'FREQ=DAILY',
    active: true,
    sort_order: index + 1,
  }))
  await routines.bulkAdd(rows)
}
