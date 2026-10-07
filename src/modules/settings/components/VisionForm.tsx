import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { useSetting } from '../hooks'

const VISION_MAX_LENGTH = 500

export function VisionForm() {
  const { t } = useTranslation()
  const [vision, setVision] = useSetting('vision')
  // `draft` is null until the owner types, so the saved value shows once the DB loads.
  const [draft, setDraft] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const text = draft ?? vision

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    await setVision(text.trim())
    setDraft(null)
    setSaved(true)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label htmlFor="vision-input" className="font-medium">
        {t('settings.vision')}
      </label>
      <p id="vision-hint" className="text-sm text-muted">
        {t('settings.visionHint')}
      </p>
      <Textarea
        id="vision-input"
        dir="auto"
        aria-describedby="vision-hint"
        rows={3}
        maxLength={VISION_MAX_LENGTH}
        value={text}
        placeholder={t('settings.visionPlaceholder')}
        onChange={(event) => {
          setDraft(event.target.value)
          setSaved(false)
        }}
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={draft === null}>
          {t('settings.save')}
        </Button>
        {saved && (
          <span role="status" className="text-sm text-muted">
            {t('settings.saved')}
          </span>
        )}
      </div>
    </form>
  )
}
