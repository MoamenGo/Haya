import { useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import type { ReviewRow } from '@/core/db/types'
import { saveReview } from '../repo'
import { WEEKLY_NEXT_KEYS, WEEKLY_QUESTIONS } from '../weeklyQuestions'

interface WeeklyReviewFormProps {
  periodStart: string
  periodEnd: string
  initial: ReviewRow | undefined
}

/** A few short questions. Every one is optional; skipping is fine. */
export function WeeklyReviewForm({ periodStart, periodEnd, initial }: WeeklyReviewFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, string>>(initial?.answers ?? {})
  const set = (key: string, value: string) => setAnswers((prev) => ({ ...prev, [key]: value }))

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    await saveReview({
      kind: 'weekly',
      period_start: periodStart,
      period_end: periodEnd,
      answers,
    })
    await navigate({ to: '/week' })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {WEEKLY_QUESTIONS.map((key) => (
        <label key={key} className="flex flex-col gap-2">
          <span className="font-medium">{t(`weekly.q.${key}`)}</span>
          <Textarea
            dir="auto"
            rows={2}
            value={answers[key] ?? ''}
            onChange={(e) => set(key, e.target.value)}
          />
        </label>
      ))}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-medium">{t('weekly.next')}</legend>
        {WEEKLY_NEXT_KEYS.map((key, i) => (
          <Input
            key={key}
            aria-label={t('weekly.nextItem', { n: i + 1 })}
            value={answers[key] ?? ''}
            onChange={(e) => set(key, e.target.value)}
          />
        ))}
      </fieldset>

      <Button type="submit" className="min-h-12 text-base">
        {t('weekly.save')}
      </Button>
    </form>
  )
}
