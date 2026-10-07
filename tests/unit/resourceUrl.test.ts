import { describe, expect, it } from 'vitest'
import { guessResourceType, normalizeUrl, parseUrl } from '@/core/resources/url'

const norm = (text: string) => normalizeUrl(parseUrl(text)!)
const type = (text: string) => guessResourceType(parseUrl(text)!)

describe('parseUrl', () => {
  it('accepts links with or without https://', () => {
    expect(parseUrl('example.com/a')?.href).toBe('https://example.com/a')
    expect(parseUrl(' http://x.org ')?.hostname).toBe('x.org')
  })

  it('rejects text that is not a web link', () => {
    expect(parseUrl('')).toBeNull()
    expect(parseUrl('ملاحظة')).toBeNull()
    expect(parseUrl('javascript:alert(1)')).toBeNull()
    expect(parseUrl('localhost')).toBeNull()
  })
})

describe('normalizeUrl', () => {
  it('drops www, tracking parameters and a trailing slash', () => {
    expect(norm('https://www.Example.com/course/?utm_source=x&b=2&a=1&fbclid=z')).toBe(
      'https://example.com/course?a=1&b=2',
    )
  })

  it('makes the same page match however it was pasted', () => {
    expect(norm('http://example.com/a/')).toBe(norm('https://www.example.com/a?utm_medium=y'))
  })
})

describe('guessResourceType', () => {
  it('reads common hosts', () => {
    expect(type('https://www.youtube.com/watch?v=abc')).toBe('video')
    expect(type('https://youtube.com/playlist?list=PL1')).toBe('playlist')
    expect(type('github.com/ts-fsrs/ts-fsrs')).toBe('repository')
    expect(type('https://arxiv.org/abs/1706.03762')).toBe('paper')
    expect(type('https://www.coursera.org/learn/machine-learning')).toBe('course')
    expect(type('https://docs.python.org/3/')).toBe('documentation')
    expect(type('https://example.com/notes')).toBe('other')
  })
})
