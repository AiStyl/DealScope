'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button, Progress } from '@/components/ui'
import { ModelBadge } from '@/components/ui/ModelBadge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  FileText,
  AlertTriangle,
  Brain,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Loader2,
  BarChart3,
  Zap,
  Activity,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface DashboardStats {
  documents: {
    total: number
    analyzed: number
    pending: number
    processing: number
  }
  findings: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
  }
  models: {
    claude: number
    gpt4: number
    gemini: number
  }
  risk: {
    average: number
    high_risk_docs: number
    medium_risk_docs: number
    low_risk_docs: number
  }
  activity: {
    recent_documents: number
    recent_findings: number
    last_updated: string
  }
  recent_activity: Array<{
    id: string
    event_type: string
    action: string
    details: Record<string, unknown>
    created_at: string
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
      } else {
        setError(data.error || 'Failed to load dashboard')
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <MainLayout title="Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </MainLayout>
    )
  }

  // Default values if no data
  const docs = stats?.documents || { total: 0, analyzed: 0, pending: 0, processing: 0 }
  const findings = stats?.findings || { total: 0, critical: 0, high: 0, medium: 0, low: 0 }
  const models = stats?.models || { claude: 0, gpt4: 0, gemini: 0 }
  const risk = stats?.risk || { average: 0, high_risk_docs: 0, medium_risk_docs: 0, low_risk_docs: 0 }
  const activity = stats?.activity || { recent_documents: 0, recent_findings: 0, last_updated: '' }

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Multi-model AI due diligence platform overview"
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="info" className="gap-1">
              <Activity className="w-3 h-3" />
              Live Data
            </Badge>
            {activity.last_updated && (
              <span className="text-xs text-gray-500">
                Updated {new Date(activity.last_updated).toLocaleTimeString()}
              </span>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={fetchStats}>
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <Badge variant="default">{docs.analyzed} analyzed</Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900">{docs.total}</div>
              <div className="text-sm text-gray-500 mt-1">Total Documents</div>
              {docs.pending > 0 && (
                <div className="mt-2 text-xs text-amber-600">
                  {docs.pending} pending analysis
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <Badge variant="danger">{findings.critical} critical</Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900">{findings.total}</div>
              <div className="text-sm text-gray-500 mt-1">Total Findings</div>
              {findings.high > 0 && (
                <div className="mt-2 text-xs text-orange-600">
                  {findings.high} high severity
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  risk.average >= 70 ? 'bg-red-100' :
                  risk.average >= 40 ? 'bg-yellow-100' : 'bg-green-100'
                )}>
                  <Shield className={cn(
                    'w-6 h-6',
                    risk.average >= 70 ? 'text-red-600' :
                    risk.average >= 40 ? 'text-yellow-600' : 'text-green-600'
                  )} />
                </div>
                <Badge variant={
                  risk.average >= 70 ? 'danger' :
                  risk.average >= 40 ? 'warning' : 'success'
                }>
                  {risk.average >= 70 ? 'High' : risk.average >= 40 ? 'Medium' : 'Low'}
                </Badge>
              </div>
              <div className={cn(
                'text-3xl font-bold',
                risk.average >= 70 ? 'text-red-600' :
                risk.average >= 40 ? 'text-yellow-600' : 'text-green-600'
              )}>
                {risk.average}
              </div>
              <div className="text-sm text-gray-500 mt-1">Avg Risk Score</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex -space-x-2">
                  <ModelBadge model="claude" size="sm" className="ring-2 ring-white" />
                  <ModelBadge model="gpt-4" size="sm" className="ring-2 ring-white" />
                  <ModelBadge model="gemini" size="sm" className="ring-2 ring-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-500 mt-1">AI Models Active</div>
              <div className="mt-2 text-xs text-teal-600">
                Multi-model consensus enabled
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Model Attribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Model Attribution</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ModelBadge model="claude" size="sm" />
                    <span className="text-sm text-gray-600">Claude</span>
                  </div>
                  <span className="text-sm font-semibold">{models.claude} findings</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ModelBadge model="gpt-4" size="sm" />
                    <span className="text-sm text-gray-600">GPT-4</span>
                  </div>
                  <span className="text-sm font-semibold">{models.gpt4} findings</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ModelBadge model="gemini" size="sm" />
                    <span className="text-sm text-gray-600">Gemini</span>
                  </div>
                  <span className="text-sm font-semibold">{models.gemini} findings</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Findings by Severity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-red-600" />
                <h3 className="font-semibold text-gray-900">Findings by Severity</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-red-600 font-medium">Critical</span>
                    <span>{findings.critical}</span>
                  </div>
                  <Progress value={findings.total > 0 ? (findings.critical / findings.total) * 100 : 0} variant="danger" size="sm" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-orange-600 font-medium">High</span>
                    <span>{findings.high}</span>
                  </div>
                  <Progress value={findings.total > 0 ? (findings.high / findings.total) * 100 : 0} variant="warning" size="sm" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-yellow-600 font-medium">Medium</span>
                    <span>{findings.medium}</span>
                  </div>
                  <Progress value={findings.total > 0 ? (findings.medium / findings.total) * 100 : 0} variant="info" size="sm" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">Low</span>
                    <span>{findings.low}</span>
                  </div>
                  <Progress value={findings.total > 0 ? (findings.low / findings.total) * 100 : 0} variant="default" size="sm" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Risk Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Risk Distribution</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{risk.high_risk_docs}</div>
                  <div className="text-xs text-red-600">High Risk</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{risk.medium_risk_docs}</div>
                  <div className="text-xs text-yellow-600">Medium</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{risk.low_risk_docs}</div>
                  <div className="text-xs text-green-600">Low Risk</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-2 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/documents">
                  <Button variant="secondary" className="w-full justify-start gap-2">
                    <FileText className="w-4 h-4" />
                    Upload Document
                  </Button>
                </Link>
                <Link href="/debate">
                  <Button variant="secondary" className="w-full justify-start gap-2">
                    <Zap className="w-4 h-4" />
                    Start Debate
                  </Button>
                </Link>
                <Link href="/interrogation">
                  <Button variant="secondary" className="w-full justify-start gap-2">
                    <Brain className="w-4 h-4" />
                    Interrogate Doc
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="secondary" className="w-full justify-start gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Generate Report
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                <Link href="/audit-trail" className="text-sm text-teal-600 hover:text-teal-700">
                  View All
                </Link>
              </div>
              {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent_activity.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center gap-3 text-sm">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        log.action === 'upload' ? 'bg-purple-100' :
                        log.action === 'multi_model_analysis' ? 'bg-teal-100' :
                        log.action === 'question_asked' ? 'bg-blue-100' :
                        'bg-gray-100'
                      )}>
                        {log.action === 'upload' ? <FileText className="w-4 h-4 text-purple-600" /> :
                         log.action === 'multi_model_analysis' ? <Brain className="w-4 h-4 text-teal-600" /> :
                         log.action === 'question_asked' ? <Zap className="w-4 h-4 text-blue-600" /> :
                         <Activity className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-900 capitalize">{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-gray-400 text-xs ml-2">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs">Upload a document to get started</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Platform Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-teal-900">Multi-Model Consensus Active</h3>
                  <p className="text-sm text-teal-700">
                    Claude + GPT-4 + Gemini analyzing documents in parallel
                  </p>
                </div>
              </div>
              <Link href="/how-it-works">
                <Button variant="secondary" size="sm" className="gap-1">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  )
}
