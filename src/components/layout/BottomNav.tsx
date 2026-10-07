import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { NAV_ITEMS } from './nav-items'

/**
 * Phone navigation: a flat bar along the bottom edge with five large thumb
 * targets. The active item turns teal and gets a short line above its icon,
 * so it is marked by shape too, not by colour alone.
 */
export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t('nav.main')}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-lg">
        {NAV_ITEMS.filter((item) => item.mobile).map(({ to, labelKey, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className="group relative flex min-h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] text-muted transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              activeProps={{ className: 'active font-medium !text-primary' }}
            >
              <span
                aria-hidden
                className="absolute top-0 h-0.5 w-8 rounded-full bg-primary opacity-0 transition-opacity group-[.active]:opacity-100"
              />
              <Icon aria-hidden className="size-[1.375rem]" strokeWidth={1.9} />
              {t(labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
