import { z } from 'zod'

export const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().min(1).max(10000),
  model: z.string().default('claude-sonnet-4-20250514'),
  tools: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })).default([]),
  config: z.record(z.any()).default({}),
})

export const updateAgentSchema = createAgentSchema.partial()

export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  trigger: z.record(z.any()).default({}),
  config: z.record(z.any()).default({}),
})

export const updateWorkflowSchema = createWorkflowSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
  steps: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    type: z.enum(['AGENT', 'CONDITION', 'TRANSFORM', 'HTTP_REQUEST', 'DELAY', 'OUTPUT']),
    config: z.record(z.any()).default({}),
    position: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 0 }),
    order: z.number().default(0),
    agentId: z.string().nullable().optional(),
  })).optional(),
})

export const executeAgentSchema = z.object({
  message: z.string().min(1).max(50000),
  model: z.string().optional(),
  maxTokens: z.number().int().min(1).max(100000).optional(),
})

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  expiresAt: z.string().datetime().optional(),
})

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  workspaceName: z.string().min(1).max(100),
})
