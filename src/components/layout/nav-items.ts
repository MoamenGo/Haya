import {
  FolderKanban,
  House,
  Inbox,
  ListChecks,
  Settings,
  Target,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: '/today' | '/inbox' | '/tasks' | '/projects' | '/goals' | '/settings'
  labelKey: 'nav.today' | 'nav.inbox' | 'nav.tasks' | 'nav.projects' | 'nav.goals' | 'nav.settings'
  icon: LucideIcon
  /** The phone bar holds at most 5 items; the rest stay on the desktop sidebar. */
  mobile: boolean
}

/** Only sections that exist are listed; each phase adds its own (docs/routes.md). */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/today', labelKey: 'nav.today', icon: House, mobile: true },
  { to: '/inbox', labelKey: 'nav.inbox', icon: Inbox, mobile: true },
  { to: '/tasks', labelKey: 'nav.tasks', icon: ListChecks, mobile: true },
  { to: '/projects', labelKey: 'nav.projects', icon: FolderKanban, mobile: true },
  { to: '/goals', labelKey: 'nav.goals', icon: Target, mobile: false },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings, mobile: true },
]
