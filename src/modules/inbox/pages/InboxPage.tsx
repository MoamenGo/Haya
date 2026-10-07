import { Link2 } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { localDateISO } from '@/core/time/date'
import { useNow } from '@/hooks/useNow'
import { discardItem, listInbox, processAsTask } from '../repo'
import { PageHeader } from '@/components/layout/PageHeader'

/** Processing screen: each captured item becomes a task or is deleted (CLAUDE.md §6.1). */
export function InboxPage() {
  const { t } = useTranslation()
  const today = localDateISO(useNow())
  const items = useLiveQuery(listInbox, [])

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t('inbox.title')} intro={t('inbox.intro')} />
      {items === undefined ? (
        <p className="text-sm text-muted">{t('states.loading')}</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
          {t('inbox.empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card"
            >
              <p dir="auto" className="break-words leading-relaxed">
                {item.text}
              </p>
              {(item.is_important || item.kind_hint || item.tags.length > 0) && (
                <p className="flex flex-wrap gap-2 text-xs text-muted">
                  {item.is_important && (
                    <span className="font-medium text-primary">{t('inbox.important')}</span>
                  )}
                  {item.kind_hint === 'link' && (
                    <span className="inline-flex items-center gap-1">
                      <Link2 aria-hidden className="size-3" />
                      {t('inbox.link')}
                    </span>
                  )}
                  {item.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void processAsTask(item, today)}>{t('inbox.today')}</Button>
                <Button variant="outline" onClick={() => void processAsTask(item, null)}>
                  {t('inbox.later')}
                </Button>
                <Button variant="ghost" onClick={() => void discardItem(item.id)}>
                  {t('inbox.discard')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
