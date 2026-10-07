import { Plus } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { capture } from '../repo'
import { OPEN_CAPTURE_EVENT } from '../captureEvents'

const SAVED_NOTICE_MS = 2000

/**
 * Global capture (CLAUDE.md §6.1): a floating + on the phone, the sidebar
 * button or Ctrl/Cmd+K on the desktop. Type, press Enter, done; sorting happens later.
 * Uses the native <dialog> element, which handles focus and Escape for us.
 */
export function Capture() {
  const { t } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)

  const open = () => dialog.current?.showModal()

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        dialog.current?.showModal()
      }
    }
    const onOpenEvent = () => dialog.current?.showModal()
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_CAPTURE_EVENT, onOpenEvent)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_CAPTURE_EVENT, onOpenEvent)
    }
  }, [])

  useEffect(() => {
    if (!saved) return
    const id = window.setTimeout(() => setSaved(false), SAVED_NOTICE_MS)
    return () => window.clearTimeout(id)
  }, [saved])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (await capture(text)) {
      setText('')
      setSaved(true)
      dialog.current?.close()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={t('capture.open')}
        className="fixed end-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-10 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-float transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 md:hidden"
      >
        <Plus aria-hidden className="size-7" />
      </button>
      {saved && (
        <p
          role="status"
          className="fixed inset-x-4 bottom-[calc(9rem+env(safe-area-inset-bottom))] z-20 rounded-xl border border-border bg-surface-raised p-3 text-center text-sm shadow-float md:inset-x-auto md:end-6 md:bottom-6"
        >
          {t('capture.saved')}
        </p>
      )}

      <dialog
        ref={dialog}
        aria-labelledby="capture-title"
        className="m-auto w-[min(34rem,calc(100%-2rem))] rounded-2xl border border-border bg-surface-raised p-0 text-foreground shadow-float backdrop:bg-black/40 backdrop:backdrop-blur-[2px]"
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-3 p-5 sm:p-6">
          <h2 id="capture-title" className="font-medium">
            {t('capture.title')}
          </h2>
          <textarea
            dir="auto"
            autoFocus
            rows={3}
            value={text}
            placeholder={t('capture.placeholder')}
            aria-describedby="capture-hint"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Enter saves; Shift+Enter adds a new line.
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
            className="rounded-xl border border-border bg-background p-3 leading-relaxed"
          />
          <p id="capture-hint" className="text-xs text-muted">
            {t('capture.hint')}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => dialog.current?.close()}>
              {t('capture.close')}
            </Button>
            <Button type="submit" disabled={!text.trim()}>
              {t('capture.save')}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  )
}
