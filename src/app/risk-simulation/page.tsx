'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button, Progress } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Activity,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Play,
  Loader2,
  DollarSign,
  Target,
  Shield,
  RefreshCw,
  Info,
  ChevronDown,
  FileText,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RiskFactor {
  name: string
  category: string
  probability: number
  impact_low: number
  impact_high: number
  description: string
}

interface SimulationResult {
  config: {
    base_deal_value: number
    simulations_run: number
    risk_factors_count: number
  }
  risk_factors: RiskFactor[]
  summary: {
    expected_value: number
    median_value: number
    standard_deviation: number
    min_scenario: number
    max_scenario: number
  }
  risk_metrics: {
    value_at_risk_95: number
    value_at_risk_99: number
    expected_shortfall: number
    var_95_percent_of_base: number
    var_99_percent_of_base: number
  }
  probabilities: {
    below_80_percent: number
    below_90_percent: number
    above_110_percent: number
  }
  distribution: {
    bucket: string
    count: number
    percentage: number
  }[]
  top_risk_contributors: {
    name: string
    frequency: number
    avg_impact: number
  }[]
  worst_scenarios: {
    value: number
    impact_percent: number
    risks_triggered: string[]
  }[]
  processing_time_ms: number
}

interface Document {
  id: string
  name: string
  status: string
}

export default function RiskSimulationPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [baseDealValue, setBaseDealValue] = useState(100000000)
  const [simulations, setSimulations] = useState(10000)
  const [loading, setLoading] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRiskFactors, setShowRiskFactors] = useState(false)

  const fetchDocuments = useCallback(async () => {
    try {
      setLoadingDocs(true)
      const response = await fetch('/api/upload')
      const data = await response.json()
      if (data.documents) {
        setDocuments(data.documents.filter((d: Document) => d.status === 'analyzed'))
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    } finally {
      setLoadingDocs(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const runSimulation = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/risk-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDoc,
          baseDealValue,
          simulations,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.simulation)
      } else {
        setError(data.error || 'Simulation failed')
      }
    } catch (err) {
      console.error('Simulation error:', err)
      setError('Simulation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
    return `$${value.toFixed(0)}`
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Legal: 'bg-purple-100 text-purple-700',
      Financial: 'bg-green-100 text-green-700',
      Operational: 'bg-blue-100 text-blue-700',
      Regulatory: 'bg-amber-100 text-amber-700',
      Market: 'bg-cyan-100 text-cyan-700',
      Integration: 'bg-pink-100 text-pink-700',
      Reputation: 'bg-orange-100 text-orange-700',
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  return (
    <MainLayout
      title="Monte Carlo Risk Simulation"
      subtitle="Quantitative risk analysis using statistical simulation"
    >
      <div className="space-y-6">
        {/* Configuration Panel */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-teal-600" />
            <h2 className="font-semibold text-gray-900">Simulation Configuration</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Document Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Document (Optional)
              </label>
              <select
                value={selectedDoc || ''}
                onChange={(e) => setSelectedDoc(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loading}
              >
                <option value="">Use default risk factors</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name.slice(0, 40)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                AI will extract risks from document
              </p>
            </div>

            {/* Base Deal Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Deal Value
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={baseDealValue}
                  onChange={(e) => setBaseDealValue(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(baseDealValue)}
              </p>
            </div>

            {/* Simulations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Simulations
              </label>
              <select
                value={simulations}
                onChange={(e) => setSimulations(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loading}
              >
                <option value={1000}>1,000 (Quick)</option>
                <option value={10000}>10,000 (Standard)</option>
                <option value={50000}>50,000 (Precise)</option>
              </select>
            </div>

            {/* Run Button */}
            <div className="flex items-end">
              <Button
                onClick={runSimulation}
                disabled={loading}
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Simulation
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
            >
              <AlertTriangle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 border-4 border-teal-200 rounded-full animate-spin border-t-teal-600" />
                <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Running Monte Carlo Simulation</h3>
              <p className="text-sm text-gray-500">
                Simulating {simulations.toLocaleString()} scenarios...
              </p>
            </div>
          </Card>
        )}

        {/* Results */}
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-teal-600" />
                  <span className="text-sm text-gray-500">Expected Value</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(result.summary.expected_value)}
                </div>
                <div className={cn(
                  'text-xs mt-1',
                  result.summary.expected_value < baseDealValue ? 'text-red-600' : 'text-green-600'
                )}>
                  {((result.summary.expected_value / baseDealValue - 1) * 100).toFixed(1)}% of base
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-500">VaR (95%)</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(result.risk_metrics.value_at_risk_95)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {result.risk_metrics.var_95_percent_of_base}% of base
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-500">P(Value &lt; 80%)</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {result.probabilities.below_80_percent}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Significant loss probability
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-500">P(Value &gt; 110%)</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {result.probabilities.above_110_percent}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Upside probability
                </div>
              </Card>
            </div>

            {/* Distribution Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Value Distribution</h3>
                </div>
                <Badge variant="default">
                  {result.config.simulations_run.toLocaleString()} simulations
                </Badge>
              </div>

              <div className="space-y-2">
                {result.distribution.map((bucket, i) => (
                  <div key={bucket.bucket} className="flex items-center gap-3">
                    <div className="w-20 text-sm text-gray-600 text-right">
                      {bucket.bucket}
                    </div>
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${bucket.percentage}%` }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          'h-full rounded-lg',
                          bucket.bucket.includes('< 70') || bucket.bucket.includes('70-80') 
                            ? 'bg-red-500' 
                            : bucket.bucket.includes('80-90')
                            ? 'bg-orange-500'
                            : bucket.bucket.includes('90-95') || bucket.bucket.includes('95-100')
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                        )}
                      />
                    </div>
                    <div className="w-16 text-sm text-gray-600">
                      {bucket.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Risk Contributors & Scenarios */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top Risk Contributors */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-gray-900">Top Risk Contributors</h3>
                </div>
                <div className="space-y-3">
                  {result.top_risk_contributors.map((risk, i) => (
                    <div key={risk.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                        <span className="text-sm text-gray-700">{risk.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">{risk.frequency}% freq</span>
                        <span className="text-red-600 font-medium">-{risk.avg_impact}% avg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Worst Scenarios */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-gray-900">Worst Case Scenarios</h3>
                </div>
                <div className="space-y-3">
                  {result.worst_scenarios.map((scenario, i) => (
                    <div key={i} className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-800">
                          {formatCurrency(scenario.value)}
                        </span>
                        <Badge variant="danger">
                          {scenario.impact_percent.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {scenario.risks_triggered.slice(0, 3).map((risk) => (
                          <span
                            key={risk}
                            className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded"
                          >
                            {risk}
                          </span>
                        ))}
                        {scenario.risks_triggered.length > 3 && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                            +{scenario.risks_triggered.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Risk Factors (Collapsible) */}
            <Card className="p-6">
              <button
                onClick={() => setShowRiskFactors(!showRiskFactors)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    Risk Factors Used ({result.risk_factors.length})
                  </h3>
                </div>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-gray-400 transition-transform',
                    showRiskFactors && 'rotate-180'
                  )}
                />
              </button>

              <AnimatePresence>
                {showRiskFactors && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-3">
                      {result.risk_factors.map((risk) => (
                        <div
                          key={risk.name}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{risk.name}</span>
                              <span className={cn('px-2 py-0.5 text-xs rounded', getCategoryColor(risk.category))}>
                                {risk.category}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              P: {(risk.probability * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                          <div className="text-xs text-gray-500">
                            Impact range: {risk.impact_low}% to {risk.impact_high}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Summary Stats */}
            <Card className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Info className="w-5 h-5 text-teal-600" />
                  <div>
                    <span className="font-medium text-teal-900">Simulation Complete</span>
                    <span className="text-sm text-teal-700 ml-2">
                      {result.config.simulations_run.toLocaleString()} scenarios in {(result.processing_time_ms / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={runSimulation}>
                  <RefreshCw className="w-4 h-4" />
                  Re-run
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !result && (
          <Card className="p-12 text-center">
            <Activity className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Monte Carlo Risk Simulation</h3>
            <p className="text-sm text-gray-500 max-w-lg mx-auto mb-6">
              Run thousands of probabilistic scenarios to understand how different risks
              could affect your deal value. Get VaR metrics, probability distributions,
              and identify top risk contributors.
            </p>
            <Button onClick={runSimulation} className="gap-2">
              <Play className="w-4 h-4" />
              Run Simulation
            </Button>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
