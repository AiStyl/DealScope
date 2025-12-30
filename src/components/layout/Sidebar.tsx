'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Brain,
  FileSearch,
  MessageSquare,
  Swords,
  GitBranch,
  Activity,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Boxes,
  Network,
  Shield,
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Multi-Agent Analysis', href: '/analysis', icon: Brain },
  { name: 'Document Review', href: '/documents', icon: FileSearch },
  { name: 'Interrogation', href: '/interrogation', icon: MessageSquare },
  { name: 'Agent Debate', href: '/debate', icon: Swords },
  { name: 'Model Orchestration', href: '/orchestration', icon: GitBranch },
  { name: 'Reasoning Streams', href: '/streams', icon: Activity },
  { name: 'Knowledge Graph', href: '/knowledge-graph', icon: Network },
  { name: 'Risk Simulation', href: '/risk-simulation', icon: Activity },
  { name: 'Deal Simulator', href: '/deal-simulator', icon: GitBranch },
  { name: 'Sensitivity Analysis', href: '/sensitivity-analysis', icon: LayoutDashboard },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Audit Trail', href: '/audit-trail', icon: Shield },
  { name: 'Team Workspace', href: '/team', icon: Network },
  { name: 'API Console', href: '/api-console', icon: Boxes },
]

const secondaryNavigation = [
  { name: 'Architecture', href: '/23-architecture.html', icon: Boxes, external: true },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          {!collapsed && (
            <span className="font-display font-semibold text-xl text-gray-900">
              DealScope
            </span>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-teal-600')} />
              {!collapsed && (
                <span className="font-medium truncate">{item.name}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href
          const isExternal = 'external' in item && item.external
          
          if (isExternal) {
            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                  'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">{item.name}</span>}
              </a>
            )
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.name}</span>}
            </Link>
          )
        })}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* User/Org Info */}
      {!collapsed && (
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-medium">
              JJ
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">JJ</p>
              <p className="text-xs text-gray-500 truncate">CloudSprint Labs</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
