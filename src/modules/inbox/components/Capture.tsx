import { Loader2, Plus } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/input'
import { toast } from '@/components/ui/toast-store'
import { capture } from '../repo'
import { OPEN_CAPTURE_EVENT } from '../captureEvents'

/**
 * Global capture (CLAUDE.md §6.1): a floating + on the phone, the top-bar
 * button or Ctrl/Cmd+K on the desktop. Type, press Enter, done; sorting happens later.
 */
export function Capture() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
      }
    }
    const onOpenEvent = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_CAPTURE_EVENT, onOpenEvent)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_CAPTURE_EVENT, onOpenEvent)
    }
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      if (await capture(text)) {
        setText('')
        setOpen(false)
        toast(t('capture.saved'), 'success')
      }
    } catch {
      toast(t('states.saveFailed'), 'danger')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('capture.open')}
        className="fixed end-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-10 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-float transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 motion-reduce:transition-none md:hidden"
      >
        <Plus aria-hidden className="size-6" />
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title={t('capture.title')}>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Textarea
            dir="auto"
            autoFocus
            rows={3}
            value={text}
            aria-label={t('capture.title')}
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
          />
          <p id="capture-hint" className="text-xs text-muted">
            {t('capture.hint')}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('capture.close')}
            </Button>
            <Button type="submit" disabled={!text.trim() || saving}>
              {saving && <Loader2 aria-hidden className="animate-spin" />}
              {t('capture.save')}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
