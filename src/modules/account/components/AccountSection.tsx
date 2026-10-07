import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { signOut } from '@/core/auth/auth'
import { isCloudConfigured } from '@/core/auth/client'
import { useSession, useSyncStatus } from '../hooks'
import { SignInForm } from './SignInForm'
import { SyncIndicator } from './SyncIndicator'
import { ListSkeleton } from '@/components/ui/skeleton'

/** Settings → Account & sync: sign in, see sync state, sign out (CLAUDE.md §7.3–7.4). */
export function AccountSection() {
  const { t, i18n } = useTranslation()
  const session = useSession()
  const status = useSyncStatus()
  const [showError, setShowError] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-medium">{t('sync.title')}</h2>
      {!isCloudConfigured ? (
        <p className="text-sm text-muted">{t('sync.notConfigured')}</p>
      ) : session === undefined ? (
        <ListSkeleton rows={1} />
      ) : session === null ? (
        <>
          <p className="text-sm text-muted">{t('sync.intro')}</p>
          <SignInForm />
        </>
      ) : (
        <>
          <p className="text-sm">
            {t('sync.signedInAs')} <span dir="ltr">{session.user.email}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <SyncIndicator />
            {status.pending > 0 && (
              <span className="text-sm text-muted">
                {t('sync.pending', { count: status.pending })}
              </span>
            )}
            {status.lastSyncedAt && (
              <span className="text-sm text-muted">
                {t('sync.lastSynced', {
                  time: new Date(status.lastSyncedAt).toLocaleTimeString(i18n.language),
                })}
              </span>
            )}
          </div>
          {status.phase === 'error' && status.error && (
            <div className="text-sm">
              <button
                type="button"
                className="text-primary underline-offset-4 hover:underline"
                aria-expanded={showError}
                onClick={() => setShowError(!showError)}
              >
                {t('sync.errorDetails')}
              </button>
              {showError && (
                <p dir="ltr" className="mt-1 rounded-lg bg-accent p-2 font-mono text-xs">
                  {status.error}
                </p>
              )}
            </div>
          )}
          <div>
            <Button variant="outline" onClick={() => void signOut()}>
              {t('sync.signOut')}
            </Button>
          </div>
          <p className="text-xs text-muted">{t('sync.signOutNote')}</p>
        </>
      )}
    </div>
  )
}
