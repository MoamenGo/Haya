import { useRef, useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { db } from '@/core/db/db'
import { localDateISO } from '@/core/time/date'
import { applyImport, createBackup, previewImport, type ImportPreview } from '@/core/export/backup'

/** Export everything to a JSON file, or restore one after a preview (CLAUDE.md §7.5). */
export function DataSection() {
  const { t } = useTranslation()
  const fileInput = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function exportData() {
    const backup = await createBackup(db)
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `haya-backup-${localDateISO(new Date())}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // lets the same file be picked again
    if (!file) return
    try {
      setPreview(await previewImport(db, JSON.parse(await file.text())))
      setMessage(null)
    } catch {
      setPreview(null)
      setMessage(t('settings.importError'))
    }
  }

  async function confirmImport() {
    if (!preview) return
    try {
      await applyImport(db, preview)
      setMessage(t('settings.importDone'))
    } catch {
      setMessage(t('settings.importError'))
    }
    setPreview(null)
  }

  const totals = preview
    ? Object.values(preview.counts).reduce(
        (sum, c) => ({ added: sum.added + c.added, replaced: sum.replaced + c.replaced }),
        { added: 0, replaced: 0 },
      )
    : null

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-medium">{t('settings.data')}</h2>
      <p className="text-sm text-muted">{t('settings.dataHint')}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => void exportData()}>
          {t('settings.export')}
        </Button>
        <Button variant="outline" onClick={() => fileInput.current?.click()}>
          {t('settings.import')}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => void onFile(e)}
        />
      </div>
      {totals && (
        <div role="status" className="flex flex-col gap-2 rounded-lg bg-accent p-3 text-sm">
          <p>{t('settings.importPreview', totals)}</p>
          <div className="flex gap-2">
            <Button onClick={() => void confirmImport()}>{t('settings.importConfirm')}</Button>
            <Button variant="ghost" onClick={() => setPreview(null)}>
              {t('settings.importCancel')}
            </Button>
          </div>
        </div>
      )}
      {message && (
        <p role="status" className="text-sm text-muted">
          {message}
        </p>
      )}
    </div>
  )
}
