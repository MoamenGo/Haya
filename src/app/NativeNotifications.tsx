import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { nativeNotifications } from '@/core/notify/bridge'
import { NOTIFY_HORIZON_DAYS, NOTIFY_RESEND_DEBOUNCE_MS } from '@/core/notify/config'
import { planNotifications, type Translate } from '@/core/notify/plan'
import { localDateISO } from '@/core/time/date'
import { useNow } from '@/hooks/useNow'
import { notifyDays } from '@/modules/notifications/repo'
import { useSetting } from '@/modules/settings/hooks'

/** "Today" only needs to move at midnight; checking every few minutes is plenty. */
const DAY_CHECK_MS = 5 * 60_000

/**
 * Inside the Android app, keeps the phone's notifications in step with the
 * data: whenever tasks, study, settings or the date change, it plans the next
 * few days and hands the whole list to the app, which replaces what it had.
 * In a browser it renders nothing and does nothing (ADR-008).
 */
export function NativeNotifications() {
  const send = useMemo(() => nativeNotifications(), [])
  const { t, i18n } = useTranslation()
  const [prefs] = useSetting('notifications')
  const [location] = useSetting('location')
  const today = localDateISO(useNow(DAY_CHECK_MS))
  const days = useLiveQuery(
    () => (send ? notifyDays(today, NOTIFY_HORIZON_DAYS, location) : []),
    [send, today, location.latitude, location.longitude],
  )

  useEffect(() => {
    if (!send || !days) return
    // The planner builds its keys at run time (e.g. `prayers.${name}`), so it takes a
    // plain string key; every key it uses exists in ar.json and en.json.
    const translate: Translate = (key, options) => String(t(key as never, options as never))
    // Ticking a few tasks in a row sends once, after the last tick.
    const id = window.setTimeout(
      () => send(planNotifications(days, prefs, new Date(), translate)),
      NOTIFY_RESEND_DEBOUNCE_MS,
    )
    return () => window.clearTimeout(id)
    // `t` changes with the language, so the texts follow it.
  }, [send, days, prefs, t, i18n.language])

  return null
}
