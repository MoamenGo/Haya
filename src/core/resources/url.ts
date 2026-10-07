import type { ResourceType } from '@/core/db/types'

/**
 * Pure helpers for links (CLAUDE.md §6.11): clean a pasted URL so the same
 * source isn't saved twice, and guess what kind of source it is. No network.
 */

/** Query parameters that only track clicks and never change the page. */
const TRACKING_PARAMS = [/^utm_/, /^fbclid$/, /^gclid$/, /^igshid$/, /^si$/, /^ref$/, /^feature$/]

/** Adds https:// when the owner pastes "example.com/x". Returns null if it is not a web link. */
export function parseUrl(input: string): URL | null {
  const text = input.trim()
  if (!text) return null
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`
  try {
    const url = new URL(withScheme)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!url.hostname.includes('.')) return null
    return url
  } catch {
    return null
  }
}

/** The canonical form used for duplicate checks: https, no www, no tracking, no trailing slash. */
export function normalizeUrl(url: URL): string {
  const host = url.hostname
    .toLowerCase()
    .replace(/^www\./, '')
    .replace(/^m\./, '')
  const params = [...url.searchParams.entries()]
    .filter(([key]) => !TRACKING_PARAMS.some((pattern) => pattern.test(key)))
    .sort(([a], [b]) => a.localeCompare(b))
  const query = params.length ? `?${new URLSearchParams(params).toString()}` : ''
  const path = url.pathname.replace(/\/+$/, '')
  return `https://${host}${path}${query}`
}

/** A best guess from the address alone; the owner can always change it. */
export function guessResourceType(url: URL): ResourceType {
  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  const path = url.pathname.toLowerCase()
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
    return url.searchParams.has('list') || path.startsWith('/playlist') ? 'playlist' : 'video'
  }
  if (host === 'github.com' || host === 'gitlab.com') return 'repository'
  if (host === 'arxiv.org' || host === 'doi.org' || host.endsWith('pubmed.ncbi.nlm.nih.gov')) {
    return 'paper'
  }
  if (path.endsWith('.pdf')) return 'paper'
  if (
    ['coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org', 'freecodecamp.org'].includes(host)
  ) {
    return 'course'
  }
  if (host === 'kaggle.com' && path.startsWith('/datasets')) return 'dataset'
  if (host.startsWith('docs.') || path.startsWith('/docs')) return 'documentation'
  if (host === 'medium.com' || host.endsWith('.medium.com') || host === 'dev.to') return 'article'
  return 'other'
}
