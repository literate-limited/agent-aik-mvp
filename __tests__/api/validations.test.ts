import { describe, it, expect } from 'vitest'
import {
  createAgentSchema,
  updateAgentSchema,
  createWorkflowSchema,
  executeAgentSchema,
  createApiKeySchema,
  registerSchema,
} from '@/lib/validations'

describe('createAgentSchema', () => {
  it('validates a valid agent', () => {
    const result = createAgentSchema.parse({
      name: 'Test Agent',
      systemPrompt: 'You are helpful.',
    })
    expect(result.name).toBe('Test Agent')
    expect(result.model).toBe('claude-sonnet-4-20250514')
    expect(result.tools).toEqual([])
  })

  it('rejects empty name', () => {
    expect(() => createAgentSchema.parse({ name: '', systemPrompt: 'test' })).toThrow()
  })

  it('rejects missing systemPrompt', () => {
    expect(() => createAgentSchema.parse({ name: 'Test' })).toThrow()
  })

  it('accepts tools array', () => {
    const result = createAgentSchema.parse({
      name: 'Agent',
      systemPrompt: 'Prompt',
      tools: [{ name: 'search', description: 'Search' }],
    })
    expect(result.tools).toHaveLength(1)
  })
})

describe('updateAgentSchema', () => {
  it('allows partial updates', () => {
    const result = updateAgentSchema.parse({ name: 'New Name' })
    expect(result.name).toBe('New Name')
    expect(result.systemPrompt).toBeUndefined()
  })
})

describe('createWorkflowSchema', () => {
  it('validates a valid workflow', () => {
    const result = createWorkflowSchema.parse({ name: 'My Workflow' })
    expect(result.name).toBe('My Workflow')
  })
})

describe('executeAgentSchema', () => {
  it('validates execution params', () => {
    const result = executeAgentSchema.parse({ message: 'Hello' })
    expect(result.message).toBe('Hello')
  })

  it('rejects empty message', () => {
    expect(() => executeAgentSchema.parse({ message: '' })).toThrow()
  })

  it('accepts optional maxTokens', () => {
    const result = executeAgentSchema.parse({ message: 'Hi', maxTokens: 1000 })
    expect(result.maxTokens).toBe(1000)
  })
})

describe('createApiKeySchema', () => {
  it('validates key creation', () => {
    const result = createApiKeySchema.parse({ name: 'Production' })
    expect(result.name).toBe('Production')
  })
})

describe('registerSchema', () => {
  it('validates registration', () => {
    const result = registerSchema.parse({
      name: 'John',
      email: 'john@example.com',
      password: 'password123',
      workspaceName: 'My Workspace',
    })
    expect(result.email).toBe('john@example.com')
  })

  it('rejects short password', () => {
    expect(() =>
      registerSchema.parse({
        name: 'John',
        email: 'john@example.com',
        password: 'short',
        workspaceName: 'Workspace',
      })
    ).toThrow()
  })

  it('rejects invalid email', () => {
    expect(() =>
      registerSchema.parse({
        name: 'John',
        email: 'not-an-email',
        password: 'password123',
        workspaceName: 'Workspace',
      })
    ).toThrow()
  })
})
