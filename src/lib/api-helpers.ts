import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'
import { validateApiKey } from './api-keys'

export async function getWorkspaceFromRequest(req: Request) {
  // Try API key first
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer aik_')) {
    const apiKey = await validateApiKey(authHeader.slice(7))
    if (!apiKey) return null
    return apiKey.workspace
  }

  // Fall back to session
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { memberships: { include: { workspace: true }, take: 1 } },
  })

  return user?.memberships[0]?.workspace ?? null
}

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export function apiSuccess(data: any, status = 200) {
  return NextResponse.json(data, { status })
}
