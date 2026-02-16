'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PROMPT_TEMPLATES } from '@/lib/claude'

const templates = [
  { key: 'customerSupport', label: 'Customer Support' },
  { key: 'dataAnalysis', label: 'Data Analysis' },
  { key: 'contentWriter', label: 'Content Writer' },
  { key: 'codeAssistant', label: 'Code Assistant' },
  { key: 'summarizer', label: 'Summarizer' },
]

export default function NewAgentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    model: 'claude-sonnet-4-20250514',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      const agent = await res.json()
      router.push(`/agents/${agent.id}`)
    } else {
      setLoading(false)
      alert('Failed to create agent')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create New Agent</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agent Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Customer Support Agent"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What does this agent do?"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Model</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              >
                <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                <option value="claude-haiku-4-20250514">Claude Haiku 4</option>
                <option value="claude-opus-4-20250514">Claude Opus 4</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Quick Templates</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {templates.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className="px-3 py-1 text-xs border rounded-full hover:bg-accent"
                    onClick={() => setForm({ ...form, systemPrompt: (PROMPT_TEMPLATES as any)[t.key] })}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <label className="text-sm font-medium">System Prompt</label>
              <Textarea
                value={form.systemPrompt}
                onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                placeholder="Define the agent's behavior and personality..."
                rows={8}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Agent'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
