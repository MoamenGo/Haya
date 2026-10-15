import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { setPathStart } from '../repo'
import { startDateInput } from '../schema'

interface PathStartFormProps {
  pathId: string
  startDate: string
}

/** Moves a plan's start date (e.g. to begin after exams). Ticks stay with their weeks. */
export function PathStartForm({ pathId, startDate }: PathStartFormProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState(startDate)
  const valid = startDateInput.safeParse(value).success

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (valid) await setPathStart(pathId, value)
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="flex flex-wrap items-end gap-2">
      <div className="min-w-48 flex-1">
        <Field label={t('learning.startDate')} hint={t('learning.startDateHint')}>
          <Input type="date" value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
      </div>
      <Button type="submit" variant="outline" disabled={!valid || value === startDate}>
        {t('learning.saveStart')}
      </Button>
    </form>
  )
}
