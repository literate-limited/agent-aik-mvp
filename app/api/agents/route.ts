import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkspaceFromRequest, apiError } from '@/lib/api-helpers'
import { createAgentSchema } from '@/lib/validations'

export async function GET(req: Request) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  const agents = await prisma.agent.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { executions: true } },
    },
  })

  return NextResponse.json(agents)
}

export async function POST(req: Request) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const data = createAgentSchema.parse(body)

    const agent = await prisma.agent.create({
      data: {
        ...data,
        tools: JSON.stringify(data.tools),
        config: JSON.stringify(data.config),
        workspaceId: workspace.id,
      },
    })

    return NextResponse.json(agent, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') return apiError(error.errors, 400)
    console.error('Create agent error:', error)
    return apiError('Internal server error', 500)
  }
}
