import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { ResourceRow, ResourceStatus } from '@/core/db/types'
import { guessResourceType, normalizeUrl, parseUrl } from '@/core/resources/url'
import { newResourceInput, type NewResourceInput } from './schema'

/** The only code that reads or writes `resources`. */

export class InvalidUrlError extends Error {
  constructor() {
    super('This is not a web link.')
  }
}

export class DuplicateResourceError extends Error {
  readonly existing: ResourceRow
  constructor(existing: ResourceRow) {
    super('This link is already saved for this goal.')
    this.existing = existing
  }
}

/**
 * Saves a link under a goal (and optionally one of its projects). The URL is
 * cleaned and its type guessed; the same link twice on one goal is refused.
 */
export async function addResource(input: NewResourceInput): Promise<ResourceRow> {
  const valid = newResourceInput.parse(input)
  const url = parseUrl(valid.url)
  if (!url) throw new InvalidUrlError()
  const normalized = normalizeUrl(url)

  return db.transaction('rw', db.resources, async () => {
    const sameLink = await db.resources.where('url_normalized').equals(normalized).toArray()
    const existing = sameLink.find((r) => !r.deleted_at && r.goal_id === valid.goal_id)
    if (existing) throw new DuplicateResourceError(existing)

    const row: ResourceRow = {
      ...newRowMeta(),
      url: url.href,
      url_normalized: normalized,
      title: valid.title,
      type: guessResourceType(url),
      goal_id: valid.goal_id,
      project_id: valid.project_id,
      status: 'queued',
      reliability_note: '',
    }
    await db.resources.add(row)
    return row
  })
}

/** A goal's links, oldest first. */
export async function resourcesForGoal(goalId: string): Promise<ResourceRow[]> {
  const rows = await db.resources.where('goal_id').equals(goalId).toArray()
  return rows.filter((r) => !r.deleted_at).sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export async function setResourceStatus(id: string, status: ResourceStatus): Promise<void> {
  await db.resources.update(id, { status, ...touchMeta() })
}

export async function updateResource(
  id: string,
  change: Partial<Pick<ResourceRow, 'title' | 'project_id'>>,
): Promise<void> {
  await db.resources.update(id, { ...change, ...touchMeta() })
}

/** Soft delete, so the deletion can sync. */
export async function deleteResource(id: string): Promise<void> {
  await db.resources.update(id, { deleted_at: new Date().toISOString(), ...touchMeta() })
}
