'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Save } from 'lucide-react'

const nodeColors: Record<string, string> = {
  AGENT: '#3b82f6',
  CONDITION: '#f59e0b',
  TRANSFORM: '#8b5cf6',
  HTTP_REQUEST: '#10b981',
  DELAY: '#6b7280',
  OUTPUT: '#ef4444',
}

export default function WorkflowEditorPage() {
  const params = useParams()
  const [workflow, setWorkflow] = useState<any>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/workflows/${params.id}`)
      .then((r) => r.json())
      .then((wf) => {
        setWorkflow(wf)
        // Convert steps to React Flow nodes
        const flowNodes: Node[] = wf.steps.map((step: any) => {
          const pos = typeof step.position === 'string' ? JSON.parse(step.position) : step.position
          return {
            id: step.id,
            data: {
              label: (
                <div className="text-center">
                  <div className="text-xs font-semibold">{step.type}</div>
                  <div className="text-sm">{step.name}</div>
                  {step.agent && <div className="text-xs opacity-70">{step.agent.name}</div>}
                </div>
              ),
            },
            position: pos || { x: 250, y: step.order * 150 },
            style: {
              background: nodeColors[step.type] || '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              minWidth: '150px',
            },
          }
        })

        // Create edges between consecutive steps
        const flowEdges: Edge[] = []
        for (let i = 0; i < wf.steps.length - 1; i++) {
          flowEdges.push({
            id: `e-${wf.steps[i].id}-${wf.steps[i + 1].id}`,
            source: wf.steps[i].id,
            target: wf.steps[i + 1].id,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { strokeWidth: 2 },
          })
        }

        setNodes(flowNodes)
        setEdges(flowEdges)
      })
  }, [params.id])

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({ ...connection, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges]
  )

  const addStep = async (type: string) => {
    const name = prompt('Step name:')
    if (!name) return

    const newStep = {
      name,
      type,
      config: {},
      position: { x: 250, y: (workflow?.steps?.length || 0) * 150 + 50 },
      order: workflow?.steps?.length || 0,
    }

    const steps = [...(workflow?.steps || []).map((s: any) => ({
      name: s.name,
      type: s.type,
      config: typeof s.config === 'string' ? JSON.parse(s.config) : s.config,
      position: typeof s.position === 'string' ? JSON.parse(s.position) : s.position,
      order: s.order,
      agentId: s.agentId,
    })), newStep]

    const res = await fetch(`/api/workflows/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps }),
    })

    if (res.ok) {
      // Reload
      window.location.reload()
    }
  }

  const save = async () => {
    setSaving(true)
    // Save node positions back
    const steps = workflow.steps.map((step: any, i: number) => {
      const node = nodes.find((n) => n.id === step.id)
      return {
        name: step.name,
        type: step.type,
        config: typeof step.config === 'string' ? JSON.parse(step.config) : step.config,
        position: node?.position || { x: 250, y: i * 150 },
        order: i,
        agentId: step.agentId,
      }
    })

    await fetch(`/api/workflows/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps }),
    })
    setSaving(false)
  }

  if (!workflow) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">{workflow.name}</h1>
          <p className="text-muted-foreground">{workflow.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={save} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save'}
          </Button>
          <Badge variant={workflow.status === 'ACTIVE' ? 'success' : 'secondary'}>
            {workflow.status}
          </Badge>
        </div>
      </div>

      {/* Add step buttons */}
      <div className="flex gap-2 mb-4">
        {Object.keys(nodeColors).map((type) => (
          <Button key={type} variant="outline" size="sm" onClick={() => addStep(type)}>
            <Plus className="h-3 w-3 mr-1" /> {type.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Flow Editor */}
      <Card>
        <CardContent className="p-0">
          <div style={{ height: '600px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
