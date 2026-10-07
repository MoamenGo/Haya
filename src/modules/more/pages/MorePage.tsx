import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NAV_ITEMS } from '@/components/layout/nav-items'
import { PageHeader } from '@/components/layout/PageHeader'

/** On the phone, the sections that don't fit in the bottom bar live here. */
export function MorePage() {
  const { t, i18n } = useTranslation()
  const Chevron = i18n.dir() === 'rtl' ? ChevronLeft : ChevronRight
  const items = NAV_ITEMS.filter((item) => !item.mobile && item.to !== '/more')

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t('nav.more')} />
      <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {items.map(({ to, labelKey, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex min-h-16 items-center gap-3 px-4 transition-colors hover:bg-accent"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="flex-1">{t(labelKey)}</span>
              <Chevron aria-hidden className="size-4 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
