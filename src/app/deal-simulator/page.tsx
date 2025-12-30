'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button, Progress } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Sliders,
  DollarSign,
  Percent,
  Calendar,
  Brain,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  BarChart3,
} from 'lucide-react'
import { motion } from 'framer-motion'

// Deal structure defaults
const DEFAULT_DEAL = {
  purchasePrice: 250,
  cashComponent: 70,
  stockComponent: 30,
  earnoutAmount: 50,
  earnoutProbability: 68,
  closingDate: '2025-03-31',
  breakupFee: 15,
  reverseFee: 25,
}

export default function DealSimulatorPage() {
  const [deal, setDeal] = useState(DEFAULT_DEAL)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const totalValue = deal.purchasePrice + (deal.earnoutAmount * deal.earnoutProbability / 100)
  const cashValue = deal.purchasePrice * deal.cashComponent / 100
  const stockValue = deal.purchasePrice * deal.stockComponent / 100

  const analyzeStructure = () => {
    setIsAnalyzing(true)
    setTimeout(() => setIsAnalyzing(false), 2000)
  }

  return (
    <MainLayout
      title="Deal Simulator"
      subtitle="Model deal structures and get real-time AI feedback on terms"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Deal Structure Panel */}
        <div className="col-span-2 space-y-6">
          {/* Purchase Price */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" />
                <h2 className="font-semibold text-gray-900">Purchase Price Structure</h2>
              </div>
              <Badge variant="info">
                Total: ${deal.purchasePrice}M
              </Badge>
            </div>

            <div className="space-y-6">
              {/* Base Purchase Price */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Base Purchase Price</label>
                  <span className="text-sm font-bold text-gray-900">${deal.purchasePrice}M</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={500}
                  value={deal.purchasePrice}
                  onChange={(e) => setDeal(d => ({ ...d, purchasePrice: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>$100M</span>
                  <span>$500M</span>
                </div>
              </div>

              {/* Cash vs Stock */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Cash Component</label>
                    <span className="text-sm font-bold text-green-600">{deal.cashComponent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={deal.cashComponent}
                    onChange={(e) => setDeal(d => ({ 
                      ...d, 
                      cashComponent: Number(e.target.value),
                      stockComponent: 100 - Number(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="text-xs text-gray-500 mt-1">${cashValue.toFixed(1)}M cash at close</div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Stock Component</label>
                    <span className="text-sm font-bold text-blue-600">{deal.stockComponent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={deal.stockComponent}
                    onChange={(e) => setDeal(d => ({ 
                      ...d, 
                      stockComponent: Number(e.target.value),
                      cashComponent: 100 - Number(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="text-xs text-gray-500 mt-1">${stockValue.toFixed(1)}M in acquirer stock</div>
                </div>
              </div>

              {/* Mix Visualization */}
              <div className="h-8 rounded-lg overflow-hidden flex">
                <motion.div
                  className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                  animate={{ width: `${deal.cashComponent}%` }}
                  transition={{ duration: 0.3 }}
                >
                  {deal.cashComponent > 15 && `Cash ${deal.cashComponent}%`}
                </motion.div>
                <motion.div
                  className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                  animate={{ width: `${deal.stockComponent}%` }}
                  transition={{ duration: 0.3 }}
                >
                  {deal.stockComponent > 15 && `Stock ${deal.stockComponent}%`}
                </motion.div>
              </div>
            </div>
          </Card>

          {/* Earnout Structure */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-600" />
                <h2 className="font-semibold text-gray-900">Earnout Structure</h2>
              </div>
              <Badge variant="warning">
                Expected: ${(deal.earnoutAmount * deal.earnoutProbability / 100).toFixed(1)}M
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Earnout Amount</label>
                  <span className="text-sm font-bold text-amber-600">${deal.earnoutAmount}M</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={deal.earnoutAmount}
                  onChange={(e) => setDeal(d => ({ ...d, earnoutAmount: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Achievement Probability</label>
                  <span className="text-sm font-bold text-amber-600">{deal.earnoutProbability}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={deal.earnoutProbability}
                  onChange={(e) => setDeal(d => ({ ...d, earnoutProbability: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 text-sm">
                <Brain className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800">
                  <strong>AI Assessment:</strong> Based on target's historical EBITDA growth of 12% YoY, 
                  earnout probability estimated at {deal.earnoutProbability}% by GPT-4 financial model.
                </span>
              </div>
            </div>
          </Card>

          {/* Deal Protection */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="font-semibold text-gray-900">Deal Protection</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Breakup Fee (Target)</label>
                  <span className="text-sm font-bold text-red-600">${deal.breakupFee}M</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={deal.breakupFee}
                  onChange={(e) => setDeal(d => ({ ...d, breakupFee: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {((deal.breakupFee / deal.purchasePrice) * 100).toFixed(1)}% of purchase price
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Reverse Breakup Fee</label>
                  <span className="text-sm font-bold text-purple-600">${deal.reverseFee}M</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={deal.reverseFee}
                  onChange={(e) => setDeal(d => ({ ...d, reverseFee: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {((deal.reverseFee / deal.purchasePrice) * 100).toFixed(1)}% of purchase price
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Analysis Panel */}
        <div className="space-y-4">
          {/* Summary */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Deal Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Base Price</span>
                <span className="font-semibold">${deal.purchasePrice}M</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Expected Earnout</span>
                <span className="font-semibold">${(deal.earnoutAmount * deal.earnoutProbability / 100).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Expected Value</span>
                <span className="font-bold text-teal-600">${totalValue.toFixed(1)}M</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Cash at Close</span>
                <span className="font-semibold text-green-600">${cashValue.toFixed(1)}M</span>
              </div>
            </div>
          </Card>

          {/* AI Analysis Button */}
          <Button
            className="w-full gap-2"
            onClick={analyzeStructure}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Analyze Structure
              </>
            )}
          </Button>

          {/* AI Insights */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-gray-900 text-sm">AI Insights</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Strong Structure</span>
                </div>
                <p className="text-xs text-green-700">
                  Cash-heavy deal ({deal.cashComponent}%) reduces execution risk.
                </p>
              </div>

              {deal.earnoutProbability < 50 && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Earnout Risk</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    Low earnout probability ({deal.earnoutProbability}%) - consider reducing earnout component.
                  </p>
                </div>
              )}

              {(deal.breakupFee / deal.purchasePrice) < 0.03 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Low Protection</span>
                  </div>
                  <p className="text-xs text-red-700">
                    Breakup fee below market standard (3-4% typical).
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Comparable Deals */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Market Comparables</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Similar Size Deals</span>
                <span className="font-medium">Avg 65% cash</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Earnout Range</span>
                <span className="font-medium">15-25% typical</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Breakup Fee</span>
                <span className="font-medium">3-4% standard</span>
              </div>
            </div>
          </Card>

          {/* Export */}
          <Button variant="secondary" className="w-full gap-2">
            <Download className="w-4 h-4" />
            Export Term Sheet
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
