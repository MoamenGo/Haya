import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SplitLayoutProps {
  /** The main column: the lists the page is about. */
  children: ReactNode
  /** The side column: forms and helpers (add a habit, add a project…). */
  aside: ReactNode
  /**
   * Whether the side column comes first on phones and portrait tablets, where
   * everything is one column. On wider screens it always sits at the end.
   */
  asideFirst?: boolean
  /** `loose` for pages made of big sections (Today), `normal` for lists. */
  spacing?: 'normal' | 'loose'
}

const GAPS = {
  normal: 'gap-5',
  loose: 'gap-8 sm:gap-10',
} as const

/**
 * One column on phones and portrait tablets; from `lg` (landscape tablets and
 * laptops) a main column plus a narrower side column. Each part is placed in
 * its grid cell explicitly, so the order in the source only matters for the
 * one-column layout (and for screen readers).
 */
export function SplitLayout({
  children,
  aside,
  asideFirst = false,
  spacing = 'normal',
}: SplitLayoutProps) {
  const gap = GAPS[spacing]
  const main = (
    <div key="main" className={cn('flex min-w-0 flex-col lg:col-start-1 lg:row-start-1', gap)}>
      {children}
    </div>
  )
  const side = (
    <div key="aside" className={cn('flex min-w-0 flex-col lg:col-start-2 lg:row-start-1', gap)}>
      {aside}
    </div>
  )
  return (
    <div
      className={cn(
        'flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_23rem]',
        gap,
      )}
    >
      {asideFirst ? [side, main] : [main, side]}
    </div>
  )
}
