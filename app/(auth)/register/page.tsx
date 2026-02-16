'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot } from 'lucide-react'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      workspaceName: formData.get('workspaceName'),
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        callbackUrl: '/dashboard',
      })
    } else {
      const err = await res.json()
      setError(err.error || 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Bot className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Get started with Agent Aik</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input name="name" placeholder="John Doe" required />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input name="password" type="password" placeholder="Min. 8 characters" required minLength={8} />
            </div>
            <div>
              <label className="text-sm font-medium">Workspace Name</label>
              <Input name="workspaceName" placeholder="My Company" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground mt-4">
            Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
