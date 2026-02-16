import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkspaceFromRequest, apiError } from '@/lib/api-helpers'
import { executeAgent, calculateCost } from '@/lib/claude'
import { executeAgentSchema } from '@/lib/validations'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  const agent = await prisma.agent.findFirst({
    where: { id: params.id, workspaceId: workspace.id, status: 'ACTIVE' },
  })
  if (!agent) return apiError('Agent not found or inactive', 404)

  try {
    const body = await req.json()
    const data = executeAgentSchema.parse(body)

    // Create execution record
    const execution = await prisma.execution.create({
      data: {
        input: { message: data.message },
        status: 'RUNNING',
        startedAt: new Date(),
        workspaceId: workspace.id,
        agentId: agent.id,
      },
    })

    // Log start
    await prisma.executionLog.create({
      data: {
        executionId: execution.id,
        level: 'INFO',
        message: `Starting execution with model ${data.model || agent.model}`,
      },
    })

    try {
      const startTime = Date.now()
      const result = await executeAgent({
        systemPrompt: agent.systemPrompt,
        userMessage: data.message,
        model: data.model || agent.model,
        maxTokens: data.maxTokens,
      })
      const durationMs = Date.now() - startTime

      const totalTokens = result.tokensUsed.input + result.tokensUsed.output
      const costCents = calculateCost(result.model, result.tokensUsed.input, result.tokensUsed.output)

      // Update execution
      const completed = await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          output: { content: result.content, stopReason: result.stopReason },
          tokensUsed: totalTokens,
          costCents,
          durationMs,
          completedAt: new Date(),
        },
        include: { logs: true },
      })

      await prisma.executionLog.create({
        data: {
          executionId: execution.id,
          level: 'INFO',
          message: `Completed. Tokens: ${totalTokens}, Cost: $${(costCents / 100).toFixed(4)}, Duration: ${durationMs}ms`,
          metadata: result.tokensUsed,
        },
      })

      return NextResponse.json({
        executionId: completed.id,
        content: result.content,
        tokensUsed: result.tokensUsed,
        costCents,
        durationMs,
        model: result.model,
      })
    } catch (llmError: any) {
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          error: llmError.message,
          completedAt: new Date(),
          durationMs: Date.now() - execution.startedAt!.getTime(),
        },
      })

      await prisma.executionLog.create({
        data: {
          executionId: execution.id,
          level: 'ERROR',
          message: `Execution failed: ${llmError.message}`,
        },
      })

      return apiError(`Execution failed: ${llmError.message}`, 502)
    }
  } catch (error: any) {
    if (error.name === 'ZodError') return apiError(error.errors, 400)
    console.error('Execute error:', error)
    return apiError('Internal server error', 500)
  }
}
