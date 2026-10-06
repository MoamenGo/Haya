/** Other components (the desktop sidebar button) open capture by dispatching this event. */
export const OPEN_CAPTURE_EVENT = 'haya:open-capture'

export function openCapture(): void {
  window.dispatchEvent(new Event(OPEN_CAPTURE_EVENT))
}
