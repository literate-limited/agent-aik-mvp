'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Bot, LayoutDashboard, GitBranch, Activity, Settings, Key, LogOut } from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/workflows', label: 'Workflows', icon: GitBranch },
  { href: '/executions', label: 'Executions', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/settings/api-keys', label: 'API Keys', icon: Key },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50/50">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Agent Aik</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
