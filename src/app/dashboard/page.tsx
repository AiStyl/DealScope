'use client'

import { MainLayout } from '@/components/layout'
import { Card, Badge, Button, Progress } from '@/components/ui'
import { MOCK_DEALS, MOCK_METRICS, MOCK_FINDINGS } from '@/lib/ai/mockData'
import { formatCurrency, formatRelativeTime, cn, getSeverityColor, getStatusColor } from '@/lib/utils'
import { 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Brain,
  Zap,
  BarChart3,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const metrics = MOCK_METRICS
  const deals = MOCK_DEALS
  const findings = MOCK_FINDINGS.slice(0, 5)

  return (
    <MainLayout title="Dashboard" subtitle="Overview of all deals and AI analysis">
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Active Deals"
            value={metrics.activeDeals}
            subtitle={`${metrics.totalDeals} total`}
            icon={<FileText className="w-5 h-5" />}
            trend="+2 this month"
            color="teal"
          />
          <MetricCard
            title="Critical Risks"
            value={metrics.criticalRisks}
            subtitle="Needs attention"
            icon={<AlertTriangle className="w-5 h-5" />}
            trend="3 resolved"
            color="red"
          />
          <MetricCard
            title="AI Confidence"
            value={`${(metrics.avgConfidence * 100).toFixed(0)}%`}
            subtitle="Average score"
            icon={<Brain className="w-5 h-5" />}
            trend="+5% vs last week"
            color="purple"
          />
          <MetricCard
            title="Analysis Runs"
            value={metrics.analysisRuns}
            subtitle={`${metrics.documentsProcessed} docs`}
            icon={<Zap className="w-5 h-5" />}
            trend="12 today"
            color="amber"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Active Deals */}
          <div className="col-span-2">
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Active Deals</h2>
                  <p className="text-sm text-gray-500">Real-time analysis status</p>
                </div>
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="divide-y divide-gray-100">
                {deals.map((deal, index) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/deals/${deal.id}`} className="block px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold',
                            deal.status === 'in_progress' ? 'bg-blue-500' :
                            deal.status === 'review' ? 'bg-purple-500' : 'bg-gray-400'
                          )}>
                            {deal.companyName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">{deal.name}</h3>
                              <Badge variant={
                                deal.status === 'in_progress' ? 'info' :
                                deal.status === 'review' ? 'warning' : 'default'
                              }>
                                {deal.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{deal.companyName} • {deal.dealType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {deal.targetValue ? formatCurrency(deal.targetValue) : 'TBD'}
                            </p>
                            <p className="text-xs text-gray-500">{deal.findingsCount} findings</p>
                          </div>
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">Progress</span>
                              <span className="font-medium text-gray-700">{deal.progress}%</span>
                            </div>
                            <Progress value={deal.progress} size="sm" />
                          </div>
                          <div className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold',
                            deal.riskScore >= 70 ? 'bg-red-100 text-red-700' :
                            deal.riskScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          )}>
                            {deal.riskScore}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Findings */}
          <div>
            <Card className="overflow-hidden h-full">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Recent Findings</h2>
                  <p className="text-sm text-gray-500">AI-detected insights</p>
                </div>
                <Badge variant="consensus">
                  <Sparkles className="w-3 h-3" />
                  Live
                </Badge>
              </div>
              <div className="divide-y divide-gray-100">
                {findings.map((finding, index) => (
                  <motion.div
                    key={finding.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        finding.severity === 'critical' ? 'bg-red-100' :
                        finding.severity === 'high' ? 'bg-orange-100' :
                        finding.severity === 'medium' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      )}>
                        {finding.type === 'risk' ? (
                          <AlertTriangle className={cn(
                            'w-4 h-4',
                            finding.severity === 'critical' ? 'text-red-600' :
                            finding.severity === 'high' ? 'text-orange-600' :
                            'text-yellow-600'
                          )} />
                        ) : finding.type === 'opportunity' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{finding.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{finding.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            getSeverityColor(finding.severity)
                          )}>
                            {finding.severity}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(finding.timestamp)}
                          </span>
                          {finding.modelsAgreed && finding.modelsAgreed.length > 1 && (
                            <span className="text-xs text-purple-600 font-medium">
                              {finding.modelsAgreed.length} models agree
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <Link href="/findings" className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1">
                  View all findings <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* AI Model Status */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">AI Model Orchestration</h2>
            <p className="text-sm text-gray-500">Real-time status of multi-model analysis engine</p>
          </div>
          <div className="p-6 grid grid-cols-3 gap-6">
            <ModelStatusCard
              name="Claude"
              model="claude"
              status="active"
              requestsToday={34}
              avgLatency={2.1}
              specialty="Contract Analysis & Risk Assessment"
            />
            <ModelStatusCard
              name="GPT-4"
              model="gpt-4"
              status="active"
              requestsToday={28}
              avgLatency={2.8}
              specialty="Financial Modeling & Calculations"
            />
            <ModelStatusCard
              name="Gemini"
              model="gemini"
              status="active"
              requestsToday={22}
              avgLatency={1.6}
              specialty="Document Search & Market Research"
            />
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  color 
}: { 
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  trend: string
  color: 'teal' | 'red' | 'purple' | 'amber'
}) {
  const colors = {
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors[color])}>
          {icon}
        </div>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-green-500" />
          {trend}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </Card>
  )
}

// Model Status Card
function ModelStatusCard({
  name,
  model,
  status,
  requestsToday,
  avgLatency,
  specialty,
}: {
  name: string
  model: 'claude' | 'gpt-4' | 'gemini'
  status: 'active' | 'idle' | 'error'
  requestsToday: number
  avgLatency: number
  specialty: string
}) {
  const colors = {
    claude: 'from-amber-500 to-orange-500',
    'gpt-4': 'from-emerald-500 to-green-500',
    gemini: 'from-blue-500 to-indigo-500',
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className={cn('h-2 bg-gradient-to-r', colors[model])} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">{name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={cn(
              'w-2 h-2 rounded-full',
              status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            )} />
            <span className="text-xs text-gray-500 capitalize">{status}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-4">{specialty}</p>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-gray-900">{requestsToday}</p>
            <p className="text-xs text-gray-500">Requests today</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{avgLatency}s</p>
            <p className="text-xs text-gray-500">Avg latency</p>
          </div>
        </div>
      </div>
    </div>
  )
}
