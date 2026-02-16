'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GitBranch, Plus } from 'lucide-react'

interface Workflow {
  id: string
  name: string
  description: string | null
  status: string
  steps: any[]
  createdAt: string
  _count: { executions: number }
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/workflows')
      .then((r) => r.json())
      .then(setWorkflows)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Workflows</h1>
        <Link href="/workflows/new">
          <Button><Plus className="h-4 w-4 mr-2" /> New Workflow</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : workflows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No workflows yet</p>
            <Link href="/workflows/new"><Button>Create Your First Workflow</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((wf) => (
            <Link key={wf.id} href={`/workflows/${wf.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{wf.name}</CardTitle>
                    <Badge variant={wf.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {wf.status}
                    </Badge>
                  </div>
                  <CardDescription>{wf.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{wf.steps.length} steps</span>
                    <span>{wf._count.executions} runs</span>
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
