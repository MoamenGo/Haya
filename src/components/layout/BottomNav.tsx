import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { NAV_ITEMS } from './nav-items'

/**
 * Phone navigation: a floating "dock" with large thumb targets, lifted off
 * the screen edges. The active item gets a filled pill behind its icon.
 * The dock is slightly see-through (backdrop-blur) so content under it stays readable.
 */
export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t('nav.main')}
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-10 rounded-full border border-border bg-surface/85 shadow-float backdrop-blur-lg md:hidden"
    >
      <ul className="flex px-1">
        {NAV_ITEMS.filter((item) => item.mobile).map(({ to, labelKey, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className="group flex min-h-16 flex-col items-center justify-center gap-0.5 text-[0.6875rem] text-muted"
              activeProps={{ className: 'active font-medium !text-foreground' }}
            >
              <span className="flex h-8 w-12 items-center justify-center rounded-full transition-colors group-[.active]:bg-foreground group-[.active]:text-background">
                <Icon aria-hidden className="size-5" />
              </span>
              {t(labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
