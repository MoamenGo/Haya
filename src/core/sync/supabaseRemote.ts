import type { SupabaseClient } from '@supabase/supabase-js'
import { RemoteError, type SyncRemote, type WireRow } from './remote'
import type { SyncTable } from './tables'

/** The real cloud: Supabase's REST API over the tables in supabase/migrations. */
export function supabaseRemote(client: SupabaseClient): SyncRemote {
  return {
    async push(table: SyncTable, rows: WireRow[]) {
      const { error } = await client.from(table).upsert(rows, { onConflict: 'id' })
      if (error) throw new RemoteError(`${table}: ${error.message}`, error.code)
    },

    async pull(table: SyncTable, since: string | null, limit: number) {
      let query = client.from(table).select('*')
      if (since) query = query.gt('server_updated_at', since)
      const { data, error } = await query
        .order('server_updated_at', { ascending: true })
        .limit(limit)
      if (error) throw new RemoteError(`${table}: ${error.message}`, error.code)
      return (data ?? []) as WireRow[]
    },
  }
}
