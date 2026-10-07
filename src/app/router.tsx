import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'
import { GoalsPage } from '@/modules/goals/pages/GoalsPage'
import { InboxPage } from '@/modules/inbox/pages/InboxPage'
import { MorePage } from '@/modules/more/pages/MorePage'
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
})

const goalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/goals',
  component: GoalsPage,
})

const habitsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/habits',
  component: HabitsPage,
})

const weekRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/week',
  component: WeekPage,
})

const weeklyReviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reviews/weekly',
  component: WeeklyReviewPage,
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
  reviewRoute,
  inboxRoute,
  tasksRoute,
  projectsRoute,
  goalsRoute,
  habitsRoute,
  weekRoute,
  weeklyReviewRoute,
  moreRoute,
  settingsRoute,
])

export const router = createRouter({ routeTree })

// Lets TypeScript check every <Link to="..."> against the real routes.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
