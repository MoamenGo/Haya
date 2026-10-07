import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'

/** The notice hides itself so it never sits on top of the page for long. */
const AUTO_HIDE_MS = 6000

/**
 * Registers the service worker (the background script that caches the app)
 * and tells the owner once when the app can open without network.
 * With `registerType: 'autoUpdate'`, new versions install by themselves.
 */
export function OfflineReadyNotice() {
  const { t } = useTranslation()
  const {
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW()

  useEffect(() => {
    if (!offlineReady) return
    const id = window.setTimeout(() => setOfflineReady(false), AUTO_HIDE_MS)
    return () => window.clearTimeout(id)
  }, [offlineReady, setOfflineReady])

  if (!offlineReady) return null
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-raised p-3 text-sm shadow-float md:inset-x-auto md:end-6 md:bottom-6"
    >
      <span>{t('pwa.offlineReady')}</span>
      <Button variant="ghost" onClick={() => setOfflineReady(false)}>
        {t('pwa.dismiss')}
      </Button>
    </div>
  )
}
