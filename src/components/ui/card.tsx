import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** The basic white box most of the app is built from. Padding grows a little on wider screens. */
export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border/80 bg-surface p-4 shadow-card sm:p-5',
        className,
      )}
      {...props}
    />
  )
}
