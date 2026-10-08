import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { NAV_ITEMS } from './nav-items'

/**
 * Phone navigation: a floating dock above the bottom edge with five large
 * thumb targets. The active item gets a soft pill behind its icon, so it is
 * marked by shape too, not by colour alone.
 */
export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t('nav.main')}
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 rounded-[1.75rem] border border-border bg-surface/85 shadow-float backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto flex max-w-lg px-1">
        {NAV_ITEMS.filter((item) => item.mobile).map(({ to, labelKey, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className="group flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-3xl text-[0.6875rem] text-muted transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              activeProps={{ className: 'active font-medium !text-accent-foreground' }}
            >
              <span className="flex h-8 w-14 items-center justify-center rounded-full transition-colors group-[.active]:bg-accent">
                <Icon aria-hidden className="size-[1.375rem]" strokeWidth={1.9} />
              </span>
              {t(labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
