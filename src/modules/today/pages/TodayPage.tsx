import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { defaultDayType } from '@/core/time/dayType'
import { formatGregorian, formatHijri } from '@/core/time/format'
import { useSetting } from '@/modules/settings/hooks'

export function TodayPage() {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const [vision] = useSetting('vision')
  const now = new Date()
  const dayType = defaultDayType(now)

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold">{t('today.title')}</h1>
        <p className="mt-1 text-muted">{formatGregorian(now, language)}</p>
        <p className="text-sm text-muted">
          {formatHijri(now, language)}
          <span aria-hidden> · </span>
          <span className="sr-only">{t('today.dayType')}: </span>
          {t(`dayTypes.${dayType}`)}
        </p>
      </header>

      {vision && (
        <blockquote dir="auto" className="border-s-4 border-primary ps-4 text-lg leading-relaxed">
          {vision}
        </blockquote>
      )}

      <Card>
        <h2 className="font-medium">{t('today.emptyTitle')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t('today.emptyBody')}</p>
        {!vision && (
          <Link
            to="/settings"
            hash="vision"
            className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            {t('today.emptyAction')}
          </Link>
        )}
      </Card>
    </div>
  )
}
