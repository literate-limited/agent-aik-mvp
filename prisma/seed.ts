import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const passwordHash = await hash('demo1234', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@agentaik.com' },
    update: {},
    create: {
      email: 'demo@agentaik.com',
      name: 'Demo User',
      passwordHash,
    },
  })

  // Create demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      plan: 'STANDARD',
      members: {
        create: { userId: user.id, role: 'OWNER' },
      },
    },
  })

  // Create demo agent
  await prisma.agent.upsert({
    where: { id: 'demo-agent-1' },
    update: {},
    create: {
      id: 'demo-agent-1',
      name: 'Customer Support Agent',
      description: 'Handles customer inquiries and FAQ',
      systemPrompt: 'You are a helpful customer support agent. Answer questions clearly and concisely.',
      model: 'claude-sonnet-4-20250514',
      workspaceId: workspace.id,
      tools: JSON.stringify([
        { name: 'search_kb', description: 'Search knowledge base' },
        { name: 'create_ticket', description: 'Create support ticket' },
      ]),
    },
  })

  // Create demo workflow
  const workflow = await prisma.workflow.upsert({
    where: { id: 'demo-workflow-1' },
    update: {},
    create: {
      id: 'demo-workflow-1',
      name: 'Customer Inquiry Pipeline',
      description: 'Classify and route customer inquiries',
      status: 'ACTIVE',
      workspaceId: workspace.id,
    },
  })

  await prisma.workflowStep.createMany({
    data: [
      {
        name: 'Classify Intent',
        type: 'AGENT',
        workflowId: workflow.id,
        agentId: 'demo-agent-1',
        order: 0,
        position: JSON.stringify({ x: 250, y: 50 }),
        config: JSON.stringify({ prompt: 'Classify the customer intent' }),
      },
      {
        name: 'Route Decision',
        type: 'CONDITION',
        workflowId: workflow.id,
        order: 1,
        position: JSON.stringify({ x: 250, y: 200 }),
        config: JSON.stringify({ condition: 'intent === "billing"' }),
      },
      {
        name: 'Generate Response',
        type: 'AGENT',
        workflowId: workflow.id,
        agentId: 'demo-agent-1',
        order: 2,
        position: JSON.stringify({ x: 250, y: 350 }),
        config: JSON.stringify({ prompt: 'Generate a response' }),
      },
    ],
    skipDuplicates: true,
  })

  console.log('Seed complete:', { user: user.email, workspace: workspace.slug })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
