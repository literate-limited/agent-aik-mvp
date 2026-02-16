import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkspaceFromRequest, apiError } from '@/lib/api-helpers'
import { updateAgentSchema } from '@/lib/validations'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  const agent = await prisma.agent.findFirst({
    where: { id: params.id, workspaceId: workspace.id },
    include: {
      executions: { orderBy: { createdAt: 'desc' }, take: 20 },
      _count: { select: { executions: true } },
    },
  })

  if (!agent) return apiError('Agent not found', 404)
  return NextResponse.json(agent)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const data = updateAgentSchema.parse(body)

    const agent = await prisma.agent.updateMany({
      where: { id: params.id, workspaceId: workspace.id },
      data: {
        ...data,
        ...(data.tools ? { tools: JSON.stringify(data.tools) } : {}),
        ...(data.config ? { config: JSON.stringify(data.config) } : {}),
      },
    })

    if (agent.count === 0) return apiError('Agent not found', 404)

    const updated = await prisma.agent.findUnique({ where: { id: params.id } })
    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.name === 'ZodError') return apiError(error.errors, 400)
    return apiError('Internal server error', 500)
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  const result = await prisma.agent.deleteMany({
    where: { id: params.id, workspaceId: workspace.id },
  })

  if (result.count === 0) return apiError('Agent not found', 404)
  return NextResponse.json({ deleted: true })
}
