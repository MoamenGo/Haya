import { db } from '@/core/db/db'
import { newRowMeta, touchMeta } from '@/core/db/rows'
import type { InboxItemRow } from '@/core/db/types'
import { parseCapture, titleFromCapture } from '@/core/capture/parse'
import { createTask } from '@/modules/tasks/repo'
import type { NewTaskInput } from '@/modules/tasks/schema'

/** The only code that reads or writes `inbox_items`. */

const CAPTURE_MAX = 2000

/** Saves anything typed into the capture box. Works offline: it only writes locally. */
export async function capture(raw: string): Promise<InboxItemRow | null> {
  const parsed = parseCapture(raw.slice(0, CAPTURE_MAX))
  if (!parsed.text) return null
  const row: InboxItemRow = {
    ...newRowMeta(),
    text: parsed.text,
    kind_hint: parsed.kindHint,
    is_important: parsed.isImportant,
    tags: parsed.tags,
    processed_at: null,
    converted_type: null,
    converted_id: null,
  }
  await db.inbox_items.add(row)
  return row
}

/** Unprocessed items, oldest first (first in, first out). */
export async function listInbox(): Promise<InboxItemRow[]> {
  const rows = await db.inbox_items.orderBy('created_at').toArray()
  return rows.filter((r) => !r.processed_at && !r.deleted_at)
}

/** Turns an inbox item into a task, in one transaction so nothing is half-done. */
export async function convertToTask(item: InboxItemRow, task: NewTaskInput): Promise<void> {
  await db.transaction('rw', db.inbox_items, db.tasks, async () => {
    const created = await createTask(task)
    await db.inbox_items.update(item.id, {
      processed_at: new Date().toISOString(),
      converted_type: 'task',
      converted_id: created.id,
      ...touchMeta(),
    })
  })
}

/** One-tap processing: the item's text becomes the task title, `!` becomes priority. */
export async function processAsTask(item: InboxItemRow, dateISO: string | null): Promise<void> {
  await convertToTask(item, {
    title: titleFromCapture(item.text) || item.text,
    scheduled_date: dateISO,
    priority: item.is_important ? 'important' : 'normal',
  })
}

export async function discardItem(itemId: string): Promise<void> {
  const now = new Date().toISOString()
  await db.inbox_items.update(itemId, { processed_at: now, deleted_at: now, ...touchMeta() })
}
