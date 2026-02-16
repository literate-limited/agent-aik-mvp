import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkspaceFromRequest, apiError } from '@/lib/api-helpers'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  const result = await prisma.apiKey.deleteMany({
    where: { id: params.id, workspaceId: workspace.id },
  })

  if (result.count === 0) return apiError('API key not found', 404)
  return NextResponse.json({ deleted: true })
}
