import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { DayType } from '@/core/time/config'
import { localDateISO } from '@/core/time/date'
import { formatGregorian, formatHijri } from '@/core/time/format'
import { formatTime, nextPrayer, prayersForDate } from '@/core/time/prayers'
import { skyPhase } from '@/core/time/sky'
import { cn } from '@/lib/utils'
import { useSetting } from '@/modules/settings/hooks'
import { PrayerArc } from './PrayerArc'

const MS_PER_MINUTE = 60_000
const MINUTES_PER_HOUR = 60

interface PrayerSkyProps {
  now: Date
  dayType: DayType
  note?: string | null
}

/**
 * The top of Today: the date, the day type and the prayers, on a panel whose
 * colour follows the real sky (dawn, morning, noon, afternoon, sunset, night).
 * The prayers sit on the sun's path, and the next one waits under the dome.
 * It is the one rich, colourful element in the app; everything else is quiet.
 */
export function PrayerSky({ now, dayType, note }: PrayerSkyProps) {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const [location] = useSetting('location')
  const prayers = prayersForDate(localDateISO(now), location)
  const next = nextPrayer(now, location)

  const minutesLeft = Math.max(0, Math.ceil((next.at.getTime() - now.getTime()) / MS_PER_MINUTE))
  const h = Math.floor(minutesLeft / MINUTES_PER_HOUR)
  const m = minutesLeft % MINUTES_PER_HOUR
  const left = h > 0 ? t('duration.hm', { h, m }) : t('duration.m', { m })

  return (
    <header
      className={cn(
        'sky',
        `sky-${skyPhase(now, prayers)}`,
        'relative isolate overflow-hidden rounded-3xl px-4 pt-5 pb-6 shadow-float sm:px-8 sm:pt-7 sm:pb-8',
      )}
    >
      {/* The lattice fades out toward the bottom, so it frames the top like a window screen. */}
      <div
        aria-hidden
        className="lattice absolute inset-0 -z-10 opacity-[0.09] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
      />

      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div>
          <h1 className="text-3xl leading-none">{t('today.title')}</h1>
          <p className="mt-2 text-sm opacity-85 sm:text-base">{formatGregorian(now, language)}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs sm:text-sm">
          <span className="rounded-full bg-white/12 px-3 py-1 ring-1 ring-white/15">
            {formatHijri(now, language)}
          </span>
          <Link
            to="/week"
            className="rounded-full bg-white/12 px-3 py-1 ring-1 ring-white/15 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
          >
            <span className="sr-only">{t('today.dayType')}: </span>
            {t(`dayTypes.${dayType}`)}
            {note && <span dir="auto"> ({note})</span>}
          </Link>
        </div>
      </div>

      <div className="mt-8 pb-8 sm:mt-6">
        <PrayerArc now={now} prayers={prayers} next={next.name} language={language}>
          <p className="text-xs opacity-80 sm:text-sm">{t('today.nextPrayer')}</p>
          <p className="font-display text-3xl leading-tight font-semibold sm:text-4xl">
            {t(`prayers.${next.name}`)}
          </p>
          <p className="mt-1 flex flex-wrap items-baseline justify-center gap-x-2 text-sm">
            <span className="font-display tabular-nums">{formatTime(next.at, language)}</span>
            <span className="opacity-75">{t('today.in', { time: left })}</span>
          </p>
        </PrayerArc>
      </div>
    </header>
  )
}
