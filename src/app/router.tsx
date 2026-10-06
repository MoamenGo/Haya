import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'
import { EveningReviewPage } from '@/modules/reviews/pages/EveningReviewPage'
import { SettingsPage } from '@/modules/settings/pages/SettingsPage'
import { TodayPage } from '@/modules/today/pages/TodayPage'

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

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

const routeTree = rootRoute.addChildren([indexRoute, todayRoute, reviewRoute, settingsRoute])

export const router = createRouter({ routeTree })

// Lets TypeScript check every <Link to="..."> against the real routes.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
