import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      dir="auto"
      className={cn(
        'min-h-11 min-w-0 rounded-lg border border-border bg-surface px-3 focus-visible:outline-2 focus-visible:outline-primary',
        className,
      )}
      {...props}
    />
  )
}
