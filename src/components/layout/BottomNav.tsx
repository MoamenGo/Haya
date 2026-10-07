import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { NAV_ITEMS } from './nav-items'

/**
 * Phone navigation: large thumb targets at the bottom of the screen.
 * The active item gets a soft "pill" behind its icon. The bar is slightly
 * see-through (backdrop-blur) so content scrolling under it stays readable.
 */
export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t('nav.main')}
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border/70 bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="flex">
        {NAV_ITEMS.filter((item) => item.mobile).map(({ to, labelKey, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className="group flex min-h-16 flex-col items-center justify-center gap-1 text-xs text-muted"
              activeProps={{ className: 'active font-semibold !text-primary' }}
            >
              <span className="flex h-8 w-14 items-center justify-center rounded-full transition-colors group-[.active]:bg-accent">
                <Icon aria-hidden className="size-[1.375rem]" />
              </span>
              {t(labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
