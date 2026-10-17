import { cn } from '@/lib/utils'

/**
 * The Khatwa (خطوة, "a step") mark: three steps rising — the ones already
 * taken — and one dot just above them: the next step. Same drawing as
 * public/favicon.svg and the PWA icons, but in theme colours, so it follows
 * every palette and light / dark / glass.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn('size-8 shrink-0', className)}>
      <rect width="64" height="64" rx="15" className="fill-primary" />
      <path
        d="M13 48H24V38H34V28H44"
        fill="none"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary-foreground"
      />
      <circle cx="49" cy="18" r="5" className="fill-highlight" />
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
          <span className="font-display text-xl font-semibold">خطوة</span>
          <span className="font-display text-xs font-medium tracking-wide text-muted">Khatwa</span>
        </span>
      )}
    </span>
  )
}
