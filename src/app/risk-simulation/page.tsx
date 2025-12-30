'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button, Progress } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Download,
  AlertTriangle,
  CheckCircle,
  Target,
  Percent,
  DollarSign,
  BarChart3,
  Activity,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Simulation parameters
const DEFAULT_PARAMS = {
  baseValue: 250,
  volatility: 20,
  iterations: 10000,
  timeHorizon: 5,
}

// Mock simulation results
const SIMULATION_RESULTS = {
  expectedValue: 287.5,
  p10: 198.2,
  p25: 234.6,
  p50: 278.9,
  p75: 332.4,
  p90: 389.1,
  probability: {
    above300: 42,
    above250: 68,
    below200: 8,
  },
  riskFactors: [
    { name: 'MAC Clause Trigger', probability: 12, impact: -45, model: 'claude' },
    { name: 'Regulatory Delay', probability: 25, impact: -15, model: 'gpt-4' },
    { name: 'Earnout Achievement', probability: 68, impact: 50, model: 'consensus' },
    { name: 'Integration Synergies', probability: 75, impact: 30, model: 'gpt-4' },
    { name: 'Key Employee Retention', probability: 85, impact: 20, model: 'claude' },
  ],
}

// Mock distribution data for visualization
const DISTRIBUTION_BARS = Array.from({ length: 40 }, (_, i) => {
  const x = 150 + i * 10
  const mean = 280
  const std = 60
  const height = Math.exp(-Math.pow(x - mean, 2) / (2 * std * std)) * 100
  return { x, height, isTarget: x >= 250 && x <= 300 }
})

export default function RiskSimulationPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [iterations, setIterations] = useState(0)
  const [showResults, setShowResults] = useState(true)
  const [params, setParams] = useState(DEFAULT_PARAMS)

  const runSimulation = () => {
    setIsRunning(true)
    setProgress(0)
    setIterations(0)
    setShowResults(false)

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15
        if (next >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          setShowResults(true)
          return 100
        }
        setIterations(Math.floor((next / 100) * params.iterations))
        return next
      })
    }, 200)
  }

  return (
    <MainLayout
      title="Risk Simulation"
      subtitle="Monte Carlo simulation with multi-model probability analysis"
    >
      <div className="space-y-6">
        {/* Control Panel */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Base Value ($M)</label>
                <input
                  type="number"
                  value={params.baseValue}
                  onChange={(e) => setParams(p => ({ ...p, baseValue: Number(e.target.value) }))}
                  className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Volatility (%)</label>
                <input
                  type="number"
                  value={params.volatility}
                  onChange={(e) => setParams(p => ({ ...p, volatility: Number(e.target.value) }))}
                  className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Iterations</label>
                <select
                  value={params.iterations}
                  onChange={(e) => setParams(p => ({ ...p, iterations: Number(e.target.value) }))}
                  className="w-28 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  disabled={isRunning}
                >
                  <option value={1000}>1,000</option>
                  <option value={10000}>10,000</option>
                  <option value={50000}>50,000</option>
                  <option value={100000}>100,000</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Time Horizon (Years)</label>
                <input
                  type="number"
                  value={params.timeHorizon}
                  onChange={(e) => setParams(p => ({ ...p, timeHorizon: Number(e.target.value) }))}
                  className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  disabled={isRunning}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setParams(DEFAULT_PARAMS)
                  setShowResults(false)
                }}
                disabled={isRunning}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button
                onClick={runSimulation}
                disabled={isRunning}
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Activity className="w-4 h-4 animate-pulse" />
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

          {/* Progress Bar */}
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Running {iterations.toLocaleString()} / {params.iterations.toLocaleString()} iterations...
                </span>
                <span className="text-sm font-medium text-teal-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} size="lg" />
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-amber-700">C</span>
                  </div>
                  Claude analyzing risk factors
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-emerald-700">G4</span>
                  </div>
                  GPT-4 computing distributions
                </span>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-5 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-3xl font-bold text-gray-900">${SIMULATION_RESULTS.expectedValue}M</div>
                  <div className="text-sm text-gray-500 mt-1">Expected Value</div>
                  <Badge variant="success" className="mt-2">
                    <TrendingUp className="w-3 h-3" />
                    +15%
                  </Badge>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">${SIMULATION_RESULTS.p10}M</div>
                  <div className="text-sm text-gray-500 mt-1">P10 (Downside)</div>
                  <div className="text-xs text-gray-400 mt-2">10th percentile</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-3xl font-bold text-gray-900">${SIMULATION_RESULTS.p50}M</div>
                  <div className="text-sm text-gray-500 mt-1">P50 (Median)</div>
                  <div className="text-xs text-gray-400 mt-2">50th percentile</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">${SIMULATION_RESULTS.p90}M</div>
                  <div className="text-sm text-gray-500 mt-1">P90 (Upside)</div>
                  <div className="text-xs text-gray-400 mt-2">90th percentile</div>
                </Card>
                <Card className="p-4 text-center bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
                  <div className="text-3xl font-bold text-teal-700">{SIMULATION_RESULTS.probability.above250}%</div>
                  <div className="text-sm text-teal-600 mt-1">Probability {'>'} $250M</div>
                  <div className="text-xs text-teal-500 mt-2">Target threshold</div>
                </Card>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Distribution Chart */}
                <Card className="col-span-2 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Value Distribution</h3>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-teal-500" />
                        Target Range
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-gray-300" />
                        Other Outcomes
                      </span>
                    </div>
                  </div>
                  <div className="h-64 flex items-end gap-0.5 px-4">
                    {DISTRIBUTION_BARS.map((bar, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${bar.height}%` }}
                        transition={{ delay: i * 0.02, duration: 0.3 }}
                        className={cn(
                          'flex-1 rounded-t',
                          bar.isTarget ? 'bg-teal-500' : 'bg-gray-300'
                        )}
                        title={`$${bar.x}M`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500 px-4">
                    <span>$150M</span>
                    <span>$250M</span>
                    <span>$350M</span>
                    <span>$450M</span>
                  </div>
                </Card>

                {/* Probability Breakdown */}
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Outcome Probabilities</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Above $300M</span>
                        <span className="font-medium text-green-600">{SIMULATION_RESULTS.probability.above300}%</span>
                      </div>
                      <Progress value={SIMULATION_RESULTS.probability.above300} variant="success" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Above $250M (Target)</span>
                        <span className="font-medium text-teal-600">{SIMULATION_RESULTS.probability.above250}%</span>
                      </div>
                      <Progress value={SIMULATION_RESULTS.probability.above250} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Below $200M (Risk)</span>
                        <span className="font-medium text-red-600">{SIMULATION_RESULTS.probability.below200}%</span>
                      </div>
                      <Progress value={SIMULATION_RESULTS.probability.below200} variant="danger" />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Simulation Parameters</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Iterations</span>
                        <span className="font-mono">{params.iterations.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Volatility</span>
                        <span className="font-mono">{params.volatility}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time Horizon</span>
                        <span className="font-mono">{params.timeHorizon} years</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Risk Factors */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h3 className="font-semibold text-gray-900">Risk Factors (AI-Identified)</h3>
                  </div>
                  <Badge variant="info">
                    <Brain className="w-3 h-3" />
                    Multi-Model Analysis
                  </Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b">
                        <th className="pb-3 font-medium">Risk Factor</th>
                        <th className="pb-3 font-medium text-center">Probability</th>
                        <th className="pb-3 font-medium text-center">Impact ($M)</th>
                        <th className="pb-3 font-medium text-center">Expected Impact</th>
                        <th className="pb-3 font-medium text-center">Identified By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {SIMULATION_RESULTS.riskFactors.map((risk, i) => (
                        <motion.tr
                          key={risk.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-sm"
                        >
                          <td className="py-3 font-medium text-gray-900">{risk.name}</td>
                          <td className="py-3 text-center">
                            <Badge variant={risk.probability > 50 ? 'success' : risk.probability > 25 ? 'warning' : 'danger'}>
                              {risk.probability}%
                            </Badge>
                          </td>
                          <td className={cn(
                            'py-3 text-center font-medium',
                            risk.impact > 0 ? 'text-green-600' : 'text-red-600'
                          )}>
                            {risk.impact > 0 ? '+' : ''}{risk.impact}
                          </td>
                          <td className={cn(
                            'py-3 text-center font-medium',
                            (risk.probability * risk.impact / 100) > 0 ? 'text-green-600' : 'text-red-600'
                          )}>
                            {((risk.probability * risk.impact / 100) > 0 ? '+' : '')}{(risk.probability * risk.impact / 100).toFixed(1)}
                          </td>
                          <td className="py-3 text-center">
                            <Badge variant={
                              risk.model === 'claude' ? 'claude' :
                              risk.model === 'gpt-4' ? 'gpt4' : 'consensus'
                            }>
                              {risk.model}
                            </Badge>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Multi-Model Attribution */}
              <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Multi-Model Monte Carlo</h3>
                    <p className="text-sm text-gray-600">
                      Risk factors identified by Claude, probability distributions computed by GPT-4, 
                      and cross-validated through consensus. This provides more robust risk estimates than single-model analysis.
                    </p>
                  </div>
                  <Button variant="secondary">
                    <Download className="w-4 h-4" />
                    Export Analysis
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  )
}
