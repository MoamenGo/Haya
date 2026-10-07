import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { DayType } from '@/core/time/config'
import { localDateISO } from '@/core/time/date'
import { formatGregorian, formatHijri } from '@/core/time/format'
import { formatTime, nextPrayer, prayersForDate } from '@/core/time/prayers'
import { skyPhase } from '@/core/time/sky'
import { cn } from '@/lib/utils'
import { SyncIndicator } from '@/modules/account/components/SyncIndicator'
import { useSetting } from '@/modules/settings/hooks'
import { PrayerTrackLine } from './PrayerTrack'

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
        'relative overflow-hidden rounded-3xl p-5 shadow-float sm:p-8',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl leading-none">{t('today.title')}</h1>
          <p className="mt-1 opacity-85">{formatGregorian(now, language)}</p>
        </div>
        {/* On desktop the sidebar shows it. */}
        <SyncIndicator className="text-current opacity-90 hover:bg-white/10 md:hidden" />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-white/12 px-3 py-1">{formatHijri(now, language)}</span>
        <Link
          to="/week"
          className="rounded-full bg-white/12 px-3 py-1 underline-offset-4 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
        >
          <span className="sr-only">{t('today.dayType')}: </span>
          {t(`dayTypes.${dayType}`)}
          {note && <span dir="auto"> ({note})</span>}
        </Link>
      </div>

      <p className="mt-7 text-sm opacity-80">{t('today.nextPrayer')}</p>
      <p className="flex flex-wrap items-baseline gap-x-3">
        <span className="font-display text-4xl font-bold">{t(`prayers.${next.name}`)}</span>
        <span className="font-display text-2xl tabular-nums opacity-90">
          {formatTime(next.at, language)}
        </span>
        <span className="text-sm opacity-80">{t('today.in', { time: left })}</span>
      </p>

      <div className="mt-6">
        <PrayerTrackLine now={now} prayers={prayers} next={next.name} language={language} />
      </div>
    </header>
  )
}
