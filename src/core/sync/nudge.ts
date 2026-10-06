import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

/**
 * A tiny "I just uploaded something" signal between the owner's devices, so
 * the other device syncs within a second or two instead of waiting for its
 * next scheduled sync.
 *
 * It uses Supabase Realtime *broadcast*: a message passed between open apps
 * that is never stored and carries no data. The data itself still travels
 * only through the normal, RLS-protected sync. A stray or missing nudge is
 * harmless: at worst one extra or one later sync.
 */
export interface SyncNudge {
  /** Tell the other devices to sync. */
  send(): void
  /** Call `onNudge` when another device says it changed something. Returns a stop function. */
  listen(onNudge: () => void): () => void
  /** Re-checks who is signed in, so listening starts after sign-in and follows account changes. */
  refresh(): void
}

const EVENT = 'changed'

export function supabaseNudge(
  client: SupabaseClient,
  getUserId: () => Promise<string | null>,
): SyncNudge {
  let channel: RealtimeChannel | null = null
  let channelUser: string | null = null
  let onNudge: (() => void) | null = null

  // One channel per signed-in owner; re-made if the account changes.
  async function ensureChannel(): Promise<RealtimeChannel | null> {
    const userId = await getUserId()
    if (userId !== channelUser) {
      if (channel) void client.removeChannel(channel)
      channel = null
      channelUser = userId
      if (userId) {
        channel = client
          .channel(`sync:${userId}`, { config: { broadcast: { self: false } } })
          .on('broadcast', { event: EVENT }, () => onNudge?.())
          .subscribe()
      }
    }
    return channel
  }

  return {
    send() {
      void ensureChannel().then((ch) => ch?.send({ type: 'broadcast', event: EVENT, payload: {} }))
    },
    refresh() {
      void ensureChannel()
    },
    listen(callback) {
      onNudge = callback
      void ensureChannel()
      return () => {
        onNudge = null
        if (channel) void client.removeChannel(channel)
        channel = null
        channelUser = null
      }
    },
  }
}
