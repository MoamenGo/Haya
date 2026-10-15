import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { LearningPathRow, LearningPathStatus } from '@/core/db/types'
import { TooManyActivePathsError, setPathStatus } from '../repo'

/** Pause / resume / finish, with the gentle "3 active plans" message when needed. */
export function PathStatusButtons({ path }: { path: LearningPathRow }) {
  const { t } = useTranslation()
  const [message, setMessage] = useState<string | null>(null)

  async function change(status: LearningPathStatus) {
    try {
      await setPathStatus(path.id, status)
      setMessage(null)
    } catch (error) {
      if (error instanceof TooManyActivePathsError) setMessage(t('learning.limit'))
      else throw error
    }
  }

  return (
    <>
      {path.status === 'active' ? (
        <Button variant="outline" onClick={() => void change('paused')}>
          {t('learning.pause')}
        </Button>
      ) : (
        <Button variant="outline" onClick={() => void change('active')}>
          {t('learning.resume')}
        </Button>
      )}
      {path.status !== 'done' && (
        <Button variant="ghost" onClick={() => void change('done')}>
          {t('learning.finish')}
        </Button>
      )}
      {message && (
        <p role="status" className="basis-full rounded-lg bg-accent p-2 text-sm">
          {message}
        </p>
      )}
    </>
  )
}
