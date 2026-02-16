import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkspaceFromRequest, apiError } from '@/lib/api-helpers'
import { createWorkflowSchema } from '@/lib/validations'

export async function GET(req: Request) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  const workflows = await prisma.workflow.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: 'desc' },
    include: {
      steps: { orderBy: { order: 'asc' } },
      _count: { select: { executions: true } },
    },
  })

  return NextResponse.json(workflows)
}

export async function POST(req: Request) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const data = createWorkflowSchema.parse(body)

    const workflow = await prisma.workflow.create({
      data: {
        ...data,
        trigger: JSON.stringify(data.trigger),
        config: JSON.stringify(data.config),
        workspaceId: workspace.id,
      },
      include: { steps: true },
    })

    return NextResponse.json(workflow, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') return apiError(error.errors, 400)
    return apiError('Internal server error', 500)
  }
}
