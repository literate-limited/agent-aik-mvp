'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function NewWorkflowPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      const wf = await res.json()
      router.push(`/workflows/${wf.id}`)
    } else {
      setLoading(false)
      alert('Failed to create workflow')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create New Workflow</h1>
      <Card>
        <CardHeader><CardTitle className="text-lg">Workflow Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Customer Inquiry Pipeline" required />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this workflow do?" />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Workflow'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
