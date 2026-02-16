import { describe, it, expect } from 'vitest'
import { generateApiKey, hashApiKey } from '@/lib/api-keys'

describe('generateApiKey', () => {
  it('generates a key with correct prefix', () => {
    const { key, hash, prefix } = generateApiKey()
    expect(key).toMatch(/^aik_[a-f0-9]{64}$/)
    expect(prefix).toBe(key.slice(0, 12))
    expect(hash).toHaveLength(64)
  })

  it('generates unique keys', () => {
    const a = generateApiKey()
    const b = generateApiKey()
    expect(a.key).not.toBe(b.key)
    expect(a.hash).not.toBe(b.hash)
  })
})

describe('hashApiKey', () => {
  it('produces consistent hash', () => {
    const key = 'aik_test123'
    expect(hashApiKey(key)).toBe(hashApiKey(key))
  })

  it('matches generated hash', () => {
    const { key, hash } = generateApiKey()
    expect(hashApiKey(key)).toBe(hash)
  })
})
