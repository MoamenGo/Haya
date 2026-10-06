import { Plus } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { capture } from '../repo'

const SAVED_NOTICE_MS = 2000

/**
 * Global capture (CLAUDE.md §6.1): a floating + on the phone, a button and
 * Ctrl/Cmd+K on the desktop. Type, press Enter, done; sorting happens later.
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
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
        className="fixed end-4 bottom-20 z-10 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
      >
        <Plus aria-hidden className="size-7" />
      </button>
      <Button onClick={open} className="fixed end-6 top-5 z-10 hidden md:inline-flex">
        <Plus aria-hidden className="size-4" />
        {t('capture.open')}
        <kbd className="ms-1 text-xs opacity-70">Ctrl K</kbd>
      </Button>

      {saved && (
        <p
          role="status"
          className="fixed inset-x-4 bottom-36 z-20 rounded-xl border border-border bg-surface p-3 text-center text-sm shadow-sm md:inset-x-auto md:end-6 md:bottom-6"
        >
          {t('capture.saved')}
        </p>
      )}

      <dialog
        ref={dialog}
        aria-labelledby="capture-title"
        className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-2xl border border-border bg-surface p-0 text-foreground backdrop:bg-black/40"
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-3 p-5">
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
            className="rounded-lg border border-border bg-background p-3 leading-relaxed focus-visible:outline-2 focus-visible:outline-primary"
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
