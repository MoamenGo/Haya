import { useTranslation } from 'react-i18next'
import { formatTime, nextPrayer } from '@/core/time/prayers'
import { useSetting } from '@/modules/settings/hooks'

const MS_PER_MINUTE = 60_000
const MINUTES_PER_HOUR = 60

export function NextPrayer({ now }: { now: Date }) {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const [location] = useSetting('location')
  const next = nextPrayer(now, location)

  const minutesLeft = Math.max(0, Math.ceil((next.at.getTime() - now.getTime()) / MS_PER_MINUTE))
  const h = Math.floor(minutesLeft / MINUTES_PER_HOUR)
  const m = minutesLeft % MINUTES_PER_HOUR
  const left = h > 0 ? t('duration.hm', { h, m }) : t('duration.m', { m })

  return (
    <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
      <span className="text-muted">{t('today.nextPrayer')}:</span>
      <span className="font-medium">
        {t(`prayers.${next.name}`)} {formatTime(next.at, language)}
      </span>
      <span className="text-muted">({t('today.in', { time: left })})</span>
    </p>
  )
}
