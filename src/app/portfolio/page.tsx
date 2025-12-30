'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Building2,
  Users,
  FileText,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Filter,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Deal {
  id: string
  name: string
  target_company: string
  deal_value: number
  status: 'active' | 'closing' | 'complete' | 'on_hold'
  risk_score: number
  completion: number
  sector: string
  lead: string
  days_in_pipeline: number
  critical_issues: number
  last_activity: string
}

const SAMPLE_DEALS: Deal[] = [
  {
    id: 'd1',
    name: 'Project Alpha',
    target_company: 'TechVentures Inc.',
    deal_value: 150000000,
    status: 'active',
    risk_score: 72,
    completion: 65,
    sector: 'Technology',
    lead: 'Sarah Johnson',
    days_in_pipeline: 45,
    critical_issues: 2,
    last_activity: '2 hours ago',
  },
  {
    id: 'd2',
    name: 'Project Beta',
    target_company: 'HealthCare Solutions',
    deal_value: 85000000,
    status: 'closing',
    risk_score: 45,
    completion: 92,
    sector: 'Healthcare',
    lead: 'Michael Chen',
    days_in_pipeline: 120,
    critical_issues: 0,
    last_activity: '1 day ago',
  },
  {
    id: 'd3',
    name: 'Project Gamma',
    target_company: 'Industrial Dynamics',
    deal_value: 220000000,
    status: 'active',
    risk_score: 85,
    completion: 35,
    sector: 'Manufacturing',
    lead: 'Emily Rodriguez',
    days_in_pipeline: 30,
    critical_issues: 4,
    last_activity: '4 hours ago',
  },
  {
    id: 'd4',
    name: 'Project Delta',
    target_company: 'FinServ Global',
    deal_value: 340000000,
    status: 'on_hold',
    risk_score: 60,
    completion: 50,
    sector: 'Financial Services',
    lead: 'David Kim',
    days_in_pipeline: 90,
    critical_issues: 1,
    last_activity: '1 week ago',
  },
  {
    id: 'd5',
    name: 'Project Epsilon',
    target_company: 'RetailMax Corp',
    deal_value: 95000000,
    status: 'complete',
    risk_score: 25,
    completion: 100,
    sector: 'Retail',
    lead: 'Sarah Johnson',
    days_in_pipeline: 180,
    critical_issues: 0,
    last_activity: '2 weeks ago',
  },
]

const STATUS_CONFIG = {
  active: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Active' },
  closing: { color: 'text-amber-700', bg: 'bg-amber-100', label: 'Closing' },
  complete: { color: 'text-green-700', bg: 'bg-green-100', label: 'Complete' },
  on_hold: { color: 'text-gray-700', bg: 'bg-gray-100', label: 'On Hold' },
}

const formatCurrency = (value: number) => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`
  return `$${value.toLocaleString()}`
}

export default function PortfolioPage() {
  const [deals] = useState<Deal[]>(SAMPLE_DEALS)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'value' | 'risk' | 'completion'>('value')

  const filteredDeals = filterStatus
    ? deals.filter(d => d.status === filterStatus)
    : deals

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    if (sortBy === 'value') return b.deal_value - a.deal_value
    if (sortBy === 'risk') return b.risk_score - a.risk_score
    return b.completion - a.completion
  })

  // Portfolio metrics
  const totalValue = deals.reduce((sum, d) => sum + d.deal_value, 0)
  const activeDeals = deals.filter(d => d.status === 'active' || d.status === 'closing')
  const activeValue = activeDeals.reduce((sum, d) => sum + d.deal_value, 0)
  const avgRisk = Math.round(deals.reduce((sum, d) => sum + d.risk_score, 0) / deals.length)
  const totalIssues = deals.reduce((sum, d) => sum + d.critical_issues, 0)

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-600'
    if (risk >= 50) return 'text-amber-600'
    return 'text-green-600'
  }

  return (
    <MainLayout
      title="Portfolio Dashboard"
      subtitle="Executive overview of all active deals"
    >
      <div className="space-y-6">
        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Portfolio Value</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
                <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>12% vs last quarter</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Active Deals</div>
                <div className="text-2xl font-bold text-gray-900">{activeDeals.length}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {formatCurrency(activeValue)} in pipeline
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Average Risk Score</div>
                <div className={cn('text-2xl font-bold', getRiskColor(avgRisk))}>{avgRisk}</div>
                <div className="flex items-center gap-1 mt-1 text-sm">
                  {avgRisk < 50 ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Low risk</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-600">Moderate risk</span>
                    </>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Critical Issues</div>
                <div className={cn('text-2xl font-bold', totalIssues > 0 ? 'text-red-600' : 'text-green-600')}>
                  {totalIssues}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Across all deals
                </div>
              </div>
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                totalIssues > 0 ? 'bg-red-100' : 'bg-green-100'
              )}>
                <AlertTriangle className={cn('w-6 h-6', totalIssues > 0 ? 'text-red-600' : 'text-green-600')} />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters & Controls */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus(null)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm transition',
                    !filterStatus ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  All ({deals.length})
                </button>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                  const count = deals.filter(d => d.status === status).length
                  return (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm transition',
                        filterStatus === status
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {config.label} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
              >
                <option value="value">Deal Value</option>
                <option value="risk">Risk Score</option>
                <option value="completion">Completion</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Deals Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Deal / Target</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Risk</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Issues</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedDeals.map((deal, i) => {
                  const statusConfig = STATUS_CONFIG[deal.status]
                  return (
                    <motion.tr
                      key={deal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{deal.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {deal.target_company}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{formatCurrency(deal.deal_value)}</div>
                        <div className="text-xs text-gray-500">{deal.sector}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="default" className={cn(statusConfig.bg, statusConfig.color)}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                            deal.risk_score >= 70 ? 'bg-red-100 text-red-700' :
                            deal.risk_score >= 50 ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          )}>
                            {deal.risk_score}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">{deal.completion}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                deal.completion >= 80 ? 'bg-green-500' :
                                deal.completion >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                              )}
                              style={{ width: `${deal.completion}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {deal.critical_issues > 0 ? (
                          <Badge variant="danger" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {deal.critical_issues}
                          </Badge>
                        ) : (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            None
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                            <Users className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="text-sm text-gray-700">{deal.lead}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Activity className="w-3 h-3" />
                          {deal.last_activity}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <Link href="/document-review">
            <Card className="p-4 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Document Review</div>
                  <div className="text-sm text-gray-500">Upload and analyze new documents</div>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/compare-models">
            <Card className="p-4 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Model Comparison</div>
                  <div className="text-sm text-gray-500">Compare AI model analyses</div>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/risk-simulation">
            <Card className="p-4 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Risk Simulation</div>
                  <div className="text-sm text-gray-500">Run Monte Carlo analysis</div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}
