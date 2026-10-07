import { useEffect, useState } from 'react'

const KEY = 'haya.sidebar.collapsed'
/** Below this width (tablets) the sidebar starts narrow until the owner chooses. */
const NARROW_SCREEN_PX = 1100

/**
 * Whether the desktop sidebar shows icons only. A per-device UI preference,
 * so it lives in localStorage, not in the synced database.
 */
export function useSidebarCollapsed(): [boolean, (next: boolean) => void] {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved !== null) return saved === '1'
    } catch {
      // Storage can be blocked (private mode): fall back to the screen width.
    }
    return typeof window !== 'undefined' && window.innerWidth < NARROW_SCREEN_PX
  })

  useEffect(() => {
    try {
      localStorage.setItem(KEY, collapsed ? '1' : '0')
    } catch {
      // Not saved; the choice still applies until reload.
    }
  }, [collapsed])

  return [collapsed, setCollapsed]
}
