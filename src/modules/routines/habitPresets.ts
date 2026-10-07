import type { NewRoutineInput } from './schema'

/**
 * Ready-made habits the owner can add with one tap on the Habits page.
 * Each has a small hard-day version, so a busy day never breaks continuity.
 */
export const HABIT_PRESETS: readonly NewRoutineInput[] = [
  {
    title: 'أذكار الصباح',
    anchor: 'after_fajr',
    full_version: 'الأذكار كاملة',
    minimum_version: 'آية الكرسي والمعوذات',
    is_worship: true,
  },
  {
    title: 'أذكار المساء',
    anchor: 'after_asr',
    full_version: 'الأذكار كاملة',
    minimum_version: 'آية الكرسي والمعوذات',
    is_worship: true,
  },
  {
    title: 'الوتر',
    anchor: 'after_isha',
    full_version: '3 ركعات أو أكتر',
    minimum_version: 'ركعة واحدة',
    is_worship: true,
  },
  {
    title: 'ورد القرآن (تلاوة)',
    anchor: 'maghrib_isha',
    full_version: 'جزء',
    minimum_version: 'صفحة واحدة',
    is_worship: true,
  },
  {
    title: 'قراءة',
    anchor: 'after_isha',
    full_version: '20 صفحة',
    minimum_version: 'صفحتين',
    is_worship: false,
  },
  {
    title: 'مشي',
    anchor: 'after_asr',
    full_version: '30 دقيقة',
    minimum_version: '10 دقايق',
    is_worship: false,
  },
  {
    title: 'شرب مية كفاية',
    anchor: 'duha',
    full_version: '8 كوبايات',
    minimum_version: '4 كوبايات',
    is_worship: false,
  },
  {
    title: 'مكالمة لحد من العيلة',
    anchor: 'maghrib_isha',
    full_version: 'مكالمة حقيقية',
    minimum_version: 'رسالة سلام',
    is_worship: false,
  },
  {
    title: 'كروت الصيدلة',
    anchor: 'after_dhuhr',
    full_version: '20 كارت',
    minimum_version: '5 كروت',
    is_worship: false,
  },
  {
    title: 'تخطيط بكرة',
    anchor: 'after_isha',
    full_version: 'أهم 3 حاجات بكرة',
    minimum_version: 'أهم حاجة واحدة',
    is_worship: false,
  },
]
