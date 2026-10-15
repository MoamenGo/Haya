import { v7 as uuidv7 } from 'uuid'
import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { LearningPathRow, LearningPathStatus, StudyItemRow } from '@/core/db/types'
import { MAX_ACTIVE_PATHS } from '@/core/learning/config'
import { ADDED_KEY_PREFIX, isAddedKey } from '@/core/learning/edits'
import { CUSTOM_PLAN_PREFIX, isBuiltInPlan, type StudyItem } from '@/core/learning/types'
import { planInput, startDateInput, stepInput, type PlanInput, type StepInput } from './schema'

/** The only code that reads or writes `learning_paths`, `study_checks` and `study_items`. */

export class TooManyActivePathsError extends Error {
  constructor() {
    super(`At most ${MAX_ACTIVE_PATHS} learning paths can be active.`)
  }
}

/** All plans, active first. */
export async function listPaths(): Promise<LearningPathRow[]> {
  const rows = await db.learning_paths.toArray()
  const order: Record<LearningPathStatus, number> = { active: 0, paused: 1, done: 2 }
  return rows
    .filter((r) => !r.deleted_at)
    .sort((a, b) => order[a.status] - order[b.status] || a.created_at.localeCompare(b.created_at))
}

export async function listActivePaths(): Promise<LearningPathRow[]> {
  return (await listPaths()).filter((p) => p.status === 'active')
}

export async function getPath(id: string): Promise<LearningPathRow | undefined> {
  const row = await db.learning_paths.get(id)
  return row && !row.deleted_at ? row : undefined
}

async function activeCount(exceptId?: string): Promise<number> {
  const active = await db.learning_paths.where('status').equals('active').toArray()
  return active.filter((p) => !p.deleted_at && p.id !== exceptId).length
}

/**
 * A new plan the owner writes himself. It starts active when there is room
 * under the limit, otherwise paused ("not now"), never refused.
 */
export async function createPath(input: PlanInput): Promise<LearningPathRow> {
  const valid = planInput.parse(input)
  return db.transaction('rw', db.learning_paths, async () => {
    const row: LearningPathRow = {
      ...newRowMeta(),
      curriculum_key: `${CUSTOM_PLAN_PREFIX}${uuidv7()}`,
      title: valid.title,
      status: (await activeCount()) < MAX_ACTIVE_PATHS ? 'active' : 'paused',
      start_date: valid.start_date,
      total_weeks: valid.total_weeks,
    }
    await db.learning_paths.add(row)
    return row
  })
}

/** Renames a plan, moves its start, and (custom plans only) changes its length. */
export async function updatePath(path: LearningPathRow, input: PlanInput): Promise<void> {
  const valid = planInput.parse(input)
  await db.learning_paths.update(path.id, {
    title: valid.title,
    start_date: valid.start_date,
    total_weeks: isBuiltInPlan(path.curriculum_key) ? null : valid.total_weeks,
    ...touchMeta(),
  })
}

/**
 * Deletes a plan the owner wrote, with its steps and ticks (soft delete, so
 * it syncs). Built-in plans can only be paused or finished.
 */
export async function deletePath(path: LearningPathRow): Promise<void> {
  if (isBuiltInPlan(path.curriculum_key)) throw new Error('Built-in plans cannot be deleted')
  await db.transaction('rw', db.learning_paths, db.study_items, db.study_checks, async () => {
    const meta = touchMeta()
    const gone = { deleted_at: meta.updated_at, ...meta }
    await db.learning_paths.update(path.id, gone)
    await db.study_items.where('path_id').equals(path.id).modify(gone)
    await db.study_checks.where('path_id').equals(path.id).modify(gone)
  })
}

/** Pause, resume or finish a plan. Resuming respects the active-paths limit. */
export async function setPathStatus(id: string, status: LearningPathStatus): Promise<void> {
  await db.transaction('rw', db.learning_paths, async () => {
    if (status === 'active') {
      if ((await activeCount(id)) >= MAX_ACTIVE_PATHS) throw new TooManyActivePathsError()
    }
    await db.learning_paths.update(id, { status, ...touchMeta() })
  })
}

export async function setPathStart(id: string, startDate: string): Promise<void> {
  const valid = startDateInput.parse(startDate)
  await db.learning_paths.update(id, { start_date: valid, ...touchMeta() })
}

/** Keys of a plan's ticked items. */
export async function checkedKeys(pathId: string): Promise<Set<string>> {
  const rows = await db.study_checks.where('path_id').equals(pathId).toArray()
  return new Set(rows.filter((r) => !r.deleted_at).map((r) => r.item_key))
}

/**
 * Ticks or unticks one plan item. An untick is a soft delete; ticking again
 * brings the same row back (one row per item, see the unique index).
 */
export async function setChecked(
  pathId: string,
  itemKey: string,
  checked: boolean,
  dateISO: string,
): Promise<void> {
  await db.transaction('rw', db.study_checks, async () => {
    const existing = await db.study_checks.where({ path_id: pathId, item_key: itemKey }).first()
    if (checked) {
      if (existing) {
        await db.study_checks.update(existing.id, {
          deleted_at: null,
          date: dateISO,
          ...touchMeta(),
        })
      } else {
        await db.study_checks.add({
          ...newRowMeta(),
          path_id: pathId,
          item_key: itemKey,
          date: dateISO,
        })
      }
    } else if (existing && !existing.deleted_at) {
      const meta = touchMeta()
      await db.study_checks.update(existing.id, { deleted_at: meta.updated_at, ...meta })
    }
  })
}

/** The owner's steps and edits of one plan (live rows only). */
export async function listItemEdits(pathId: string): Promise<StudyItemRow[]> {
  const rows = await db.study_items.where('path_id').equals(pathId).toArray()
  return rows.filter((r) => !r.deleted_at)
}

type StepFields = Pick<
  StudyItemRow,
  'text' | 'minutes' | 'kind' | 'link_title' | 'link_url' | 'hidden'
>

/**
 * Writes the one `study_items` row for a step: revives a soft-deleted row
 * with the same key (the unique index allows one per step) or adds a new one.
 */
async function putStep(
  pathId: string,
  itemKey: string,
  week: number,
  day: number | null,
  fields: StepFields,
): Promise<void> {
  await db.transaction('rw', db.study_items, async () => {
    const existing = await db.study_items.where({ path_id: pathId, item_key: itemKey }).first()
    if (existing) {
      await db.study_items.update(existing.id, { ...fields, deleted_at: null, ...touchMeta() })
    } else {
      await db.study_items.add({
        ...newRowMeta(),
        path_id: pathId,
        item_key: itemKey,
        week,
        day,
        ...fields,
      })
    }
  })
}

/** Adds the owner's own step to a day of a plan's week. */
export async function addStep(
  pathId: string,
  week: number,
  day: number,
  input: StepInput,
): Promise<void> {
  const valid = stepInput.parse(input)
  await putStep(pathId, `${ADDED_KEY_PREFIX}${uuidv7()}`, week, day, { ...valid, hidden: false })
}

/** Saves a change to any step: his own, or a built-in one (kept as an edit). */
export async function editStep(
  pathId: string,
  week: number,
  item: StudyItem,
  input: StepInput,
): Promise<void> {
  const valid = stepInput.parse(input)
  if (isAddedKey(item.key)) {
    const row = await db.study_items.where({ path_id: pathId, item_key: item.key }).first()
    if (!row) throw new Error('Step not found')
    await db.study_items.update(row.id, { ...valid, ...touchMeta() })
    return
  }
  await putStep(pathId, item.key, week, null, { ...valid, hidden: false })
}

/** Takes a built-in step out of his plan, keeping it so it can come back. */
export async function hideStep(pathId: string, week: number, item: StudyItem): Promise<void> {
  const row = await db.study_items.where({ path_id: pathId, item_key: item.key }).first()
  if (row && !row.deleted_at) {
    await db.study_items.update(row.id, { hidden: true, ...touchMeta() })
    return
  }
  await putStep(pathId, item.key, week, null, {
    text: item.text,
    minutes: item.minutes,
    kind: item.kind,
    link_title: item.link?.title ?? null,
    link_url: item.link?.url ?? null,
    hidden: true,
  })
}

/**
 * Removes his change to a step: a step he added is deleted, a built-in step
 * goes back to how the plan wrote it (and shows again if it was hidden).
 */
export async function resetStep(pathId: string, itemKey: string): Promise<void> {
  const row = await db.study_items.where({ path_id: pathId, item_key: itemKey }).first()
  if (!row || row.deleted_at) return
  const meta = touchMeta()
  await db.study_items.update(row.id, { deleted_at: meta.updated_at, ...meta })
}

/**
 * Copies the steps he added to one week into another week, same days. Handy
 * for plans that repeat ("Anki every day"). Returns how many were copied.
 */
export async function copyWeekSteps(
  pathId: string,
  fromWeek: number,
  toWeek: number,
): Promise<number> {
  const own = (await listItemEdits(pathId)).filter(
    (r) => isAddedKey(r.item_key) && r.week === fromWeek,
  )
  own.sort((a, b) => a.created_at.localeCompare(b.created_at))
  for (const row of own) {
    await putStep(pathId, `${ADDED_KEY_PREFIX}${uuidv7()}`, toWeek, row.day, {
      text: row.text,
      minutes: row.minutes,
      kind: row.kind,
      link_title: row.link_title,
      link_url: row.link_url,
      hidden: false,
    })
  }
  return own.length
}

/**
 * Brings a hidden built-in step back. If he never changed its text, his row
 * goes away entirely, so the step follows the plan's own wording again.
 */
export async function showStep(pathId: string, original: StudyItem): Promise<void> {
  const row = await db.study_items.where({ path_id: pathId, item_key: original.key }).first()
  if (!row || row.deleted_at) return
  const unchanged =
    row.text === original.text &&
    row.minutes === original.minutes &&
    row.kind === original.kind &&
    row.link_title === (original.link?.title ?? null) &&
    row.link_url === (original.link?.url ?? null)
  if (unchanged) await resetStep(pathId, original.key)
  else await db.study_items.update(row.id, { hidden: false, ...touchMeta() })
}
