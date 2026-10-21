import type { Table } from 'dexie'
import { BUILT_IN_PLANS_START, PLANS_RESET_AT } from '@/core/learning/config'
import { isBuiltInPlan } from '@/core/learning/types'
import { newRowMeta } from './rows'
import { GERMAN_PLAN_TITLE } from './seed'
import type { LearningPathRow, StudyCheckRow, StudyItemRow } from './types'

/**
 * The owner's restart of 2026-10-21 (ADR-009), run once per device by the
 * Dexie v12 upgrade:
 *   - the German plan (Piece of German) is added, active;
 *   - Dutch is paused, so three plans stay active (CLAUDE.md §6.10);
 *   - every plan starts on Saturday BUILT_IN_PLANS_START;
 *   - every tick is cleared, and every edit of a built-in plan's steps
 *     (the owner's own plans keep their steps: they are the plan).
 *
 * Why the fixed time: a device can upgrade days after another one did. Every
 * row this writes gets `updated_at = PLANS_RESET_AT`, and only rows older than
 * that are touched. A tick, a pause or an edit made after the restart on the
 * other device is newer, so the sync keeps it instead of this late write.
 */
export interface PlanRestartTables {
  paths: Table<LearningPathRow, string>
  checks: Table<StudyCheckRow, string>
  items: Table<StudyItemRow, string>
}

const PAUSED_BY_RESTART = 'dutch_a1_c1'
const ADDED_BY_RESTART = 'german_a1_c1'

const isBefore = (row: { updated_at: string }) =>
  Date.parse(row.updated_at) < Date.parse(PLANS_RESET_AT)

const restartMeta = { updated_at: PLANS_RESET_AT, _dirty: 1 as const }

export async function restartPlans({ paths, checks, items }: PlanRestartTables): Promise<void> {
  const all = await paths.toArray()

  if (!all.some((p) => p.curriculum_key === ADDED_BY_RESTART)) {
    // Each device makes its own row; sync merges them by curriculum_key.
    await paths.add({
      ...newRowMeta(new Date(PLANS_RESET_AT)),
      curriculum_key: ADDED_BY_RESTART,
      title: GERMAN_PLAN_TITLE,
      status: 'active',
      start_date: BUILT_IN_PLANS_START,
      total_weeks: null,
    })
  }

  const builtIn = new Set<string>()
  for (const path of all) {
    if (isBuiltInPlan(path.curriculum_key)) builtIn.add(path.id)
    if (path.deleted_at || !isBefore(path)) continue
    await paths.update(path.id, {
      start_date: BUILT_IN_PLANS_START,
      ...(path.curriculum_key === PAUSED_BY_RESTART ? { status: 'paused' as const } : {}),
      ...(path.curriculum_key === ADDED_BY_RESTART ? { status: 'active' as const } : {}),
      ...restartMeta,
    })
  }

  await checks
    .filter((c) => !c.deleted_at && isBefore(c))
    .modify({ deleted_at: PLANS_RESET_AT, ...restartMeta })

  await items
    .filter((i) => !i.deleted_at && isBefore(i) && builtIn.has(i.path_id))
    .modify({ deleted_at: PLANS_RESET_AT, ...restartMeta })
}
