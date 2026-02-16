import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, GitBranch, Activity, DollarSign } from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const workspaceId = user.memberships[0]?.workspaceId
  if (!workspaceId) redirect('/login')

  const [agentCount, workflowCount, recentExecutions, totalTokens] = await Promise.all([
    prisma.agent.count({ where: { workspaceId } }),
    prisma.workflow.count({ where: { workspaceId } }),
    prisma.execution.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { agent: { select: { name: true } } },
    }),
    prisma.execution.aggregate({
      where: { workspaceId },
      _sum: { tokensUsed: true, costCents: true },
    }),
  ])

  const stats = [
    { label: 'Agents', value: agentCount, icon: Bot },
    { label: 'Workflows', value: workflowCount, icon: GitBranch },
    { label: 'Executions', value: recentExecutions.length, icon: Activity },
    { label: 'Total Cost', value: `$${((totalTokens._sum.costCents || 0) / 100).toFixed(2)}`, icon: DollarSign },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentExecutions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No executions yet. Create an agent to get started.</p>
          ) : (
            <div className="space-y-2">
              {recentExecutions.map((exec) => (
                <div key={exec.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium text-sm">{exec.agent?.name || 'Unknown Agent'}</span>
                    <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      exec.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      exec.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      exec.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {exec.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {exec.tokensUsed} tokens · {exec.durationMs ? `${exec.durationMs}ms` : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
