import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await hash(data.password, 12)
    const slug = data.workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const slugExists = await prisma.workspace.findUnique({ where: { slug } })
    if (slugExists) {
      return NextResponse.json({ error: 'Workspace name taken' }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        memberships: {
          create: {
            role: 'OWNER',
            workspace: {
              create: {
                name: data.workspaceName,
                slug,
              },
            },
          },
        },
      },
      include: { memberships: { include: { workspace: true } } },
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      workspace: user.memberships[0].workspace.slug,
    }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
