import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/** A grey placeholder block that gently pulses while data loads. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-shimmer rounded-md bg-subtle', className)} />
}

/** Placeholder rows for any list (tasks, projects, habits…). Screen readers hear "Loading". */
export function ListSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  const { t } = useTranslation()
  return (
    <div role="status" className={cn('flex flex-col gap-2', className)}>
      <span className="sr-only">{t('states.loading')}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
        >
          <Skeleton className="size-5 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className={cn('h-3.5', i % 2 ? 'w-1/2' : 'w-2/3')} />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
