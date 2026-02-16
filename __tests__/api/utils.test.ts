import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatDuration, formatTokens } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('merges tailwind conflicts', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })
})

describe('formatDuration', () => {
  it('formats milliseconds', () => {
    expect(formatDuration(500)).toBe('500ms')
  })

  it('formats seconds', () => {
    expect(formatDuration(2500)).toBe('2.5s')
  })

  it('formats minutes', () => {
    expect(formatDuration(120000)).toBe('2.0m')
  })
})

describe('formatTokens', () => {
  it('formats small numbers', () => {
    expect(formatTokens(500)).toBe('500')
  })

  it('formats thousands', () => {
    expect(formatTokens(1500)).toBe('1.5k')
  })
})
