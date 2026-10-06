import { House, Settings, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: '/today' | '/settings'
  labelKey: 'nav.today' | 'nav.settings'
  icon: LucideIcon
}

/** Only sections that exist are listed; each phase adds its own (docs/routes.md). */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/today', labelKey: 'nav.today', icon: House },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
]
