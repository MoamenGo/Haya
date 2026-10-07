import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      dir="auto"
      className={cn(
        'min-h-11 min-w-0 rounded-xl border border-border bg-surface-raised px-3 transition-colors placeholder:text-muted/70 hover:border-primary/40',
        className,
      )}
      {...props}
    />
  )
}
