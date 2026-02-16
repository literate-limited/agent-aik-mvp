import { randomBytes, createHash } from 'crypto'
import { prisma } from './prisma'

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `aik_${randomBytes(32).toString('hex')}`
  const hash = createHash('sha256').update(key).digest('hex')
  const prefix = key.slice(0, 12)
  return { key, hash, prefix }
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export async function validateApiKey(key: string) {
  const hash = hashApiKey(key)
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    include: { workspace: true },
  })

  if (!apiKey) return null
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return apiKey
}
