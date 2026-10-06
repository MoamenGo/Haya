import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { NAV_ITEMS } from './nav-items'

/** Phone navigation: large thumb targets at the bottom of the screen. */
export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t('nav.main')}
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex">
        {NAV_ITEMS.filter((item) => item.mobile).map(({ to, labelKey, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className="flex min-h-14 flex-col items-center justify-center gap-1 text-xs text-muted"
              activeProps={{ className: 'font-medium !text-primary' }}
            >
              <Icon aria-hidden className="size-6" />
              {t(labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
