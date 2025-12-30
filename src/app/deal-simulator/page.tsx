'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Clock,
  Target,
  Loader2,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  Lightbulb,
  Play,
  RefreshCw,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SimulationResult {
  parameters: Record<string, number>
  base_case: {
    irr: number
    npv: number
    moic: number
    payback_years: number
    break_even_year: number
    cash_flows: number[]
  }
  scenarios: Array<{
    name: string
    parameters: Record<string, number>
    irr: number
    npv: number
    payback_years: number
    multiple_on_invested_capital: number
  }>
  insights: string[]
}

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export default function DealSimulatorPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Deal parameters
  const [purchasePrice, setPurchasePrice] = useState(100000000)
  const [equityPct, setEquityPct] = useState(40)
  const [earnoutAmount, setEarnoutAmount] = useState(10000000)
  const [earnoutProb, setEarnoutProb] = useState(70)
  const [synergiesY1, setSynergiesY1] = useState(2000000)
  const [synergiesY3, setSynergiesY3] = useState(8000000)
  const [integrationCosts, setIntegrationCosts] = useState(5000000)
  const [revenueGrowth, setRevenueGrowth] = useState(8)
  const [ebitdaMargin, setEbitdaMargin] = useState(18)
  const [discountRate, setDiscountRate] = useState(12)

  const runSimulation = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/deal-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchase_price: purchasePrice,
          equity_percentage: equityPct,
          debt_percentage: 100 - equityPct,
          earnout_amount: earnoutAmount,
          earnout_probability: earnoutProb,
          synergies_year1: synergiesY1,
          synergies_year3: synergiesY3,
          integration_costs: integrationCosts,
          revenue_growth_rate: revenueGrowth,
          ebitda_margin: ebitdaMargin,
          discount_rate: discountRate,
          tax_rate: 25,
          run_scenarios: true,
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
      setError('Failed to run simulation. Please try again.')
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

  const getIrrBadge = (irr: number) => {
    if (irr >= 25) return 'success'
    if (irr >= 20) return 'success'
    if (irr >= 15) return 'warning'
    return 'danger'
  }

  return (
    <MainLayout
      title="Deal Simulator"
      subtitle="Model M&A scenarios with financial projections"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Parameters Panel */}
        <div className="col-span-1 space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Deal Parameters</h3>
            </div>

            <div className="space-y-4">
              {/* Purchase Price */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  Purchase Price
                  <span className="text-teal-600">{formatCurrency(purchasePrice)}</span>
                </label>
                <input
                  type="range"
                  min={10000000}
                  max={500000000}
                  step={5000000}
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              {/* Equity / Debt Split */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  Equity / Debt
                  <span className="text-teal-600">{equityPct}% / {100 - equityPct}%</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={100}
                  step={5}
                  value={equityPct}
                  onChange={(e) => setEquityPct(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              {/* Earnout */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  Earnout Amount
                  <span className="text-teal-600">{formatCurrency(earnoutAmount)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={50000000}
                  step={1000000}
                  value={earnoutAmount}
                  onChange={(e) => setEarnoutAmount(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  Earnout Probability
                  <span className="text-teal-600">{earnoutProb}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={earnoutProb}
                  onChange={(e) => setEarnoutProb(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              {/* Synergies */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  Year 3 Synergies
                  <span className="text-teal-600">{formatCurrency(synergiesY3)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={30000000}
                  step={1000000}
                  value={synergiesY3}
                  onChange={(e) => {
                    setSynergiesY3(Number(e.target.value))
                    setSynergiesY1(Math.round(Number(e.target.value) * 0.25))
                  }}
                  className="w-full mt-1"
                />
              </div>

              {/* Integration Costs */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  Integration Costs
                  <span className="text-teal-600">{formatCurrency(integrationCosts)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={20000000}
                  step={500000}
                  value={integrationCosts}
                  onChange={(e) => setIntegrationCosts(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              {/* Revenue Growth */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  Revenue Growth
                  <span className="text-teal-600">{revenueGrowth}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={1}
                  value={revenueGrowth}
                  onChange={(e) => setRevenueGrowth(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              {/* EBITDA Margin */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  EBITDA Margin
                  <span className="text-teal-600">{ebitdaMargin}%</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={1}
                  value={ebitdaMargin}
                  onChange={(e) => setEbitdaMargin(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              {/* Discount Rate */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  Discount Rate (WACC)
                  <span className="text-teal-600">{discountRate}%</span>
                </label>
                <input
                  type="range"
                  min={6}
                  max={20}
                  step={0.5}
                  value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>

            <Button
              onClick={runSimulation}
              disabled={loading}
              className="w-full mt-4 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Simulation
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="col-span-2 space-y-4">
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
                  <div className="w-16 h-16 border-4 border-teal-200 rounded-full animate-spin border-t-teal-600" />
                  <Calculator className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Running Deal Simulation</h3>
                <p className="text-sm text-gray-500">Calculating IRR, NPV, and scenarios...</p>
              </div>
            </Card>
          ) : !result ? (
            <Card className="p-12 text-center">
              <Calculator className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Deal Simulator</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Adjust the deal parameters on the left and click "Run Simulation" to see
                IRR, NPV, MOIC, and scenario analysis.
              </p>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    <span className="text-sm text-gray-500">IRR</span>
                  </div>
                  <div className={cn('text-2xl font-bold', getIrrColor(result.base_case.irr))}>
                    {result.base_case.irr.toFixed(1)}%
                  </div>
                  <Badge variant={getIrrBadge(result.base_case.irr) as any} className="mt-1">
                    {result.base_case.irr >= 20 ? 'Above Hurdle' : 'Below Hurdle'}
                  </Badge>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-500">NPV</span>
                  </div>
                  <div className={cn(
                    'text-2xl font-bold',
                    result.base_case.npv >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {formatCurrency(result.base_case.npv)}
                  </div>
                  <Badge variant={result.base_case.npv >= 0 ? 'success' : 'danger'} className="mt-1">
                    {result.base_case.npv >= 0 ? 'Value Creating' : 'Value Destroying'}
                  </Badge>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-500">MOIC</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {result.base_case.moic.toFixed(2)}x
                  </div>
                  <Badge variant={result.base_case.moic >= 2 ? 'success' : 'warning'} className="mt-1">
                    {result.base_case.moic >= 2 ? 'Strong Return' : 'Moderate Return'}
                  </Badge>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-gray-500">Payback</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-600">
                    {result.base_case.payback_years} yrs
                  </div>
                  <Badge variant={result.base_case.payback_years <= 4 ? 'success' : 'warning'} className="mt-1">
                    {result.base_case.payback_years <= 4 ? 'Quick' : 'Extended'}
                  </Badge>
                </Card>
              </div>

              {/* Cash Flow Chart */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-900">Projected Cash Flows</h3>
                </div>
                <div className="flex items-end justify-between h-40 gap-2">
                  {result.base_case.cash_flows.map((cf, i) => {
                    const maxAbs = Math.max(...result.base_case.cash_flows.map(Math.abs))
                    const height = (Math.abs(cf) / maxAbs) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className={cn(
                            'w-full rounded-t transition-all',
                            cf >= 0 ? 'bg-green-500' : 'bg-red-500'
                          )}
                          style={{ 
                            height: `${height}%`,
                            marginTop: cf >= 0 ? 'auto' : 0,
                            marginBottom: cf < 0 ? 'auto' : 0,
                          }}
                        />
                        <div className="text-xs text-gray-500 mt-2">Y{i}</div>
                        <div className="text-xs font-medium">
                          {formatCurrency(cf)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Scenario Comparison */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Scenario Analysis</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium text-gray-500">Scenario</th>
                        <th className="text-right py-2 font-medium text-gray-500">IRR</th>
                        <th className="text-right py-2 font-medium text-gray-500">NPV</th>
                        <th className="text-right py-2 font-medium text-gray-500">MOIC</th>
                        <th className="text-right py-2 font-medium text-gray-500">Payback</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 bg-teal-50">
                        <td className="py-2 font-medium">Base Case</td>
                        <td className={cn('text-right', getIrrColor(result.base_case.irr))}>
                          {result.base_case.irr.toFixed(1)}%
                        </td>
                        <td className="text-right">{formatCurrency(result.base_case.npv)}</td>
                        <td className="text-right">{result.base_case.moic.toFixed(2)}x</td>
                        <td className="text-right">{result.base_case.payback_years} yrs</td>
                      </tr>
                      {result.scenarios.map((scenario) => (
                        <tr key={scenario.name} className="border-b border-gray-100">
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              {scenario.name === 'Upside' && <TrendingUp className="w-3 h-3 text-green-500" />}
                              {scenario.name === 'Downside' && <TrendingDown className="w-3 h-3 text-red-500" />}
                              {scenario.name}
                            </div>
                          </td>
                          <td className={cn('text-right', getIrrColor(scenario.irr))}>
                            {scenario.irr.toFixed(1)}%
                          </td>
                          <td className="text-right">{formatCurrency(scenario.npv)}</td>
                          <td className="text-right">{scenario.multiple_on_invested_capital.toFixed(2)}x</td>
                          <td className="text-right">{scenario.payback_years} yrs</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* AI Insights */}
              {result.insights.length > 0 && (
                <Card className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-amber-900">AI Insights</h3>
                  </div>
                  <div className="space-y-2">
                    {result.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-amber-800">
                        <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {insight}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
