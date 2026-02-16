import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkspaceFromRequest, apiError } from '@/lib/api-helpers'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  const execution = await prisma.execution.findFirst({
    where: { id: params.id, workspaceId: workspace.id },
    include: {
      agent: { select: { id: true, name: true } },
      workflow: { select: { id: true, name: true } },
      logs: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!execution) return apiError('Execution not found', 404)
  return NextResponse.json(execution)
}
