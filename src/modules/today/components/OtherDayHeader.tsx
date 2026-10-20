import { useTranslation } from 'react-i18next'
import type { DayType } from '@/core/time/config'
import { instantOfISO } from '@/core/time/date'
import { formatGregorian, formatHijri } from '@/core/time/format'
import { useSetting } from '@/modules/settings/hooks'

interface OtherDayHeaderProps {
  date: string
  dayType: DayType
  note?: string | null
  /** Before today: shown as a look back. After: as a look ahead. */
  past: boolean
}

/**
 * The top of Today when it shows another day. The prayer sky belongs to the
 * present moment, so another day gets a quiet card: its dates and day type.
 */
export function OtherDayHeader({ date, dayType, note, past }: OtherDayHeaderProps) {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const instant = instantOfISO(date)
  return (
    <header className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <p className="text-sm text-muted">{past ? t('dayNav.lookBack') : t('dayNav.lookAhead')}</p>
      <h1 className="text-3xl">{formatGregorian(instant, language)}</h1>
      <p className="text-muted">{formatHijri(instant, language)}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
          {t(`dayTypes.${dayType}`)}
        </span>
        {note && (
          <span dir="auto" className="text-sm text-muted">
            {note}
          </span>
        )}
      </div>
    </header>
  )
}
