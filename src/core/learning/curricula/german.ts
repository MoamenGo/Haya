import type { DayType } from '@/core/time/config'
import { GERMAN_MIN, GERMAN_SESSIONS_PER_WEEK } from '../config'
import type { Curriculum, Link, StudyItem, StudyItemKind, WeekOverview } from '../types'
import {
  GERMAN_LEVELS,
  GERMAN_ROADMAP_LINK,
  GERMAN_UNITS,
  PIECE_OF_GERMAN,
  type GermanLevel,
  type GermanSessionSpec,
  type GermanUnit,
} from './germanData'

/** One site day (or extra session) in the order the site teaches them. */
interface GermanSession {
  unit: GermanUnit
  spec: GermanSessionSpec
  /** Stable key, e.g. `a1-w3-d4`: ticks are saved by it. */
  key: string
}

const SESSIONS: readonly GermanSession[] = GERMAN_UNITS.flatMap((unit) =>
  unit.sessions.map((spec) => ({
    unit,
    spec,
    key: `${unit.level.toLowerCase()}-${unit.slug}-${spec.id}`,
  })),
)

const TOTAL_WEEKS = Math.ceil(SESSIONS.length / GERMAN_SESSIONS_PER_WEEK)

/** The site days a plan week covers, in order (the last week may have fewer). */
function sessionsOf(week: number): readonly GermanSession[] {
  const first = (week - 1) * GERMAN_SESSIONS_PER_WEEK
  return SESSIONS.slice(first, first + GERMAN_SESSIONS_PER_WEEK)
}

function unitLink(unit: GermanUnit): Link {
  return { title: `${unit.name} من ${unit.level}`, url: unit.url }
}

function levelTitle(level: GermanLevel): string {
  return GERMAN_LEVELS.find((l) => l.level === level)?.title ?? ''
}

/**
 * «اليوم 3 في الأسبوع 2 من مستوى A1». Arabic first and no separators between
 * Latin bits, so the line reads in the right order in RTL.
 */
function describe(s: GermanSession): string {
  return `${s.spec.label} في ${s.unit.name} من مستوى ${s.unit.level}`
}

function sessionKind(s: GermanSession): StudyItemKind {
  if (s.unit.slug === 'exam') return 'check'
  if (s.spec.id === 'review') return 'review'
  return 'study'
}

function sessionItem(s: GermanSession): StudyItem {
  return {
    key: s.key,
    text: `${describe(s)} على Piece of German`,
    minutes: GERMAN_MIN.session,
    kind: sessionKind(s),
    link: unitLink(s.unit),
  }
}

/**
 * Which days of the week get a site day: deep-work days first, then Friday
 * (rest), then custom days, then hospital days, each in date order. The
 * chosen days then take the sessions in the site's order. With the usual week
 * that is Monday, Tuesday, Thursday and Friday; an exam or a day off moved in
 * the week view only moves the sessions inside that week.
 */
const DAY_PRIORITY: Readonly<Record<DayType, number>> = {
  deep_work: 0,
  rest: 1,
  custom: 2,
  hospital: 3,
}

function sessionDays(dayTypes: readonly DayType[], count: number): number[] {
  return dayTypes
    .map((type, day) => ({ type, day }))
    .sort((a, b) => DAY_PRIORITY[a.type] - DAY_PRIORITY[b.type] || a.day - b.day)
    .slice(0, count)
    .map((d) => d.day)
    .sort((a, b) => a - b)
}

/** A short review of the latest site day, for days without one. */
function reviewItem(week: number, day: number, latest: GermanSession | null): StudyItem {
  if (!latest) {
    return {
      key: `w${week}:d${day}:intro`,
      text: 'تعرّف على Piece of German: المحاضرة وخريطة الطريق قبل اليوم الأول',
      minutes: GERMAN_MIN.review,
      kind: 'review',
      link: { title: 'Piece of German', url: PIECE_OF_GERMAN.home },
    }
  }
  return {
    key: `w${week}:d${day}:review`,
    text: `مراجعة: كلمات ونطق ${describe(latest)}`,
    minutes: GERMAN_MIN.review,
    kind: 'review',
    link: unitLink(latest.unit),
  }
}

function planWeek(week: number, dayTypes: readonly DayType[]): StudyItem[][] {
  const sessions = sessionsOf(week)
  const days = sessionDays(dayTypes, sessions.length)
  const before = SESSIONS[(week - 1) * GERMAN_SESSIONS_PER_WEEK - 1] ?? null
  let latest: GermanSession | null = before

  return dayTypes.map((type, day) => {
    const slot = days.indexOf(day)
    const session = slot >= 0 ? sessions[slot] : undefined
    if (session) {
      latest = session
      return [sessionItem(session)]
    }
    // Rest days without a site day stay free; work days get a short review.
    return type === 'rest' ? [] : [reviewItem(week, day, latest)]
  })
}

function overview(week: number): WeekOverview {
  const sessions = sessionsOf(week)
  const first = sessions[0]
  const last = sessions[sessions.length - 1]
  if (!first || !last) {
    return {
      week,
      phase: 'German',
      title: '',
      topics: [],
      project: null,
      milestone: null,
      resources: [GERMAN_ROADMAP_LINK],
    }
  }
  const sameUnit = first.unit === last.unit
  const title = sameUnit
    ? `${first.unit.name} من ${first.unit.level}: ${first.spec.label} لحد ${last.spec.label}`
    : `${describe(first)} لحد ${describe(last)}`
  const units = sessions.map((s) => s.unit).filter((u, i, all) => all.indexOf(u) === i)
  const isLastWeek = week === TOTAL_WEEKS
  const milestone = sessions.some((s) => s.unit.slug === 'exam')
    ? 'أسبوع امتحان A1: Hören und Sprechen و Fit für Goethe A1'
    : sessions.some((s) => s.spec.id === 'review')
      ? 'مراجعة A2 وآخر المستوى'
      : isLastWeek
        ? 'آخر المنشور على الموقع (أكتوبر 2026). الباقي من B1 و B2 و C1 هيتضاف لما ينزل'
        : null
  return {
    week,
    phase: `${first.unit.level} · ${levelTitle(first.unit.level)}`,
    title,
    topics: [
      ...sessions.map((s) => `${describe(s)}، حوالي ${GERMAN_MIN.session} دقيقة`),
      `مراجعة ${GERMAN_MIN.review} دقيقة في الأيام اللي من غير درس`,
    ],
    project: null,
    milestone,
    resources: [...units.map(unitLink), GERMAN_ROADMAP_LINK],
  }
}

export const german: Curriculum = {
  key: 'german_a1_c1',
  totalWeeks: TOTAL_WEEKS,
  overview,
  planWeek,
  minimum: (week, day) => {
    const first = sessionsOf(week)[0]
    return {
      key: `w${week}:d${day}:minimum`,
      text: 'الحد الأدنى: راجع كلمات آخر يوم في Piece of German',
      minutes: GERMAN_MIN.minimum,
      kind: 'review',
      link: first ? unitLink(first.unit) : GERMAN_ROADMAP_LINK,
    }
  },
}

/** How many site days the plan holds (for tests and the ADR). */
export const GERMAN_SESSION_COUNT = SESSIONS.length
