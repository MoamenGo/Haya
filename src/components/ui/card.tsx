import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** A flat panel with a hairline border. Padding grows a little on wider screens. */
export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn('rounded-2xl border border-border bg-surface p-4 sm:p-5', className)}
      {...props}
    />
  )
}
