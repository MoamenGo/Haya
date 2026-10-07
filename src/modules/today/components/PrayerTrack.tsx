import { useTranslation } from 'react-i18next'
import { PRAYER_NAMES, formatTime, type DayPrayers, type PrayerName } from '@/core/time/prayers'
import { prayerTrack } from '@/core/time/sky'
import { cn } from '@/lib/utils'

const PERCENT = 100

interface PrayerTrackProps {
  now: Date
  prayers: DayPrayers
  next: PrayerName
  language: 'ar' | 'en'
}

/**
 * The five prayers on one line, with the day's progress filled in. The line
 * runs from the start side, so it reads right-to-left in Arabic automatically.
 */
export function PrayerTrackLine({ now, prayers, next, language }: PrayerTrackProps) {
  const { t } = useTranslation()
  const { passed, progress } = prayerTrack(now, prayers)

  return (
    <ol className="relative grid grid-cols-5" aria-label={t('today.prayerTimes')}>
      {/* The line sits behind the dots, from the first dot's centre to the last one's. */}
      <span
        aria-hidden
        className="absolute inset-x-[10%] top-[0.4375rem] h-0.5 rounded-full bg-white/20"
      >
        <span
          className="block h-full rounded-full bg-white/80 transition-[width] duration-700"
          style={{ width: `${progress * PERCENT}%` }}
        />
      </span>
      {PRAYER_NAMES.map((name) => {
        const isNext = name === next
        const isPassed = passed.has(name)
        return (
          <li
            key={name}
            className="relative flex flex-col items-center gap-1.5 text-center"
            aria-current={isNext ? 'time' : undefined}
          >
            <span
              aria-hidden
              className={cn(
                'size-4 rounded-full border-2 transition-colors',
                isNext
                  ? 'border-white bg-white ring-4 ring-white/25'
                  : isPassed
                    ? 'border-white/80 bg-white/80'
                    : 'border-white/40 bg-transparent',
              )}
            />
            <span className={cn('text-xs sm:text-sm', isNext ? 'font-semibold' : 'opacity-75')}>
              {t(`prayers.${name}`)}
            </span>
            <span className={cn('text-xs tabular-nums', isNext ? 'opacity-95' : 'opacity-60')}>
              {formatTime(prayers[name], language)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
