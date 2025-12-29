'use client'

import { Search, Bell, Plus, ChevronDown } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useState } from 'react'

interface HeaderProps {
  title?: string
  subtitle?: string
  showSearch?: boolean
  actions?: React.ReactNode
}

export function Header({ title, subtitle, showSearch = true, actions }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side - Title */}
      <div>
        {title && (
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>

      {/* Right side - Search, Actions, Notifications */}
      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals, documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
            />
          </div>
        )}

        {actions}

        <Button variant="primary" size="sm">
          <Plus className="w-4 h-4" />
          New Deal
        </Button>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Model Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex -space-x-1">
            <div className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" title="Claude" />
            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="GPT-4" />
            <div className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white" title="Gemini" />
          </div>
          <span className="text-xs font-medium text-gray-600">3 Models</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
      </div>
    </header>
  )
}
