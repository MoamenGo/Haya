import {
  CalendarDays,
  ClipboardCheck,
  Ellipsis,
  FolderKanban,
  House,
  Inbox,
  Repeat,
  ListChecks,
  Settings,
  Target,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to:
    | '/today'
    | '/week'
    | '/inbox'
    | '/tasks'
    | '/projects'
    | '/goals'
    | '/habits'
    | '/reviews/weekly'
    | '/settings'
    | '/more'
  labelKey:
    | 'nav.today'
    | 'nav.week'
    | 'nav.inbox'
    | 'nav.tasks'
    | 'nav.projects'
    | 'nav.goals'
    | 'nav.habits'
    | 'nav.weeklyReview'
    | 'nav.settings'
    | 'nav.more'
  icon: LucideIcon
  /** The phone bar holds at most 5 items; the rest are listed on the "More" screen. */
  mobile: boolean
  /** "More" exists only for the phone; the desktop sidebar lists everything. */
  desktop: boolean
}

/** Only sections that exist are listed; each phase adds its own (docs/routes.md). */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/today', labelKey: 'nav.today', icon: House, mobile: true, desktop: true },
  { to: '/week', labelKey: 'nav.week', icon: CalendarDays, mobile: true, desktop: true },
  { to: '/inbox', labelKey: 'nav.inbox', icon: Inbox, mobile: true, desktop: true },
  { to: '/tasks', labelKey: 'nav.tasks', icon: ListChecks, mobile: true, desktop: true },
  { to: '/projects', labelKey: 'nav.projects', icon: FolderKanban, mobile: false, desktop: true },
  { to: '/goals', labelKey: 'nav.goals', icon: Target, mobile: false, desktop: true },
  { to: '/habits', labelKey: 'nav.habits', icon: Repeat, mobile: false, desktop: true },
  {
    to: '/reviews/weekly',
    labelKey: 'nav.weeklyReview',
    icon: ClipboardCheck,
    mobile: false,
    desktop: true,
  },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings, mobile: false, desktop: true },
  { to: '/more', labelKey: 'nav.more', icon: Ellipsis, mobile: true, desktop: false },
]
