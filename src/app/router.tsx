import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { dateSearch } from '@/core/time/calendar'
import { CalendarPage } from '@/modules/calendar/pages/CalendarPage'
import { AppShell } from '@/components/layout/AppShell'
import { RouteError } from './RouteError'
import { GoalMapPage } from '@/modules/goals/pages/GoalMapPage'
import { GoalsPage } from '@/modules/goals/pages/GoalsPage'
import { LearnPage } from '@/modules/learning/pages/LearnPage'
import { PlanPage } from '@/modules/learning/pages/PlanPage'
import { InboxPage } from '@/modules/inbox/pages/InboxPage'
import { MorePage } from '@/modules/more/pages/MorePage'
import { NotesPage } from '@/modules/notes/pages/NotesPage'
import { EveningReviewPage } from '@/modules/reviews/pages/EveningReviewPage'
import { WeeklyReviewPage } from '@/modules/reviews/pages/WeeklyReviewPage'
import { ProjectsPage } from '@/modules/projects/pages/ProjectsPage'
import { HabitsPage } from '@/modules/routines/pages/HabitsPage'
import { SettingsPage } from '@/modules/settings/pages/SettingsPage'
import { TasksPage } from '@/modules/tasks/pages/TasksPage'
import { TodayPage } from '@/modules/today/pages/TodayPage'
import { WeekPage } from '@/modules/week/pages/WeekPage'

// Routes are declared in code (not generated from files) so the whole map is
// readable in one place. See docs/routes.md for what each phase adds.
// `staticData: { wide: true }` gives a page the wider two-column width on big
// screens (see src/components/layout/page-width.ts).
const rootRoute = createRootRoute({ component: AppShell })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/today' })
  },
})

const todayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/today',
  component: TodayPage,
  validateSearch: dateSearch,
  staticData: { wide: true },
})

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calendar',
  component: CalendarPage,
  validateSearch: dateSearch,
  staticData: { wide: true },
})

const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/today/review',
  component: EveningReviewPage,
})

const inboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inbox',
  component: InboxPage,
})

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: TasksPage,
})

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsPage,
  staticData: { wide: true },
})

const goalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/goals',
  component: GoalsPage,
  staticData: { wide: true },
})

const goalMapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/goals/$goalId',
  component: GoalMapPage,
})

const habitsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/habits',
  component: HabitsPage,
  staticData: { wide: true },
})

const learnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/learn',
  component: LearnPage,
})

const planRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/learn/$pathId',
  component: PlanPage,
})

const weekRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/week',
  component: WeekPage,
  staticData: { wide: true },
})

const weeklyReviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reviews/weekly',
  component: WeeklyReviewPage,
})

const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes',
  component: NotesPage,
  staticData: { wide: true },
})

const moreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/more',
  component: MorePage,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  todayRoute,
  calendarRoute,
  reviewRoute,
  inboxRoute,
  tasksRoute,
  projectsRoute,
  goalsRoute,
  goalMapRoute,
  habitsRoute,
  learnRoute,
  planRoute,
  weekRoute,
  weeklyReviewRoute,
  notesRoute,
  moreRoute,
  settingsRoute,
])

// A page that throws shows RouteError inside the shell, so navigation still works.
export const router = createRouter({
  routeTree,
  defaultErrorComponent: RouteError,
  // Screens cross-fade instead of jumping (View Transitions API, where the
  // browser has it; elsewhere navigation is instant as before). index.css sets
  // the timing and turns it off for reduced motion.
  defaultViewTransition: true,
})

// Lets TypeScript check every <Link to="..."> against the real routes.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
