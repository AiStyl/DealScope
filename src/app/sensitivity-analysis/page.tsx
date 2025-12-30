'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Target,
  Loader2,
  AlertTriangle,
  Play,
  Info,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TornadoData {
  variable: string
  low_irr: number
  base_irr: number
  high_irr: number
  downside: number
  upside: number
}

interface SensitivityResult {
  variable: string
  unit: string
  base_value: number
  low_value: number
  high_value: number
  base_irr: number
  low_irr: number
  high_irr: number
  irr_swing: number
  sensitivity_rank: number
}

interface AnalysisResult {
  base_case: {
    irr: number
    parameters: Record<string, number>
  }
  sensitivity_results: SensitivityResult[]
  tornado_chart_data: TornadoData[]
  breakeven_analysis: Record<string, number>
  key_findings: string[]
}

const formatValue = (value: number, unit: string) => {
  if (unit === '$') {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${(value / 1e3).toFixed(0)}K`
  }
  if (unit === 'x') return `${value.toFixed(1)}x`
  return `${value.toFixed(0)}${unit}`
}

export default function SensitivityAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedVar, setSelectedVar] = useState<SensitivityResult | null>(null)

  // Parameters
  const [purchasePrice, setPurchasePrice] = useState(100000000)
  const [equityPct, setEquityPct] = useState(40)
  const [synergies, setSynergies] = useState(8000000)
  const [integrationCosts, setIntegrationCosts] = useState(5000000)
  const [revenueGrowth, setRevenueGrowth] = useState(8)
  const [ebitdaMargin, setEbitdaMargin] = useState(18)
  const [exitMultiple, setExitMultiple] = useState(6)

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/sensitivity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchase_price: purchasePrice,
          equity_percentage: equityPct,
          synergies,
          integration_costs: integrationCosts,
          revenue_growth: revenueGrowth,
          ebitda_margin: ebitdaMargin,
          exit_multiple: exitMultiple,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.analysis)
        setSelectedVar(null)
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Failed to run sensitivity analysis.')
    } finally {
      setLoading(false)
    }
  }

  const getIrrColor = (irr: number) => {
    if (irr >= 25) return 'text-green-600'
    if (irr >= 20) return 'text-emerald-600'
    if (irr >= 15) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <MainLayout
      title="Sensitivity Analysis"
      subtitle="Understand which variables have the greatest impact on returns"
    >
      <div className="grid grid-cols-4 gap-6">
        {/* Parameters */}
        <div className="col-span-1 space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Base Parameters</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-600">Purchase Price</label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-gray-600">Equity %</label>
                <input
                  type="number"
                  value={equityPct}
                  onChange={(e) => setEquityPct(Number(e.target.value))}
                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-gray-600">Synergies (Y3)</label>
                <input
                  type="number"
                  value={synergies}
                  onChange={(e) => setSynergies(Number(e.target.value))}
                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-gray-600">Integration Costs</label>
                <input
                  type="number"
                  value={integrationCosts}
                  onChange={(e) => setIntegrationCosts(Number(e.target.value))}
                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-gray-600">Revenue Growth %</label>
                <input
                  type="number"
                  value={revenueGrowth}
                  onChange={(e) => setRevenueGrowth(Number(e.target.value))}
                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-gray-600">EBITDA Margin %</label>
                <input
                  type="number"
                  value={ebitdaMargin}
                  onChange={(e) => setEbitdaMargin(Number(e.target.value))}
                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-gray-600">Exit Multiple</label>
                <input
                  type="number"
                  value={exitMultiple}
                  onChange={(e) => setExitMultiple(Number(e.target.value))}
                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>

            <Button
              onClick={runAnalysis}
              disabled={loading}
              className="w-full mt-4 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </Card>

          {/* Selected Variable Detail */}
          {selectedVar && (
            <Card className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3">{selectedVar.variable}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Base Value</span>
                  <span>{formatValue(selectedVar.base_value, selectedVar.unit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Range</span>
                  <span>
                    {formatValue(selectedVar.low_value, selectedVar.unit)} - {formatValue(selectedVar.high_value, selectedVar.unit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">IRR Swing</span>
                  <span className="font-semibold text-purple-600">{selectedVar.irr_swing}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sensitivity Rank</span>
                  <Badge variant="default">#{selectedVar.sensitivity_rank}</Badge>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="col-span-3 space-y-4">
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

          {loading ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600" />
                  <BarChart3 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Running Sensitivity Analysis</h3>
                <p className="text-sm text-gray-500">Calculating IRR impact for each variable...</p>
              </div>
            </Card>
          ) : !result ? (
            <Card className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Sensitivity Analysis</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                See how changes in each variable affect your deal's IRR.
                The tornado chart shows which factors have the greatest impact.
              </p>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Base IRR Header */}
              <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-purple-600 font-medium">Base Case IRR</div>
                      <div className={cn('text-3xl font-bold', getIrrColor(result.base_case.irr))}>
                        {result.base_case.irr}%
                      </div>
                    </div>
                  </div>
                  <Badge variant={result.base_case.irr >= 20 ? 'success' : 'warning'}>
                    {result.base_case.irr >= 20 ? 'Above 20% Hurdle' : 'Below 20% Hurdle'}
                  </Badge>
                </div>
              </Card>

              {/* Tornado Chart */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Tornado Chart - IRR Sensitivity</h3>
                </div>

                <div className="space-y-3">
                  {result.tornado_chart_data.map((item, i) => {
                    const maxSwing = Math.max(...result.tornado_chart_data.map(d => Math.max(Math.abs(d.downside), Math.abs(d.upside))))
                    const downsideWidth = (Math.abs(item.downside) / maxSwing) * 45
                    const upsideWidth = (Math.abs(item.upside) / maxSwing) * 45
                    const sensitivityResult = result.sensitivity_results.find(r => r.variable === item.variable)

                    return (
                      <motion.div
                        key={item.variable}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition',
                          selectedVar?.variable === item.variable ? 'bg-purple-50' : 'hover:bg-gray-50'
                        )}
                        onClick={() => setSelectedVar(sensitivityResult || null)}
                      >
                        <div className="w-32 text-sm text-right text-gray-600">
                          {item.variable}
                        </div>
                        
                        {/* Downside bar */}
                        <div className="w-[45%] flex justify-end">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-red-600">{item.downside.toFixed(1)}%</span>
                            <div
                              className="h-8 bg-red-400 rounded-l"
                              style={{ width: `${downsideWidth}%`, minWidth: item.downside !== 0 ? '4px' : '0' }}
                            />
                          </div>
                        </div>

                        {/* Center line */}
                        <div className="w-px h-10 bg-gray-400" />

                        {/* Upside bar */}
                        <div className="w-[45%]">
                          <div className="flex items-center gap-1">
                            <div
                              className="h-8 bg-green-400 rounded-r"
                              style={{ width: `${upsideWidth}%`, minWidth: item.upside !== 0 ? '4px' : '0' }}
                            />
                            <span className="text-xs text-green-600">+{item.upside.toFixed(1)}%</span>
                          </div>
                        </div>

                        <div className="w-16 text-xs text-gray-500 text-right">
                          #{result.sensitivity_results.find(r => r.variable === item.variable)?.sensitivity_rank}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4 text-red-500" />
                    <div className="w-4 h-4 bg-red-400 rounded" />
                    <span className="text-sm text-gray-600">IRR Decrease</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-400 rounded" />
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">IRR Increase</span>
                  </div>
                </div>
              </Card>

              {/* Sensitivity Table */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Detailed Sensitivity Results</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium text-gray-500">Rank</th>
                        <th className="text-left py-2 font-medium text-gray-500">Variable</th>
                        <th className="text-right py-2 font-medium text-gray-500">Low</th>
                        <th className="text-right py-2 font-medium text-gray-500">Base</th>
                        <th className="text-right py-2 font-medium text-gray-500">High</th>
                        <th className="text-right py-2 font-medium text-gray-500">Low IRR</th>
                        <th className="text-right py-2 font-medium text-gray-500">High IRR</th>
                        <th className="text-right py-2 font-medium text-gray-500">Swing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.sensitivity_results.map((row) => (
                        <tr
                          key={row.variable}
                          className={cn(
                            'border-b border-gray-100 cursor-pointer transition',
                            selectedVar?.variable === row.variable ? 'bg-purple-50' : 'hover:bg-gray-50'
                          )}
                          onClick={() => setSelectedVar(row)}
                        >
                          <td className="py-2">
                            <Badge variant={row.sensitivity_rank <= 3 ? 'danger' : 'default'}>
                              #{row.sensitivity_rank}
                            </Badge>
                          </td>
                          <td className="py-2 font-medium">{row.variable}</td>
                          <td className="py-2 text-right text-gray-500">
                            {formatValue(row.low_value, row.unit)}
                          </td>
                          <td className="py-2 text-right">
                            {formatValue(row.base_value, row.unit)}
                          </td>
                          <td className="py-2 text-right text-gray-500">
                            {formatValue(row.high_value, row.unit)}
                          </td>
                          <td className={cn('py-2 text-right', getIrrColor(row.low_irr))}>
                            {row.low_irr}%
                          </td>
                          <td className={cn('py-2 text-right', getIrrColor(row.high_irr))}>
                            {row.high_irr}%
                          </td>
                          <td className="py-2 text-right font-semibold text-purple-600">
                            {row.irr_swing}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Key Findings */}
              <Card className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-900">Key Findings</h3>
                </div>
                <div className="space-y-2">
                  {result.key_findings.map((finding, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-amber-800">
                      <span className="font-bold">•</span>
                      {finding}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
