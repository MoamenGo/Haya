import type { DayType } from '@/core/time/config'
import { DAYS_PER_WEEK } from '@/core/time/date'
import type { Curriculum, Link, PlanKey, StudyItem, StudyItemKind, WeekOverview } from './types'

/**
 * The owner's changes on top of a plan: steps he added and edits of built-in
 * steps. Pure functions over plain data, so the same rules hold on Today, on
 * the plan page and in tests. The database rows (`study_items`) have these fields.
 */
export interface StudyItemEdit {
  item_key: string
  week: number
  /** Day of the week (0 = Saturday) for added steps; null for edits. */
  day: number | null
  text: string
  minutes: number
  kind: StudyItemKind
  link_title: string | null
  link_url: string | null
  hidden: boolean
  created_at: string
}

/** Keys of steps the owner added start with this, so they never clash with built-in keys. */
export const ADDED_KEY_PREFIX = 'x:'

export function isAddedKey(key: string): boolean {
  return key.startsWith(ADDED_KEY_PREFIX)
}

function linkOf(edit: StudyItemEdit): Link | null {
  if (!edit.link_title && !edit.link_url) return null
  return { title: edit.link_title || edit.link_url || '', url: edit.link_url }
}

function itemOf(edit: StudyItemEdit): StudyItem {
  return {
    key: edit.item_key,
    text: edit.text,
    minutes: edit.minutes,
    kind: edit.kind,
    link: linkOf(edit),
  }
}

/** One step as the plan editor shows it: what it is now, and where it came from. */
export interface EditableStep {
  /** The step as the owner follows it (his edit applied). */
  item: StudyItem
  /** The built-in step before his edit; null for a step he added. */
  original: StudyItem | null
  edited: boolean
  hidden: boolean
}

interface EditIndex {
  byKey: Map<string, StudyItemEdit>
  /** Added steps by `week:day`, oldest first. */
  added: Map<string, StudyItemEdit[]>
}

function indexEdits(edits: readonly StudyItemEdit[]): EditIndex {
  const byKey = new Map<string, StudyItemEdit>()
  const added = new Map<string, StudyItemEdit[]>()
  const sorted = [...edits].sort(
    (a, b) => a.created_at.localeCompare(b.created_at) || a.item_key.localeCompare(b.item_key),
  )
  for (const edit of sorted) {
    if (isAddedKey(edit.item_key)) {
      const slot = `${edit.week}:${edit.day ?? 0}`
      added.set(slot, [...(added.get(slot) ?? []), edit])
    } else {
      byKey.set(edit.item_key, edit)
    }
  }
  return { byKey, added }
}

function stepOf(original: StudyItem, index: EditIndex): EditableStep {
  const edit = index.byKey.get(original.key)
  if (!edit) return { item: original, original, edited: false, hidden: false }
  return { item: itemOf(edit), original, edited: true, hidden: edit.hidden }
}

/**
 * Every step of a week, per day (Saturday first), hidden ones included, for
 * the editor. Built-in steps come first in their usual order, then his own.
 */
export function editableWeek(
  base: Curriculum,
  edits: readonly StudyItemEdit[],
  week: number,
  dayTypes: readonly DayType[],
): EditableStep[][] {
  const index = indexEdits(edits)
  const builtIn = week <= base.totalWeeks ? base.planWeek(week, dayTypes) : []
  return Array.from({ length: DAYS_PER_WEEK }, (_, day) => [
    ...(builtIn[day] ?? []).map((item) => stepOf(item, index)),
    ...(index.added.get(`${week}:${day}`) ?? []).map((edit) => ({
      item: itemOf(edit),
      original: null,
      edited: false,
      hidden: false,
    })),
  ])
}

/**
 * The plan as the owner follows it: the base plan with his edits applied,
 * hidden steps removed and his own steps added. `totalWeeks` overrides the
 * base length (custom plans).
 */
export function withEdits(
  base: Curriculum,
  edits: readonly StudyItemEdit[],
  totalWeeks: number = base.totalWeeks,
): Curriculum {
  const index = indexEdits(edits)
  const visible = (days: EditableStep[][]) =>
    days.map((steps) => steps.filter((s) => !s.hidden).map((s) => s.item))

  return {
    key: base.key,
    totalWeeks,
    overview: (week) => base.overview(week),
    planWeek: (week, dayTypes) => visible(editableWeek(base, edits, week, dayTypes)),
    minimum: (week, day) => {
      const builtIn = base.minimum(week, day)
      if (builtIn) {
        const step = stepOf(builtIn, index)
        if (!step.hidden) return step.item
      }
      // Nothing built in: the first step he added to that day stands in.
      const own = index.added.get(`${week}:${day}`)?.[0]
      return own ? itemOf(own) : null
    },
  }
}

/** A plan the owner writes himself: no built-in steps, only his own. */
export function emptyCurriculum(key: PlanKey, totalWeeks: number): Curriculum {
  const overview = (week: number): WeekOverview => ({
    week,
    phase: '',
    title: '',
    topics: [],
    project: null,
    milestone: null,
    resources: [],
  })
  return {
    key,
    totalWeeks,
    overview,
    planWeek: () => Array.from({ length: DAYS_PER_WEEK }, () => []),
    minimum: () => null,
  }
}
