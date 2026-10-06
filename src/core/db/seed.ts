import type { Table } from 'dexie'
import { newRowMeta } from './rows'
import type { LifeAreaRow } from './types'

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
