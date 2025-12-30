'use client'

import { useState, useMemo } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Calculator,
  TrendingUp,
  Building2,
  DollarSign,
  Percent,
  BarChart3,
  Target,
  Info,
  RefreshCw,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface DCFInputs {
  revenue_base: number
  growth_rate_y1: number
  growth_rate_y5: number
  ebitda_margin: number
  capex_percent: number
  nwc_percent: number
  tax_rate: number
  wacc: number
  terminal_growth: number
}

interface ComparableCompany {
  name: string
  ev_revenue: number
  ev_ebitda: number
  revenue_growth: number
  ebitda_margin: number
}

const DEFAULT_DCF: DCFInputs = {
  revenue_base: 100000000,
  growth_rate_y1: 15,
  growth_rate_y5: 5,
  ebitda_margin: 20,
  capex_percent: 5,
  nwc_percent: 10,
  tax_rate: 25,
  wacc: 10,
  terminal_growth: 2.5,
}

const SAMPLE_COMPARABLES: ComparableCompany[] = [
  { name: 'CompetitorA Corp', ev_revenue: 3.5, ev_ebitda: 12.5, revenue_growth: 12, ebitda_margin: 22 },
  { name: 'IndustryLeader Inc', ev_revenue: 4.2, ev_ebitda: 14.0, revenue_growth: 18, ebitda_margin: 25 },
  { name: 'MidMarket Co', ev_revenue: 2.8, ev_ebitda: 10.0, revenue_growth: 8, ebitda_margin: 18 },
  { name: 'GrowthTarget Ltd', ev_revenue: 5.0, ev_ebitda: 16.5, revenue_growth: 25, ebitda_margin: 28 },
  { name: 'ValuePlay Corp', ev_revenue: 2.2, ev_ebitda: 8.5, revenue_growth: 5, ebitda_margin: 15 },
]

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export default function ValuationPage() {
  const [activeTab, setActiveTab] = useState<'dcf' | 'comparables' | 'summary'>('dcf')
  const [dcfInputs, setDcfInputs] = useState<DCFInputs>(DEFAULT_DCF)
  const [targetRevenue, setTargetRevenue] = useState(100000000)
  const [targetEbitda, setTargetEbitda] = useState(20000000)

  // DCF Calculation
  const dcfResult = useMemo(() => {
    const years = 5
    const projections: Array<{
      year: number
      revenue: number
      ebitda: number
      fcf: number
      discounted_fcf: number
    }> = []

    let cumulativeDiscountedFCF = 0

    for (let year = 1; year <= years; year++) {
      // Linear interpolation for growth rate
      const growthRate = dcfInputs.growth_rate_y1 + 
        (dcfInputs.growth_rate_y5 - dcfInputs.growth_rate_y1) * ((year - 1) / (years - 1))
      
      const prevRevenue = year === 1 
        ? dcfInputs.revenue_base 
        : projections[year - 2].revenue
      
      const revenue = prevRevenue * (1 + growthRate / 100)
      const ebitda = revenue * (dcfInputs.ebitda_margin / 100)
      const capex = revenue * (dcfInputs.capex_percent / 100)
      const nwcChange = year === 1 
        ? revenue * (dcfInputs.nwc_percent / 100) * 0.1 
        : (revenue - prevRevenue) * (dcfInputs.nwc_percent / 100)
      const taxes = ebitda * (dcfInputs.tax_rate / 100)
      const fcf = ebitda - taxes - capex - nwcChange
      const discountFactor = Math.pow(1 + dcfInputs.wacc / 100, year)
      const discountedFCF = fcf / discountFactor

      cumulativeDiscountedFCF += discountedFCF

      projections.push({
        year,
        revenue,
        ebitda,
        fcf,
        discounted_fcf: discountedFCF,
      })
    }

    // Terminal Value
    const terminalYearFCF = projections[years - 1].fcf
    const terminalValue = (terminalYearFCF * (1 + dcfInputs.terminal_growth / 100)) / 
      ((dcfInputs.wacc / 100) - (dcfInputs.terminal_growth / 100))
    const discountedTerminalValue = terminalValue / Math.pow(1 + dcfInputs.wacc / 100, years)

    const enterpriseValue = cumulativeDiscountedFCF + discountedTerminalValue

    return {
      projections,
      terminal_value: terminalValue,
      discounted_terminal_value: discountedTerminalValue,
      pv_of_fcf: cumulativeDiscountedFCF,
      enterprise_value: enterpriseValue,
      implied_ev_revenue: enterpriseValue / dcfInputs.revenue_base,
      implied_ev_ebitda: enterpriseValue / (dcfInputs.revenue_base * dcfInputs.ebitda_margin / 100),
    }
  }, [dcfInputs])

  // Comparables Calculation
  const comparablesResult = useMemo(() => {
    const avgEvRevenue = SAMPLE_COMPARABLES.reduce((sum, c) => sum + c.ev_revenue, 0) / SAMPLE_COMPARABLES.length
    const avgEvEbitda = SAMPLE_COMPARABLES.reduce((sum, c) => sum + c.ev_ebitda, 0) / SAMPLE_COMPARABLES.length
    const medianEvRevenue = [...SAMPLE_COMPARABLES].sort((a, b) => a.ev_revenue - b.ev_revenue)[2].ev_revenue
    const medianEvEbitda = [...SAMPLE_COMPARABLES].sort((a, b) => a.ev_ebitda - b.ev_ebitda)[2].ev_ebitda

    return {
      avg_ev_revenue: avgEvRevenue,
      avg_ev_ebitda: avgEvEbitda,
      median_ev_revenue: medianEvRevenue,
      median_ev_ebitda: medianEvEbitda,
      implied_value_revenue_avg: targetRevenue * avgEvRevenue,
      implied_value_revenue_median: targetRevenue * medianEvRevenue,
      implied_value_ebitda_avg: targetEbitda * avgEvEbitda,
      implied_value_ebitda_median: targetEbitda * medianEvEbitda,
    }
  }, [targetRevenue, targetEbitda])

  const updateDcfInput = (key: keyof DCFInputs, value: number) => {
    setDcfInputs(prev => ({ ...prev, [key]: value }))
  }

  return (
    <MainLayout
      title="Valuation Calculator"
      subtitle="DCF and comparable company analysis"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <Card className="p-2">
          <div className="flex gap-2">
            {[
              { id: 'dcf', label: 'DCF Analysis', icon: Calculator },
              { id: 'comparables', label: 'Comparable Companies', icon: Building2 },
              { id: 'summary', label: 'Valuation Summary', icon: Target },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition',
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </Card>

        {/* DCF Tab */}
        {activeTab === 'dcf' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Inputs */}
            <div className="col-span-1 space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">DCF Assumptions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 flex justify-between">
                      Base Revenue
                      <span className="font-medium">{formatCurrency(dcfInputs.revenue_base)}</span>
                    </label>
                    <input
                      type="range"
                      min={10000000}
                      max={500000000}
                      step={5000000}
                      value={dcfInputs.revenue_base}
                      onChange={(e) => updateDcfInput('revenue_base', Number(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 flex justify-between">
                      Year 1 Growth
                      <span className="font-medium">{dcfInputs.growth_rate_y1}%</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      step={1}
                      value={dcfInputs.growth_rate_y1}
                      onChange={(e) => updateDcfInput('growth_rate_y1', Number(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 flex justify-between">
                      Year 5 Growth
                      <span className="font-medium">{dcfInputs.growth_rate_y5}%</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      step={0.5}
                      value={dcfInputs.growth_rate_y5}
                      onChange={(e) => updateDcfInput('growth_rate_y5', Number(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 flex justify-between">
                      EBITDA Margin
                      <span className="font-medium">{dcfInputs.ebitda_margin}%</span>
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={40}
                      step={1}
                      value={dcfInputs.ebitda_margin}
                      onChange={(e) => updateDcfInput('ebitda_margin', Number(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 flex justify-between">
                      WACC
                      <span className="font-medium">{dcfInputs.wacc}%</span>
                    </label>
                    <input
                      type="range"
                      min={6}
                      max={18}
                      step={0.5}
                      value={dcfInputs.wacc}
                      onChange={(e) => updateDcfInput('wacc', Number(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 flex justify-between">
                      Terminal Growth
                      <span className="font-medium">{dcfInputs.terminal_growth}%</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={0.25}
                      value={dcfInputs.terminal_growth}
                      onChange={(e) => updateDcfInput('terminal_growth', Number(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Results */}
            <div className="col-span-2 space-y-4">
              {/* Enterprise Value */}
              <Card className="p-6 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-teal-600 font-medium">DCF Enterprise Value</div>
                    <div className="text-4xl font-bold text-teal-900 mt-1">
                      {formatCurrency(dcfResult.enterprise_value)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Implied Multiples</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {dcfResult.implied_ev_revenue.toFixed(1)}x Revenue
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {dcfResult.implied_ev_ebitda.toFixed(1)}x EBITDA
                    </div>
                  </div>
                </div>
              </Card>

              {/* Value Bridge */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Value Bridge</h3>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-sm text-gray-500">PV of FCF</div>
                    <div className="text-xl font-bold text-blue-600">{formatCurrency(dcfResult.pv_of_fcf)}</div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-300" />
                  <div className="text-center flex-1">
                    <div className="text-sm text-gray-500">PV of Terminal</div>
                    <div className="text-xl font-bold text-purple-600">{formatCurrency(dcfResult.discounted_terminal_value)}</div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-300" />
                  <div className="text-center flex-1">
                    <div className="text-sm text-gray-500">Enterprise Value</div>
                    <div className="text-xl font-bold text-teal-600">{formatCurrency(dcfResult.enterprise_value)}</div>
                  </div>
                </div>
              </Card>

              {/* Projections Table */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">5-Year Projections</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-500">Year</th>
                      <th className="text-right py-2 font-medium text-gray-500">Revenue</th>
                      <th className="text-right py-2 font-medium text-gray-500">EBITDA</th>
                      <th className="text-right py-2 font-medium text-gray-500">FCF</th>
                      <th className="text-right py-2 font-medium text-gray-500">PV of FCF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dcfResult.projections.map((p) => (
                      <tr key={p.year} className="border-b border-gray-100">
                        <td className="py-2 font-medium">Year {p.year}</td>
                        <td className="py-2 text-right">{formatCurrency(p.revenue)}</td>
                        <td className="py-2 text-right">{formatCurrency(p.ebitda)}</td>
                        <td className="py-2 text-right">{formatCurrency(p.fcf)}</td>
                        <td className="py-2 text-right text-teal-600 font-medium">{formatCurrency(p.discounted_fcf)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td className="py-2 font-medium">Terminal</td>
                      <td className="py-2 text-right">—</td>
                      <td className="py-2 text-right">—</td>
                      <td className="py-2 text-right">{formatCurrency(dcfResult.terminal_value)}</td>
                      <td className="py-2 text-right text-purple-600 font-medium">{formatCurrency(dcfResult.discounted_terminal_value)}</td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        )}

        {/* Comparables Tab */}
        {activeTab === 'comparables' && (
          <div className="space-y-6">
            {/* Target Inputs */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Target Company Metrics</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">LTM Revenue</label>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={targetRevenue}
                      onChange={(e) => setTargetRevenue(Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">LTM EBITDA</label>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={targetEbitda}
                      onChange={(e) => setTargetEbitda(Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Comparables Table */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Comparable Companies</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-500">Company</th>
                    <th className="text-right py-2 font-medium text-gray-500">EV/Revenue</th>
                    <th className="text-right py-2 font-medium text-gray-500">EV/EBITDA</th>
                    <th className="text-right py-2 font-medium text-gray-500">Revenue Growth</th>
                    <th className="text-right py-2 font-medium text-gray-500">EBITDA Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_COMPARABLES.map((comp, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-3 font-medium">{comp.name}</td>
                      <td className="py-3 text-right">{comp.ev_revenue.toFixed(1)}x</td>
                      <td className="py-3 text-right">{comp.ev_ebitda.toFixed(1)}x</td>
                      <td className="py-3 text-right">{comp.revenue_growth}%</td>
                      <td className="py-3 text-right">{comp.ebitda_margin}%</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 font-semibold">
                    <td className="py-3">Average</td>
                    <td className="py-3 text-right">{comparablesResult.avg_ev_revenue.toFixed(1)}x</td>
                    <td className="py-3 text-right">{comparablesResult.avg_ev_ebitda.toFixed(1)}x</td>
                    <td className="py-3 text-right">—</td>
                    <td className="py-3 text-right">—</td>
                  </tr>
                  <tr className="bg-purple-50 font-semibold">
                    <td className="py-3">Median</td>
                    <td className="py-3 text-right">{comparablesResult.median_ev_revenue.toFixed(1)}x</td>
                    <td className="py-3 text-right">{comparablesResult.median_ev_ebitda.toFixed(1)}x</td>
                    <td className="py-3 text-right">—</td>
                    <td className="py-3 text-right">—</td>
                  </tr>
                </tbody>
              </table>
            </Card>

            {/* Implied Values */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">EV/Revenue Implied Value</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">Average Multiple</span>
                    <span className="text-xl font-bold text-blue-700">
                      {formatCurrency(comparablesResult.implied_value_revenue_avg)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-700">Median Multiple</span>
                    <span className="text-xl font-bold text-purple-700">
                      {formatCurrency(comparablesResult.implied_value_revenue_median)}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">EV/EBITDA Implied Value</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700">Average Multiple</span>
                    <span className="text-xl font-bold text-blue-700">
                      {formatCurrency(comparablesResult.implied_value_ebitda_avg)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-700">Median Multiple</span>
                    <span className="text-xl font-bold text-purple-700">
                      {formatCurrency(comparablesResult.implied_value_ebitda_median)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Valuation Summary</h3>
              
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-teal-50 rounded-xl">
                  <div className="text-sm text-teal-600 font-medium mb-2">DCF Value</div>
                  <div className="text-3xl font-bold text-teal-700">{formatCurrency(dcfResult.enterprise_value)}</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <div className="text-sm text-blue-600 font-medium mb-2">Comps (Revenue)</div>
                  <div className="text-3xl font-bold text-blue-700">{formatCurrency(comparablesResult.implied_value_revenue_median)}</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-xl">
                  <div className="text-sm text-purple-600 font-medium mb-2">Comps (EBITDA)</div>
                  <div className="text-3xl font-bold text-purple-700">{formatCurrency(comparablesResult.implied_value_ebitda_median)}</div>
                </div>
              </div>

              {/* Football Field */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Valuation Range</h4>
                <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Range bars */}
                  {[
                    { label: 'DCF', low: dcfResult.enterprise_value * 0.85, mid: dcfResult.enterprise_value, high: dcfResult.enterprise_value * 1.15, color: 'teal' },
                    { label: 'EV/Revenue', low: comparablesResult.implied_value_revenue_median * 0.8, mid: comparablesResult.implied_value_revenue_median, high: comparablesResult.implied_value_revenue_avg, color: 'blue' },
                    { label: 'EV/EBITDA', low: comparablesResult.implied_value_ebitda_median * 0.8, mid: comparablesResult.implied_value_ebitda_median, high: comparablesResult.implied_value_ebitda_avg, color: 'purple' },
                  ].map((method, i) => {
                    const allValues = [
                      dcfResult.enterprise_value * 0.7,
                      dcfResult.enterprise_value * 1.3,
                      comparablesResult.implied_value_revenue_avg * 1.2,
                      comparablesResult.implied_value_ebitda_avg * 1.2,
                    ]
                    const maxVal = Math.max(...allValues)
                    const minVal = Math.min(...allValues) * 0.5
                    const scale = (v: number) => ((v - minVal) / (maxVal - minVal)) * 100

                    return (
                      <div key={method.label} className="absolute left-0 right-0" style={{ top: `${20 + i * 35}px` }}>
                        <div className="flex items-center px-4">
                          <span className="w-24 text-xs font-medium text-gray-600">{method.label}</span>
                          <div className="flex-1 relative h-6">
                            <div
                              className={cn('absolute h-full rounded', `bg-${method.color}-200`)}
                              style={{ left: `${scale(method.low)}%`, width: `${scale(method.high) - scale(method.low)}%` }}
                            />
                            <div
                              className={cn('absolute w-1 h-full', `bg-${method.color}-600`)}
                              style={{ left: `${scale(method.mid)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recommendation */}
              <Card className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-900 mb-1">Valuation Insight</div>
                    <p className="text-sm text-amber-800">
                      Based on the analysis, the implied enterprise value ranges from{' '}
                      <strong>{formatCurrency(Math.min(dcfResult.enterprise_value, comparablesResult.implied_value_ebitda_median) * 0.9)}</strong>{' '}
                      to{' '}
                      <strong>{formatCurrency(Math.max(dcfResult.enterprise_value, comparablesResult.implied_value_revenue_avg) * 1.1)}</strong>.
                      The DCF suggests a {dcfResult.implied_ev_ebitda.toFixed(1)}x EBITDA multiple, which is{' '}
                      {dcfResult.implied_ev_ebitda > comparablesResult.median_ev_ebitda ? 'above' : 'below'} the peer median of{' '}
                      {comparablesResult.median_ev_ebitda.toFixed(1)}x.
                    </p>
                  </div>
                </div>
              </Card>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
