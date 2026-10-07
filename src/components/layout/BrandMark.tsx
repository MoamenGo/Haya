import { cn } from '@/lib/utils'

/**
 * The Haya mark: an open circle (a life's cycle, kept in balance) with one
 * point rising out of it (growth, the next step). Same drawing as
 * public/favicon.svg and the PWA icons, but in theme colours.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn('size-8 shrink-0', className)}>
      <rect width="64" height="64" rx="15" className="fill-primary" />
      <path
        d="M44.66 31.25A14 14 0 1 1 32.75 19.34"
        fill="none"
        strokeWidth="6.5"
        strokeLinecap="round"
        className="stroke-primary-foreground"
      />
      <circle cx="45.65" cy="18.35" r="4.75" className="fill-highlight" />
    </svg>
  )
}

/** Mark + name, for the sidebar and the phone header. */
export function BrandLockup({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <BrandMark />
      {!collapsed && (
        <span className="flex items-baseline gap-1.5 leading-none">
          <span className="text-lg font-semibold">حياة</span>
          <span className="text-xs font-medium tracking-wide text-muted">Haya</span>
        </span>
      )}
    </span>
  )
}
