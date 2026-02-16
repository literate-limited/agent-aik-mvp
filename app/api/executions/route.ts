import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkspaceFromRequest, apiError } from '@/lib/api-helpers'

export async function GET(req: Request) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const cursor = searchParams.get('cursor') || undefined
  const agentId = searchParams.get('agentId') || undefined
  const status = searchParams.get('status') || undefined

  const executions = await prisma.execution.findMany({
    where: {
      workspaceId: workspace.id,
      ...(agentId ? { agentId } : {}),
      ...(status ? { status: status as any } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      agent: { select: { id: true, name: true } },
      workflow: { select: { id: true, name: true } },
      logs: { orderBy: { createdAt: 'asc' } },
    },
  })

  return NextResponse.json({
    data: executions,
    nextCursor: executions.length === limit ? executions[executions.length - 1].id : null,
  })
}
