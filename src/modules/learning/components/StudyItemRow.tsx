import { Check, Clock, ExternalLink } from 'lucide-react'
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
}

/** One study step as a light row: tick, text, minutes, and its source when there is one. */
export function StudyItemRow({ item, pathId, done, todayISO }: StudyItemRowProps) {
  const { t } = useTranslation()
  return (
    <li className="flex items-start gap-3 px-3 py-3 sm:px-4">
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
      <div className="min-w-0 flex-1">
        <p
          dir="auto"
          className={cn(
            'text-sm break-words md:text-[0.9375rem]',
            done && 'text-muted line-through decoration-muted/60',
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
        </div>
      </div>
    </li>
  )
}
