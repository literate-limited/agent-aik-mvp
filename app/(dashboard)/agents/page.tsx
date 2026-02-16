'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, Plus } from 'lucide-react'

interface Agent {
  id: string
  name: string
  description: string | null
  model: string
  status: string
  createdAt: string
  _count: { executions: number }
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => r.json())
      .then(setAgents)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Agents</h1>
        <Link href="/agents/new">
          <Button><Plus className="h-4 w-4 mr-2" /> New Agent</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : agents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No agents yet</p>
            <Link href="/agents/new"><Button>Create Your First Agent</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/agents/${agent.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <Badge variant={agent.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {agent.status}
                    </Badge>
                  </div>
                  <CardDescription>{agent.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{agent.model}</span>
                    <span>{agent._count.executions} executions</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
