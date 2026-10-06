import { useLiveQuery } from 'dexie-react-hooks'
import { dayTypeForDate } from '@/core/time/dayType'
import { dayInfo, type DayInfo } from './repo'

/**
 * A date's day type, live. Until the database answers it falls back to the
 * weekly pattern, so screens never flash an empty day type.
 */
export function useDayInfo(dateISO: string): DayInfo {
  const info = useLiveQuery(() => dayInfo(dateISO), [dateISO])
  return info ?? { date: dateISO, dayType: dayTypeForDate(dateISO), override: null }
}
