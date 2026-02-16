'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { Plus, Trash2, Copy, Key } from 'lucide-react'

interface ApiKeyInfo {
  id: string
  name: string
  keyPrefix: string
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadKeys = () => {
    fetch('/api/api-keys').then((r) => r.json()).then(setKeys).finally(() => setLoading(false))
  }

  useEffect(loadKeys, [])

  const createKey = async () => {
    if (!newKeyName) return
    const res = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName }),
    })
    if (res.ok) {
      const data = await res.json()
      setCreatedKey(data.key)
      setNewKeyName('')
      loadKeys()
    }
  }

  const deleteKey = async (id: string) => {
    if (!confirm('Delete this API key?')) return
    await fetch(`/api/api-keys/${id}`, { method: 'DELETE' })
    loadKeys()
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">API Keys</h1>

      {/* Create Key */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-lg">Create New Key</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g., Production)"
              onKeyDown={(e) => e.key === 'Enter' && createKey()}
            />
            <Button onClick={createKey} disabled={!newKeyName}>
              <Plus className="h-4 w-4 mr-2" /> Create
            </Button>
          </div>

          {createdKey && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-800 mb-2">
                ⚠️ Copy this key now. It won&apos;t be shown again.
              </p>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-white p-2 rounded border flex-1 break-all">{createdKey}</code>
                <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(createdKey); alert('Copied!') }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key List */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Active Keys</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : keys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No API keys yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium text-sm">{key.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <code>{key.keyPrefix}...</code> · Created {formatDate(key.createdAt)}
                      {key.lastUsedAt && ` · Last used ${formatDate(key.lastUsedAt)}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteKey(key.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
