'use client'

import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showSearch?: boolean
  actions?: React.ReactNode
}

export function MainLayout({ children, title, subtitle, showSearch, actions }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64 transition-all duration-300">
        <Header title={title} subtitle={subtitle} showSearch={showSearch} actions={actions} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
