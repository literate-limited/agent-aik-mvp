'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDuration, formatTokens } from '@/lib/utils'

interface Execution {
  id: string
  status: string
  input: any
  output: any
  error: string | null
  tokensUsed: number
  costCents: number
  durationMs: number | null
  createdAt: string
  agent: { id: string; name: string } | null
  workflow: { id: string; name: string } | null
  logs: { id: string; level: string; message: string; createdAt: string }[]
}

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Execution | null>(null)

  useEffect(() => {
    fetch('/api/executions')
      .then((r) => r.json())
      .then((d) => setExecutions(d.data))
      .finally(() => setLoading(false))
  }, [])

  const statusVariant = (s: string) =>
    s === 'COMPLETED' ? 'success' : s === 'FAILED' ? 'destructive' : s === 'RUNNING' ? 'default' : 'secondary'

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Execution Logs</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">All Executions</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : executions.length === 0 ? (
                <p className="text-muted-foreground">No executions yet</p>
              ) : (
                <div className="space-y-2">
                  {executions.map((exec) => (
                    <div
                      key={exec.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-muted ${selected?.id === exec.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelected(exec)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={statusVariant(exec.status)}>{exec.status}</Badge>
                        <div>
                          <p className="text-sm font-medium">{exec.agent?.name || exec.workflow?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(exec.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        <div>{formatTokens(exec.tokensUsed)} tokens</div>
                        <div>{exec.durationMs ? formatDuration(exec.durationMs) : '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail Panel */}
        <div>
          {selected && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Execution Detail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Status</span>
                  <div><Badge variant={statusVariant(selected.status)}>{selected.status}</Badge></div>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Input</span>
                  <pre className="text-xs bg-muted p-2 rounded mt-1 whitespace-pre-wrap overflow-auto max-h-40">
                    {JSON.stringify(selected.input, null, 2)}
                  </pre>
                </div>
                {selected.output && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Output</span>
                    <pre className="text-xs bg-muted p-2 rounded mt-1 whitespace-pre-wrap overflow-auto max-h-40">
                      {JSON.stringify(selected.output, null, 2)}
                    </pre>
                  </div>
                )}
                {selected.error && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Error</span>
                    <p className="text-sm text-destructive mt-1">{selected.error}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Logs</span>
                  <div className="mt-1 space-y-1">
                    {selected.logs.map((log) => (
                      <div key={log.id} className="text-xs p-1.5 bg-muted rounded">
                        <span className={`font-mono ${log.level === 'ERROR' ? 'text-destructive' : 'text-muted-foreground'}`}>
                          [{log.level}]
                        </span>{' '}
                        {log.message}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Tokens:</span> {formatTokens(selected.tokensUsed)}</div>
                  <div><span className="text-muted-foreground">Cost:</span> ${(selected.costCents / 100).toFixed(4)}</div>
                  <div><span className="text-muted-foreground">Duration:</span> {selected.durationMs ? formatDuration(selected.durationMs) : '—'}</div>
                  <div><span className="text-muted-foreground">ID:</span> {selected.id.slice(0, 8)}...</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
