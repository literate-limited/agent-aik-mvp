import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkspaceFromRequest, apiError } from '@/lib/api-helpers'
import { generateApiKey } from '@/lib/api-keys'
import { createApiKeySchema } from '@/lib/validations'

export async function GET(req: Request) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  const keys = await prisma.apiKey.findMany({
    where: { workspaceId: workspace.id },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(keys)
}

export async function POST(req: Request) {
  const workspace = await getWorkspaceFromRequest(req)
  if (!workspace) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const data = createApiKeySchema.parse(body)
    const { key, hash, prefix } = generateApiKey()

    await prisma.apiKey.create({
      data: {
        name: data.name,
        keyHash: hash,
        keyPrefix: prefix,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        workspaceId: workspace.id,
      },
    })

    // Return the full key only once
    return NextResponse.json({ key, prefix }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') return apiError(error.errors, 400)
    return apiError('Internal server error', 500)
  }
}
