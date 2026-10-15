import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ChoiceGroup } from '@/components/ui/choice-group'
import { Dialog } from '@/components/ui/dialog'
import { Field, Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast-store'
import { CUSTOM_PLAN } from '@/core/learning/config'
import type { EditableStep } from '@/core/learning/edits'
import { STUDY_ITEM_KINDS, type StudyItemKind } from '@/core/learning/types'
import { addStep, editStep, hideStep, resetStep } from '../repo'
import { stepInput } from '../schema'

interface StepDialogProps {
  open: boolean
  onClose: () => void
  pathId: string
  week: number
  /** Day of the week (0 = Saturday) a new step goes to. */
  day: number
  /** Edit this step; without it the dialog adds a new one. */
  step?: EditableStep
}

/**
 * Add a step to a day, or change one. A built-in step can also be hidden or
 * put back as the plan wrote it; a step he added can be deleted.
 */
export function StepDialog({ open, onClose, pathId, week, day, step }: StepDialogProps) {
  const { t } = useTranslation()
  const item = step?.item
  const [text, setText] = useState(item?.text ?? '')
  const [minutes, setMinutes] = useState(String(item?.minutes ?? CUSTOM_PLAN.defaultMinutes))
  const [kind, setKind] = useState<StudyItemKind>(item?.kind ?? 'study')
  const [linkTitle, setLinkTitle] = useState(item?.link?.title ?? '')
  const [linkUrl, setLinkUrl] = useState(item?.link?.url ?? '')
  const [showErrors, setShowErrors] = useState(false)

  const input = { text, minutes: Number(minutes), kind, link_title: linkTitle, link_url: linkUrl }
  const parsed = stepInput.safeParse(input)
  const issues = parsed.success ? [] : parsed.error.issues.map((i) => i.path[0])
  const textError = showErrors && issues.includes('text') ? t('learning.stepRequired') : null
  const urlError = showErrors && issues.includes('link_url') ? t('learning.badUrl') : null

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!parsed.success) {
      setShowErrors(true)
      return
    }
    if (step) await editStep(pathId, week, step.item, input)
    else await addStep(pathId, week, day, input)
    toast(step ? t('learning.stepSaved') : t('learning.stepAdded'))
    onClose()
  }

  async function run(action: () => Promise<void>) {
    await action()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={step ? t('learning.editStep') : t('learning.newStep')}
      description={step ? undefined : t('learning.stepHint')}
    >
      <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
        <Field label={t('learning.stepText')} error={textError}>
          <Input
            value={text}
            aria-invalid={textError ? true : undefined}
            placeholder={t('learning.stepTextPlaceholder')}
            onChange={(e) => setText(e.target.value)}
          />
        </Field>
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">{t('learning.kind')}</span>
          <ChoiceGroup<StudyItemKind>
            label={t('learning.kind')}
            value={kind}
            onChange={setKind}
            options={STUDY_ITEM_KINDS.map((k) => ({ value: k, label: t(`learning.kinds.${k}`) }))}
          />
        </div>
        <Field label={t('learning.minutes')}>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={CUSTOM_PLAN.maxMinutes}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="sm:w-40"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('learning.linkTitle')}>
            <Input value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} />
          </Field>
          <Field label={t('learning.linkUrl')} error={urlError}>
            <Input
              type="url"
              dir="ltr"
              inputMode="url"
              placeholder="https://"
              value={linkUrl}
              aria-invalid={urlError ? true : undefined}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-2">
            {step?.original && step.edited && (
              <Button
                variant="ghost"
                onClick={() => void run(() => resetStep(pathId, step.item.key))}
              >
                {t('learning.restore')}
              </Button>
            )}
            {step?.original && !step.hidden && (
              <Button
                variant="ghost"
                onClick={() => void run(() => hideStep(pathId, week, step.item))}
              >
                {t('learning.hide')}
              </Button>
            )}
            {step && !step.original && (
              <Button
                variant="danger"
                onClick={() => void run(() => resetStep(pathId, step.item.key))}
              >
                {t('learning.deleteStep')}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{t('common.save')}</Button>
          </div>
        </div>
      </form>
    </Dialog>
  )
}
