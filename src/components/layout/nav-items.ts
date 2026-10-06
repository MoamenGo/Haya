import { House, Inbox, ListChecks, Settings, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: '/today' | '/inbox' | '/tasks' | '/settings'
  labelKey: 'nav.today' | 'nav.inbox' | 'nav.tasks' | 'nav.settings'
  icon: LucideIcon
}

/** Only sections that exist are listed; each phase adds its own (docs/routes.md). */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/today', labelKey: 'nav.today', icon: House },
  { to: '/inbox', labelKey: 'nav.inbox', icon: Inbox },
  { to: '/tasks', labelKey: 'nav.tasks', icon: ListChecks },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
]
