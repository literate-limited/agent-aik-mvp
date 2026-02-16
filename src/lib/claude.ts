import Anthropic from '@anthropic-ai/sdk'

function getClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'dummy',
  })
}

export interface AgentExecutionParams {
  systemPrompt: string
  userMessage: string
  model?: string
  maxTokens?: number
  tools?: Anthropic.Tool[]
}

export interface AgentExecutionResult {
  content: string
  tokensUsed: { input: number; output: number }
  model: string
  stopReason: string | null
}

export async function executeAgent(params: AgentExecutionParams): Promise<AgentExecutionResult> {
  const {
    systemPrompt,
    userMessage,
    model = 'claude-sonnet-4-20250514',
    maxTokens = 4096,
    tools,
  } = params

  const response = await getClient().messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    ...(tools && tools.length > 0 ? { tools } : {}),
  })

  const textContent = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === 'text')
    .map((c) => c.text)
    .join('\n')

  return {
    content: textContent,
    tokensUsed: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
    model: response.model,
    stopReason: response.stop_reason,
  }
}

// Cost calculation (cents) based on model
export function calculateCost(model: string, input: number, output: number): number {
  const rates: Record<string, { input: number; output: number }> = {
    'claude-sonnet-4-20250514': { input: 0.3, output: 1.5 },      // per 100k tokens in cents
    'claude-haiku-4-20250514': { input: 0.025, output: 0.125 },
    'claude-opus-4-20250514': { input: 1.5, output: 7.5 },
  }
  const rate = rates[model] || rates['claude-sonnet-4-20250514']
  return Math.ceil((input * rate.input + output * rate.output) / 100000)
}

// Prompt templates
export const PROMPT_TEMPLATES = {
  customerSupport: `You are a customer support agent. Be helpful, empathetic, and solution-oriented.
Answer questions based on the provided context. If you don't know, say so honestly.`,

  dataAnalysis: `You are a data analysis agent. Analyze the provided data and return insights.
Be precise with numbers. Use structured formats when appropriate.`,

  contentWriter: `You are a content writing agent. Write clear, engaging content.
Match the tone and style requested. Be creative but factual.`,

  codeAssistant: `You are a code assistant agent. Help with programming tasks.
Write clean, well-documented code. Explain your reasoning.`,

  summarizer: `You are a summarization agent. Condense information into key points.
Maintain accuracy while being concise. Highlight action items.`,
}
