import { cn } from '@/lib/utils'

/** The app's crescent mark (same drawing as public/favicon.svg), drawn with theme colours. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn('size-10 shrink-0', className)}>
      <rect width="64" height="64" rx="16" className="fill-primary" />
      <circle cx="32" cy="32" r="17" className="fill-primary-foreground" />
      <circle cx="39" cy="27" r="14" className="fill-primary" />
    </svg>
  )
}
