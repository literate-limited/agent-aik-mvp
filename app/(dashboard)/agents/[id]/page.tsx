'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { formatDate, formatDuration, formatTokens } from '@/lib/utils'

interface Execution {
  id: string
  status: string
  input: any
  output: any
  tokensUsed: number
  costCents: number
  durationMs: number | null
  createdAt: string
}

interface Agent {
  id: string
  name: string
  description: string | null
  systemPrompt: string
  model: string
  status: string
  executions: Execution[]
  _count: { executions: number }
}

export default function AgentDetailPage() {
  const params = useParams()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [message, setMessage] = useState('')
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/agents/${params.id}`)
      .then((r) => r.json())
      .then(setAgent)
  }, [params.id])

  const execute = async () => {
    if (!message.trim()) return
    setExecuting(true)
    setResult(null)

    try {
      const res = await fetch(`/api/agents/${params.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      setResult(data)

      // Refresh agent to update executions
      const agentRes = await fetch(`/api/agents/${params.id}`)
      setAgent(await agentRes.json())
    } catch (e) {
      setResult({ error: 'Execution failed' })
    } finally {
      setExecuting(false)
    }
  }

  if (!agent) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <p className="text-muted-foreground mt-1">{agent.description}</p>
        </div>
        <Badge variant={agent.status === 'ACTIVE' ? 'success' : 'secondary'} className="text-sm">
          {agent.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Execute Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Agent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message to test the agent..."
              rows={4}
            />
            <Button onClick={execute} disabled={executing || !message.trim()}>
              {executing ? 'Running...' : 'Execute'}
            </Button>

            {result && (
              <div className="mt-4 p-4 rounded-md bg-muted">
                {result.error ? (
                  <p className="text-destructive">{result.error}</p>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-sm">{result.content}</p>
                    <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                      <span>Tokens: {formatTokens(result.tokensUsed?.input + result.tokensUsed?.output)}</span>
                      <span>Cost: ${(result.costCents / 100).toFixed(4)}</span>
                      <span>Time: {formatDuration(result.durationMs)}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Config Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Model:</span> {agent.model}
            </div>
            <div>
              <span className="font-medium">Total Executions:</span> {agent._count.executions}
            </div>
            <div>
              <span className="font-medium">System Prompt:</span>
              <pre className="mt-1 p-3 bg-muted rounded-md text-xs whitespace-pre-wrap">
                {agent.systemPrompt}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Executions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          {agent.executions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No executions yet</p>
          ) : (
            <div className="space-y-3">
              {agent.executions.map((exec) => (
                <div key={exec.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          exec.status === 'COMPLETED' ? 'success' :
                          exec.status === 'FAILED' ? 'destructive' : 'secondary'
                        }
                      >
                        {exec.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground truncate">
                        {typeof exec.input === 'object' ? (exec.input as any).message?.slice(0, 60) : '...'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {formatTokens(exec.tokensUsed)} tokens · {exec.durationMs ? formatDuration(exec.durationMs) : '—'} · {formatDate(exec.createdAt)}
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
