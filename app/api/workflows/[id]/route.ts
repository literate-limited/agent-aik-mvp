import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkspaceFromRequest, apiError } from '@/lib/api-helpers'
import { updateWorkflowSchema } from '@/lib/validations'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  const workflow = await prisma.workflow.findFirst({
    where: { id: params.id, workspaceId: workspace.id },
    include: {
      steps: { orderBy: { order: 'asc' }, include: { agent: true } },
      executions: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })

  if (!workflow) return apiError('Workflow not found', 404)
  return NextResponse.json(workflow)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const { steps, ...data } = updateWorkflowSchema.parse(body)

    // Update workflow
    const workflow = await prisma.workflow.updateMany({
      where: { id: params.id, workspaceId: workspace.id },
      data: {
        ...data,
        ...(data.trigger ? { trigger: JSON.stringify(data.trigger) } : {}),
        ...(data.config ? { config: JSON.stringify(data.config) } : {}),
      },
    })
    if (workflow.count === 0) return apiError('Workflow not found', 404)

    // Update steps if provided
    if (steps) {
      await prisma.workflowStep.deleteMany({ where: { workflowId: params.id } })
      await prisma.workflowStep.createMany({
        data: steps.map((s) => ({
          name: s.name,
          type: s.type,
          config: JSON.stringify(s.config),
          position: JSON.stringify(s.position),
          order: s.order,
          workflowId: params.id,
          agentId: s.agentId || null,
        })),
      })
    }

    const updated = await prisma.workflow.findUnique({
      where: { id: params.id },
      include: { steps: { orderBy: { order: 'asc' } } },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.name === 'ZodError') return apiError(error.errors, 400)
    return apiError('Internal server error', 500)
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  const result = await prisma.workflow.deleteMany({
    where: { id: params.id, workspaceId: workspace.id },
  })
  if (result.count === 0) return apiError('Workflow not found', 404)
  return NextResponse.json({ deleted: true })
}
