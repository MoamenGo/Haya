import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NAV_ITEMS } from '@/components/layout/nav-items'

/** On the phone, the sections that don't fit in the bottom bar live here. */
export function MorePage() {
  const { t, i18n } = useTranslation()
  const Chevron = i18n.dir() === 'rtl' ? ChevronLeft : ChevronRight
  const items = NAV_ITEMS.filter((item) => !item.mobile && item.to !== '/more')

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold">{t('nav.more')}</h1>
      <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
        {items.map(({ to, labelKey, icon: Icon }) => (
          <li key={to}>
            <Link to={to} className="flex min-h-14 items-center gap-3 px-4 hover:bg-accent">
              <Icon aria-hidden className="size-5 text-muted" />
              <span className="flex-1">{t(labelKey)}</span>
              <Chevron aria-hidden className="size-4 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
