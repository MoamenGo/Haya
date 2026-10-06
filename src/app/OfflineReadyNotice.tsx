import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'

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

  if (!offlineReady) return null
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-20 z-20 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 text-sm shadow-sm md:inset-x-auto md:end-6 md:bottom-6"
    >
      <span>{t('pwa.offlineReady')}</span>
      <Button variant="ghost" onClick={() => setOfflineReady(false)}>
        {t('pwa.dismiss')}
      </Button>
    </div>
  )
}
