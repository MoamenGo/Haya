import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'

/** The notice hides itself so it never sits on top of the page for long. */
const AUTO_HIDE_MS = 6000
/** How often an open app asks the server for a newer version. */
const UPDATE_CHECK_MS = 60 * 60 * 1000

/**
 * A browser only looks for a new service worker when a page loads. The phone
 * app and an installed PWA stay open for days without loading again, so new
 * versions never arrived. Ask again whenever the app comes back to the screen,
 * and once an hour while it stays open.
 */
function checkForUpdates(registration: ServiceWorkerRegistration | undefined) {
  if (!registration) return
  const check = () => {
    if (navigator.onLine) void registration.update().catch(() => undefined)
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check()
  })
  window.setInterval(check, UPDATE_CHECK_MS)
}

/**
 * Registers the service worker (the background script that caches the app)
 * and tells the owner once when the app can open without network.
 * With `registerType: 'autoUpdate'`, new versions install by themselves and
 * the page reloads once they are ready.
 */
export function OfflineReadyNotice() {
  const { t } = useTranslation()
  const {
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW({ onRegisteredSW: (_url, registration) => checkForUpdates(registration) })

  useEffect(() => {
    if (!offlineReady) return
    const id = window.setTimeout(() => setOfflineReady(false), AUTO_HIDE_MS)
    return () => window.clearTimeout(id)
  }, [offlineReady, setOfflineReady])

  if (!offlineReady) return null
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-20 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-raised p-3 text-sm shadow-float md:inset-x-auto md:end-6 md:bottom-6"
    >
      <span>{t('pwa.offlineReady')}</span>
      <Button variant="ghost" onClick={() => setOfflineReady(false)}>
        {t('pwa.dismiss')}
      </Button>
    </div>
  )
}
