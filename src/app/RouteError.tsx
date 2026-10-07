import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

/**
 * Shown in place of a page that crashed. The owner gets a calm message and a
 * retry; the technical error goes to the console only.
 */
export function RouteError({ error, reset }: ErrorComponentProps) {
  const { t } = useTranslation()
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  function retry() {
    reset()
    void router.invalidate()
  }

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-12 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-warning-soft text-warning">
        <AlertTriangle aria-hidden className="size-6" strokeWidth={1.75} />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <h1 className="text-lg">{t('states.errorTitle')}</h1>
        <p className="text-sm text-muted">{t('states.errorBody')}</p>
      </div>
      <Button onClick={retry}>
        <RotateCcw aria-hidden />
        {t('common.retry')}
      </Button>
    </div>
  )
}
