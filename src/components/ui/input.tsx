import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** Shared look of every text field, so inputs, selects and text areas match. */
export const fieldClass =
  'min-h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-base text-foreground transition-colors duration-150 placeholder:text-muted/80 hover:border-border-strong aria-invalid:border-danger md:min-h-10 md:text-sm'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input dir="auto" className={cn(fieldClass, className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea dir="auto" className={cn(fieldClass, 'min-h-24 py-2', className)} {...props} />
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClass, 'pe-8', className)} {...props} />
}

/** A label above its field, with an optional hint or error under it. */
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string | null
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      ) : (
        hint && <span className="text-xs text-muted">{hint}</span>
      )}
    </label>
  )
}
