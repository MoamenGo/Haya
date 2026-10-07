/**
 * Tiny toast system: `toast('Saved')` from anywhere, <Toaster /> once in the
 * shell. A plain module-level store + useSyncExternalStore, so no library.
 */
export interface ToastItem {
  id: number
  message: string
  tone: 'success' | 'info' | 'danger'
}

const TOAST_MS = 3200
let items: ToastItem[] = []
let nextId = 1
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

export function toast(message: string, tone: ToastItem['tone'] = 'success'): void {
  const id = nextId++
  items = [...items.slice(-2), { id, message, tone }]
  emit()
  setTimeout(() => dismissToast(id), TOAST_MS)
}

export function dismissToast(id: number) {
  items = items.filter((item) => item.id !== id)
  emit()
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getToasts = (): ToastItem[] => items
