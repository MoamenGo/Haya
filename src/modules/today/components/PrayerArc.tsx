import { Moon } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { PRAYER_NAMES, formatTime, type DayPrayers, type PrayerName } from '@/core/time/prayers'
import { TWILIGHT_SHARE, sunPath } from '@/core/time/sky'
import { cn } from '@/lib/utils'

/*
 * The arc is drawn in a 200 × 120 box: the sun's path, rising from the
 * horizon at the start edge, over the top at Dhuhr, setting at Maghrib on
 * the end edge. Fajr and Isha sit just under the horizon.
 * The SVG stretches to fill the box, so the dots and labels are HTML placed
 * at the same points (in %) rather than drawn inside the SVG: that keeps
 * circles round and text sharp at any width.
 */
const BOX_W = 200
const BOX_H = 120
const CX = 100
const CY = 94 // the horizon
const RX = 86
const RY = 80
const HORIZON_INSET = 4
const PERCENT = 100

/** A point on the arc for `t` (0 = sunrise, 1 = sunset; below 0 or above 1 is under the horizon). */
function arcPoint(t: number) {
  const angle = Math.PI * t
  return { x: CX - RX * Math.cos(angle), y: CY - RY * Math.sin(angle) }
}

/**
 * Where a point sits, as CSS. `insetInlineStart` (not `left`) means the arc
 * mirrors itself in Arabic: Fajr on the right, Isha on the left.
 */
function placeAt(t: number): CSSProperties {
  const { x, y } = arcPoint(t)
  return {
    insetInlineStart: `${(x / BOX_W) * PERCENT}%`,
    top: `${(y / BOX_H) * PERCENT}%`,
  }
}

/** SVG path along the arc from `from` to `to` (clockwise on screen: up, over, down). */
function arcPath(from: number, to: number) {
  const start = arcPoint(from)
  const end = arcPoint(to)
  const largeArc = to - from > 1 ? 1 : 0
  return `M${start.x.toFixed(2)},${start.y.toFixed(2)} A${RX},${RY} 0 ${largeArc} 1 ${end.x.toFixed(2)},${end.y.toFixed(2)}`
}

/*
 * Where each label sits next to its dot. Dhuhr and Asr are high on the arc, so
 * their labels hang under the dot. The others are near the horizon at the two
 * edges, so their labels sit beside the dot, on the side facing the middle:
 * Maghrib just above the horizon and Isha just below, so they never collide.
 */
const LABEL_SIDE: Record<PrayerName, string> = {
  fajr: 'start-3 items-start',
  dhuhr: 'top-2.5 items-center',
  asr: 'top-2.5 items-center',
  maghrib: 'end-3 bottom-1 items-end',
  isha: 'end-3 items-end',
}

interface PrayerArcProps {
  now: Date
  prayers: DayPrayers
  next: PrayerName
  language: 'ar' | 'en'
  /** What sits under the dome: the next prayer and how long until it. */
  children?: React.ReactNode
}

/**
 * The five prayers along the sun's path, with the part of the day already
 * lived drawn brighter and a small sun where "now" is. After Isha and before
 * Fajr there is no sun; a crescent shows instead.
 */
export function PrayerArc({ now, prayers, next, language, children }: PrayerArcProps) {
  const { t } = useTranslation()
  const { passed, positions, sun } = sunPath(now, prayers)
  const first = -TWILIGHT_SHARE
  const last = 1 + TWILIGHT_SHARE
  // How much of the path is already lived: none before Fajr, all of it after Isha.
  const lived = sun ?? (now >= prayers.isha ? last : first)

  return (
    <div className="relative mx-auto aspect-[5/3] w-full max-w-lg">
      <svg
        aria-hidden
        viewBox={`0 0 ${BOX_W} ${BOX_H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible rtl:-scale-x-100"
      >
        <line
          x1={HORIZON_INSET}
          x2={BOX_W - HORIZON_INSET}
          y1={CY}
          y2={CY}
          stroke="white"
          strokeOpacity={0.22}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={arcPath(first, last)}
          fill="none"
          stroke="white"
          strokeOpacity={0.28}
          strokeWidth={1.5}
          strokeDasharray="2 5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {lived > first && (
          <path
            d={arcPath(first, lived)}
            fill="none"
            stroke="white"
            strokeOpacity={0.85}
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {sun !== null && (
        <span
          aria-hidden
          style={placeAt(sun)}
          className={cn(
            'sun absolute size-5 -translate-1/2 rounded-full rtl:translate-x-1/2',
            // Under the horizon (dawn before sunrise, dusk after Maghrib) it is a smaller, fainter glow.
            (sun < 0 || sun > 1) && 'size-3.5 opacity-70',
          )}
        />
      )}
      {sun === null && (
        <Moon
          aria-hidden
          className="absolute end-[6%] top-[4%] size-6 -rotate-12 fill-white/90 text-white/90"
        />
      )}

      <ol aria-label={t('today.prayerTimes')}>
        {PRAYER_NAMES.map((name) => {
          const isNext = name === next
          const isPassed = passed.has(name)
          return (
            // The <li> is a zero-size point on the arc; flex centring puts the dot on it.
            <li
              key={name}
              style={placeAt(positions[name])}
              aria-current={isNext ? 'time' : undefined}
              className="absolute flex size-0 items-center justify-center"
            >
              <span
                aria-hidden
                className={cn(
                  'size-2.5 shrink-0 rounded-full border-2',
                  isNext
                    ? 'border-white bg-transparent ring-4 ring-white/20'
                    : isPassed
                      ? 'border-white bg-white'
                      : 'border-white/45 bg-transparent',
                )}
              />
              <span
                className={cn(
                  'absolute flex flex-col whitespace-nowrap',
                  LABEL_SIDE[name],
                  isNext ? 'font-semibold' : 'opacity-75',
                )}
              >
                <span className="text-xs leading-tight sm:text-sm">{t(`prayers.${name}`)}</span>
                <span className="text-[0.6875rem] leading-tight font-normal tabular-nums opacity-85 sm:text-xs">
                  {formatTime(prayers[name], language)}
                </span>
              </span>
            </li>
          )
        })}
      </ol>

      <div className="absolute inset-x-[20%] bottom-[24%] flex flex-col items-center text-center">
        {children}
      </div>
    </div>
  )
}
