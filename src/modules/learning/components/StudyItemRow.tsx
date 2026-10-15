import { Check, Clock, ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { StudyItem } from '@/core/learning/types'
import { cn } from '@/lib/utils'
import { setChecked } from '../repo'

interface StudyItemRowProps {
  item: StudyItem
  pathId: string
  done: boolean
  /** The date a tick is recorded on. */
  todayISO: string
  /** Small labels after the minutes (e.g. "Edited"), used by the plan editor. */
  badges?: ReactNode
  /** Buttons at the end of the row (e.g. "Edit"), used by the plan editor. */
  actions?: ReactNode
  /** Greyed out, without a tick: a step he hid from his plan. */
  muted?: boolean
}

/** One study step as a light row: tick, text, minutes, and its source when there is one. */
export function StudyItemRow({
  item,
  pathId,
  done,
  todayISO,
  badges,
  actions,
  muted = false,
}: StudyItemRowProps) {
  const { t } = useTranslation()
  return (
    <li className={cn('flex items-start gap-3 px-3 py-3 sm:px-4', muted && 'bg-subtle/60')}>
      {muted ? (
        <span aria-hidden className="size-5 shrink-0" />
      ) : (
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={t('learning.markDone', { title: item.text })}
          onClick={() => void setChecked(pathId, item.key, !done, todayISO)}
          // 44px tap area around a 20px circle, like task rows.
          className="-m-3 flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:-outline-offset-8 focus-visible:outline-ring"
        >
          <span
            className={cn(
              'flex size-5 items-center justify-center rounded-full border-[1.5px] transition-colors duration-150',
              done
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border-strong hover:border-primary hover:bg-accent',
            )}
          >
            {done && <Check aria-hidden className="size-3 animate-pop" strokeWidth={3} />}
          </span>
        </button>
      )}
      <div className="min-w-0 flex-1">
        <p
          dir="auto"
          className={cn(
            'text-sm break-words md:text-[0.9375rem]',
            done && 'text-muted line-through decoration-muted/60',
            muted && 'text-muted',
          )}
        >
          {item.text}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden className="size-3" />
            {t('duration.m', { m: item.minutes })}
          </span>
          {item.link && (
            <span dir="auto" className="inline-flex min-w-0 items-center gap-1">
              {item.link.url ? (
                <a
                  href={item.link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex min-w-0 items-center gap-1 text-primary underline-offset-4 hover:underline"
                >
                  <ExternalLink aria-hidden className="size-3 shrink-0" />
                  <span className="truncate">{item.link.title}</span>
                </a>
              ) : (
                <span className="truncate">{item.link.title}</span>
              )}
            </span>
          )}
          {badges}
        </div>
      </div>
      {actions && <div className="-my-1 flex shrink-0 items-center gap-1">{actions}</div>}
    </li>
  )
}
