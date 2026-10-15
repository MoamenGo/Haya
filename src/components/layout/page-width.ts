import { useRouterState } from '@tanstack/react-router'

/**
 * How wide the page column may grow. Most screens are one reading column, so
 * lines stay short on a big laptop. Screens that set `staticData: { wide: true }`
 * on their route (Today, Projects, Habits…) lay out in two columns from
 * tablet-landscape width up, so they get more room.
 */
export const PAGE_WIDTH = {
  narrow: 'max-w-3xl xl:max-w-4xl',
  wide: 'max-w-3xl lg:max-w-5xl xl:max-w-6xl',
} as const

/** The width class for the current route; shared by the top bar and the page. */
export function usePageWidth(): string {
  const wide = useRouterState({
    select: (state) => state.matches.some((match) => match.staticData.wide === true),
  })
  return wide ? PAGE_WIDTH.wide : PAGE_WIDTH.narrow
}

// Teaches TypeScript that every route may carry a `wide` flag in its staticData.
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    wide?: boolean
  }
}
