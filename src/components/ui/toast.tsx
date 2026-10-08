import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

import { dismissToast, getToasts, subscribeToasts } from './toast-store'

const ICONS = { success: CheckCircle2, info: Info, danger: CircleAlert } as const

/** Shows the current toasts. Mount once, in the app shell. */
export function Toaster() {
  const { t } = useTranslation()
  const current = useSyncExternalStore(subscribeToasts, getToasts)
  return (
    // Polite live region: screen readers announce each toast without interrupting.
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 md:bottom-6"
    >
      {current.map((item) => {
        const Icon = ICONS[item.tone]
        return (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 rounded-xl border border-border bg-foreground px-4 py-3 text-sm text-background shadow-float"
          >
            <Icon
              aria-hidden
              className={cn(
                'size-4 shrink-0',
                item.tone === 'success' && 'text-primary-strong',
                item.tone === 'danger' && 'text-danger',
              )}
            />
            <span className="flex-1">{item.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              aria-label={t('common.close')}
              className="-me-1 flex size-7 items-center justify-center rounded-md opacity-70 hover:opacity-100"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
