/**
 * Cleans the Supabase address from the build settings. Supabase's dashboard
 * also shows longer addresses (like `https://x.supabase.co/rest/v1/`); pasting
 * one of those makes every request fail with "Invalid path specified in
 * request URL". The client needs only the origin, so we keep just that.
 */
export function projectOrigin(raw: string | undefined): string | undefined {
  const value = cleanSetting(raw)
  if (!value) return undefined
  try {
    return new URL(value).origin
  } catch {
    return undefined
  }
}

/** Trims spaces and stray quotes that sneak in when copying a value. */
export function cleanSetting(raw: string | undefined): string | undefined {
  const value = raw
    ?.trim()
    .replace(/^["']|["']$/g, '')
    .trim()
  return value ? value : undefined
}
