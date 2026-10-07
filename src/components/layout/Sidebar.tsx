import { Link } from '@tanstack/react-router'
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { BrandLockup } from './BrandMark'
import { NAV_ITEMS, type NavItem } from './nav-items'

const GROUPS = ['plan', 'grow', 'reflect'] as const

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

/**
 * Desktop and tablet navigation (hidden on phones). It can shrink to icons
 * only; then each icon shows its name in a tooltip on hover or keyboard focus.
 * It sits at the start edge, so it moves to the right in Arabic by itself.
 */
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { t, i18n } = useTranslation()
  const rtl = i18n.dir() === 'rtl'
  // The "close" arrow points toward the edge the sidebar folds into.
  const ToggleIcon = collapsed
    ? rtl
      ? PanelRightOpen
      : PanelLeftOpen
    : rtl
      ? PanelRightClose
      : PanelLeftClose
  const items = NAV_ITEMS.filter((item) => item.desktop)

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col border-e border-border bg-surface transition-[width] duration-200 md:flex',
        collapsed ? 'w-[4.25rem]' : 'w-60',
      )}
    >
      <div className={cn('flex h-14 items-center', collapsed ? 'justify-center' : 'px-4')}>
        <Link
          to="/today"
          aria-label={t('app.name')}
          className="rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
        >
          <BrandLockup collapsed={collapsed} />
        </Link>
      </div>

      <nav
        aria-label={t('nav.main')}
        className="flex flex-1 flex-col gap-5 overflow-y-auto px-2.5 py-3"
      >
        {GROUPS.map((group) => (
          <div key={group} className="flex flex-col gap-0.5">
            {!collapsed && (
              <p className="px-2.5 pb-1 text-xs font-medium text-muted">
                {t(`nav.groups.${group}`)}
              </p>
            )}
            {items
              .filter((item) => item.group === group)
              .map((item) => (
                <SidebarLink key={item.to} item={item} collapsed={collapsed} />
              ))}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-0.5 border-t border-border px-2.5 py-3">
        {items
          .filter((item) => item.group === 'app')
          .map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
          className={cn(navRow, 'text-muted', collapsed && 'justify-center px-0')}
        >
          <ToggleIcon aria-hidden className="size-[1.125rem] shrink-0" />
          {!collapsed && <span>{t('nav.collapse')}</span>}
        </button>
      </div>
    </aside>
  )
}

const navRow =
  'group relative flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors duration-150 hover:bg-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring'

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { t } = useTranslation()
  const { to, labelKey, icon: Icon } = item
  const label = t(labelKey)
  return (
    <Link
      to={to}
      aria-label={collapsed ? label : undefined}
      className={cn(navRow, 'text-muted', collapsed && 'justify-center px-0')}
      activeProps={{ className: 'bg-accent !text-accent-foreground font-medium' }}
    >
      <Icon aria-hidden className="size-[1.125rem] shrink-0" strokeWidth={1.9} />
      {collapsed ? (
        // Tooltip: shown on hover and keyboard focus; the link itself carries aria-label.
        <span
          aria-hidden
          className="pointer-events-none absolute start-full z-30 ms-2 rounded-md bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background opacity-0 shadow-float transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {label}
        </span>
      ) : (
        <span className="truncate">{label}</span>
      )}
    </Link>
  )
}
