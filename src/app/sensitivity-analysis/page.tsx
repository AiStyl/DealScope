'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Table2,
  Brain,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  Minus,
} from 'lucide-react'
import { motion } from 'framer-motion'

// Sensitivity matrix data
const SENSITIVITY_DATA = {
  baseCase: {
    revenue: 120,
    margin: 25,
    multiple: 8,
    value: 240,
  },
  revenueRange: [-20, -10, 0, 10, 20],
  marginRange: [-5, -2.5, 0, 2.5, 5],
  multipleRange: [6, 7, 8, 9, 10],
}

// Calculate enterprise value
const calculateValue = (revenue: number, margin: number, multiple: number) => {
  const ebitda = revenue * (margin / 100)
  return ebitda * multiple
}

// Generate matrix values
const generateMatrix = () => {
  const matrix: number[][] = []
  for (const revDelta of SENSITIVITY_DATA.revenueRange) {
    const row: number[] = []
    for (const marginDelta of SENSITIVITY_DATA.marginRange) {
      const value = calculateValue(
        SENSITIVITY_DATA.baseCase.revenue * (1 + revDelta / 100),
        SENSITIVITY_DATA.baseCase.margin + marginDelta,
        SENSITIVITY_DATA.baseCase.multiple
      )
      row.push(Math.round(value))
    }
    matrix.push(row)
  }
  return matrix
}

const MATRIX = generateMatrix()

export default function SensitivityAnalysisPage() {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const baseValue = SENSITIVITY_DATA.baseCase.value

  const getCellColor = (value: number) => {
    const diff = ((value - baseValue) / baseValue) * 100
    if (diff > 15) return 'bg-green-500 text-white'
    if (diff > 5) return 'bg-green-300'
    if (diff > -5) return 'bg-gray-100'
    if (diff > -15) return 'bg-red-300'
    return 'bg-red-500 text-white'
  }

  return (
    <MainLayout
      title="Sensitivity Analysis"
      subtitle="Multi-variable what-if analysis with AI-powered scenario modeling"
    >
      <div className="space-y-6">
        {/* Base Case Summary */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-500">Base Revenue</div>
            <div className="text-2xl font-bold text-gray-900">${SENSITIVITY_DATA.baseCase.revenue}M</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">EBITDA Margin</div>
            <div className="text-2xl font-bold text-gray-900">{SENSITIVITY_DATA.baseCase.margin}%</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">EV/EBITDA Multiple</div>
            <div className="text-2xl font-bold text-gray-900">{SENSITIVITY_DATA.baseCase.multiple}x</div>
          </Card>
          <Card className="p-4 bg-teal-50 border-teal-200">
            <div className="text-sm text-teal-600">Enterprise Value</div>
            <div className="text-2xl font-bold text-teal-700">${SENSITIVITY_DATA.baseCase.value}M</div>
          </Card>
        </div>

        {/* Sensitivity Matrix */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Table2 className="w-5 h-5 text-teal-600" />
              <h2 className="font-semibold text-gray-900">Revenue vs. Margin Sensitivity</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span>-15%+</span>
                <div className="w-4 h-4 rounded bg-red-300" />
                <span>-5%</span>
                <div className="w-4 h-4 rounded bg-gray-100 border" />
                <span>Base</span>
                <div className="w-4 h-4 rounded bg-green-300" />
                <span>+5%</span>
                <div className="w-4 h-4 rounded bg-green-500" />
                <span>+15%+</span>
              </div>
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 bg-gray-50 rounded-tl-lg">
                    Revenue ↓ / Margin →
                  </th>
                  {SENSITIVITY_DATA.marginRange.map((delta) => (
                    <th key={delta} className="p-3 text-center text-xs font-medium text-gray-500 bg-gray-50">
                      {delta >= 0 ? '+' : ''}{delta}% ({SENSITIVITY_DATA.baseCase.margin + delta}%)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="p-3 text-xs font-medium text-gray-500 bg-gray-50">
                      {SENSITIVITY_DATA.revenueRange[rowIndex] >= 0 ? '+' : ''}
                      {SENSITIVITY_DATA.revenueRange[rowIndex]}% 
                      (${Math.round(SENSITIVITY_DATA.baseCase.revenue * (1 + SENSITIVITY_DATA.revenueRange[rowIndex] / 100))}M)
                    </td>
                    {row.map((value, colIndex) => {
                      const isBase = rowIndex === 2 && colIndex === 2
                      const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                      return (
                        <td
                          key={colIndex}
                          className={cn(
                            'p-3 text-center cursor-pointer transition-all',
                            getCellColor(value),
                            isBase && 'ring-2 ring-teal-500 ring-offset-2',
                            isSelected && 'ring-2 ring-blue-500 ring-offset-2'
                          )}
                          onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                        >
                          <div className="font-semibold">${value}M</div>
                          <div className="text-xs opacity-75">
                            {value > baseValue ? '+' : ''}{Math.round((value - baseValue) / baseValue * 100)}%
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Multiple Sensitivity */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Multiple Sensitivity (at Base Case)</h2>
          </div>

          <div className="flex items-center gap-4">
            {SENSITIVITY_DATA.multipleRange.map((multiple) => {
              const value = calculateValue(
                SENSITIVITY_DATA.baseCase.revenue,
                SENSITIVITY_DATA.baseCase.margin,
                multiple
              )
              const isBase = multiple === SENSITIVITY_DATA.baseCase.multiple
              return (
                <motion.div
                  key={multiple}
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    'flex-1 p-4 rounded-xl text-center border-2 transition-colors',
                    isBase
                      ? 'bg-teal-50 border-teal-500'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="text-sm text-gray-500 mb-1">{multiple}x Multiple</div>
                  <div className={cn(
                    'text-2xl font-bold',
                    isBase ? 'text-teal-700' : 'text-gray-900'
                  )}>
                    ${Math.round(value)}M
                  </div>
                  <div className={cn(
                    'text-xs mt-1',
                    value > baseValue ? 'text-green-600' : value < baseValue ? 'text-red-600' : 'text-gray-500'
                  )}>
                    {value > baseValue ? '+' : ''}{Math.round((value - baseValue) / baseValue * 100)}% vs base
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Card>

        {/* AI Analysis */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Upside Scenario</h3>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">$312M</div>
            <p className="text-xs text-gray-600 mb-3">
              +20% revenue, +5% margin expansion
            </p>
            <div className="p-2 bg-green-50 rounded text-xs text-green-700">
              <strong>Claude:</strong> Achievable if synergies realized within 18 months
            </div>
          </Card>

          <Card className="p-4 bg-teal-50 border-teal-200">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-teal-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Base Case</h3>
            </div>
            <div className="text-2xl font-bold text-teal-700 mb-2">$240M</div>
            <p className="text-xs text-gray-600 mb-3">
              Current projections, 8x multiple
            </p>
            <div className="p-2 bg-teal-100 rounded text-xs text-teal-700">
              <strong>Consensus:</strong> 85% confidence in base case assumptions
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Downside Scenario</h3>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-2">$180M</div>
            <p className="text-xs text-gray-600 mb-3">
              -20% revenue, -5% margin compression
            </p>
            <div className="p-2 bg-red-50 rounded text-xs text-red-700">
              <strong>GPT-4:</strong> 12% probability based on market conditions
            </div>
          </Card>
        </div>

        {/* Key Drivers */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900">Key Value Drivers (AI-Identified)</h2>
            </div>
            <Badge variant="info">
              <Brain className="w-3 h-3" />
              Multi-Model Analysis
            </Badge>
          </div>

          <div className="space-y-4">
            {[
              { driver: 'Revenue Growth Rate', impact: 'High', current: '+8% YoY', model: 'gpt-4', note: 'Each 1% change = $12M value' },
              { driver: 'EBITDA Margin', impact: 'High', current: '25%', model: 'claude', note: 'Each 1% change = $9.6M value' },
              { driver: 'Comparable Multiple', impact: 'Medium', current: '8x', model: 'consensus', note: 'Range: 6-10x for sector' },
              { driver: 'Working Capital', impact: 'Low', current: '$15M', model: 'gpt-4', note: 'Standard for industry' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.driver}</div>
                  <div className="text-xs text-gray-500">{item.note}</div>
                </div>
                <Badge variant={
                  item.impact === 'High' ? 'danger' :
                  item.impact === 'Medium' ? 'warning' : 'default'
                }>
                  {item.impact} Impact
                </Badge>
                <div className="text-sm font-medium text-gray-900 w-20">{item.current}</div>
                <Badge variant={
                  item.model === 'claude' ? 'claude' :
                  item.model === 'gpt-4' ? 'gpt4' : 'consensus'
                }>
                  {item.model}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
