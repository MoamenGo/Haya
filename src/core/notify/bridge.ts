import type { PlannedNotification } from './plan'

/**
 * The Android app (a WebView around this site) adds a JavaScript object called
 * `AndroidBridge` to the page. From version 2.2 it has `scheduleNotifications`,
 * which takes the whole list as JSON and replaces whatever was scheduled before.
 * In a normal browser the object doesn't exist and nothing is sent.
 */
interface AndroidBridge {
  scheduleNotifications?: (json: string) => void
}

declare global {
  interface Window {
    AndroidBridge?: AndroidBridge
  }
}

export type NotificationSender = (list: readonly PlannedNotification[]) => void

/** The phone's scheduler, or `null` outside the Android app (or in an older version of it). */
export function nativeNotifications(): NotificationSender | null {
  const bridge = typeof window === 'undefined' ? undefined : window.AndroidBridge
  if (typeof bridge?.scheduleNotifications !== 'function') return null
  return (list) => bridge.scheduleNotifications?.(JSON.stringify(list))
}
