import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

const FIRST_FIELD = 'input:not([type="hidden"]), textarea, select'

/**
 * A modal built on the browser's own <dialog>: it already traps focus, closes
 * on Escape and hides the page from screen readers, so no library is needed.
 * On phones it rises from the bottom as a sheet; on wider screens it is centred.
 */
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  // Keep the real <dialog> in step with the `open` prop.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // The browser focuses the first button (the close X); start in the first field instead.
      dialog.querySelector<HTMLElement>(FIRST_FIELD)?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Escape or the browser closing it: tell the parent.
      onClose={onClose}
      // A click on the dimmed area (the dialog element itself, not its content) closes it.
      onClick={(event) => event.target === ref.current && onClose()}
      className={cn(
        'mx-auto mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-2xl border border-border bg-surface-raised p-0 text-foreground shadow-float open:animate-fade-up sm:my-auto sm:max-w-lg sm:rounded-2xl',
        className,
      )}
    >
      <div className="flex flex-col gap-5 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:p-6">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="-me-2 -mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X aria-hidden className="size-5" />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
