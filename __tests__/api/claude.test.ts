import { describe, it, expect } from 'vitest'
import { calculateCost, PROMPT_TEMPLATES } from '@/lib/claude'

describe('calculateCost', () => {
  it('calculates cost for sonnet', () => {
    const cost = calculateCost('claude-sonnet-4-20250514', 1000, 500)
    expect(cost).toBeGreaterThan(0)
    expect(typeof cost).toBe('number')
  })

  it('calculates cost for haiku (cheaper)', () => {
    const sonnetCost = calculateCost('claude-sonnet-4-20250514', 100000, 50000)
    const haikuCost = calculateCost('claude-haiku-4-20250514', 100000, 50000)
    expect(haikuCost).toBeLessThan(sonnetCost)
  })

  it('calculates cost for opus (most expensive)', () => {
    const opusCost = calculateCost('claude-opus-4-20250514', 100000, 50000)
    const sonnetCost = calculateCost('claude-sonnet-4-20250514', 100000, 50000)
    expect(opusCost).toBeGreaterThan(sonnetCost)
  })

  it('falls back to sonnet for unknown model', () => {
    const unknownCost = calculateCost('unknown-model', 10000, 5000)
    const sonnetCost = calculateCost('claude-sonnet-4-20250514', 10000, 5000)
    expect(unknownCost).toBe(sonnetCost)
  })
})

describe('PROMPT_TEMPLATES', () => {
  it('has all expected templates', () => {
    expect(PROMPT_TEMPLATES.customerSupport).toBeDefined()
    expect(PROMPT_TEMPLATES.dataAnalysis).toBeDefined()
    expect(PROMPT_TEMPLATES.contentWriter).toBeDefined()
    expect(PROMPT_TEMPLATES.codeAssistant).toBeDefined()
    expect(PROMPT_TEMPLATES.summarizer).toBeDefined()
  })

  it('templates are non-empty strings', () => {
    Object.values(PROMPT_TEMPLATES).forEach((template) => {
      expect(typeof template).toBe('string')
      expect(template.length).toBeGreaterThan(10)
    })
  })
})
