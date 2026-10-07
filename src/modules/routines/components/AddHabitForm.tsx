import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PRAYER_BLOCKS, type PrayerBlock } from '@/core/db/types'
import { createRoutine } from '../repo'

/** A new daily habit, anchored to a prayer, with its hard-day version. */
export function AddHabitForm() {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [anchor, setAnchor] = useState<PrayerBlock>('after_fajr')
  const [full, setFull] = useState('')
  const [minimum, setMinimum] = useState('')
  const [worship, setWorship] = useState(false)
  const ready = title.trim() !== '' && minimum.trim() !== ''

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!ready) return
    await createRoutine({
      title,
      anchor,
      full_version: full,
      minimum_version: minimum,
      is_worship: worship,
    })
    setTitle('')
    setFull('')
    setMinimum('')
    setWorship(false)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <h2 className="font-medium">{t('habits.add')}</h2>
      <label className="flex flex-col gap-1 text-sm">
        {t('habits.titleLabel')}
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('habits.anchorLabel')}
        <select
          value={anchor}
          onChange={(e) => setAnchor(e.target.value as PrayerBlock)}
          className="min-h-11 rounded-xl border border-border bg-surface-raised px-3"
        >
          {PRAYER_BLOCKS.map((block) => (
            <option key={block} value={block}>
              {t(`blocks.${block}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('habits.fullLabel')}
        <Input value={full} onChange={(e) => setFull(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('habits.minimumLabel')}
        <Input value={minimum} onChange={(e) => setMinimum(e.target.value)} />
        <span className="text-xs text-muted">{t('habits.minimumHint')}</span>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={worship}
          onChange={(e) => setWorship(e.target.checked)}
          className="size-5 accent-primary"
        />
        {t('habits.worshipLabel')}
      </label>
      <div>
        <Button type="submit" disabled={!ready}>
          {t('habits.create')}
        </Button>
      </div>
    </form>
  )
}
