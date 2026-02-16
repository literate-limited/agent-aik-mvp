'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Key, Shield, Users } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/settings/api-keys">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <Key className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">API Keys</CardTitle>
              <CardDescription>Manage API keys for programmatic access</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Card className="opacity-50">
          <CardHeader>
            <Users className="h-8 w-8 text-muted-foreground mb-2" />
            <CardTitle className="text-lg">Team Members</CardTitle>
            <CardDescription>Invite and manage team members (coming soon)</CardDescription>
          </CardHeader>
        </Card>
        <Card className="opacity-50">
          <CardHeader>
            <Shield className="h-8 w-8 text-muted-foreground mb-2" />
            <CardTitle className="text-lg">Security</CardTitle>
            <CardDescription>Security settings and audit logs (coming soon)</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
