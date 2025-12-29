'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Button, Badge, Progress } from '@/components/ui'
import { cn } from '@/lib/utils'
import { ROUTING_RULES } from '@/lib/ai/orchestrator'
import type { ModelType } from '@/types'
import { 
  GitBranch, 
  Brain,
  Zap,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  DollarSign,
  ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'

const ORCHESTRATION_METRICS = {
  totalRequests: 1247,
  avgLatencyMs: 2340,
  consensusRate: 0.94,
  costToday: 12.47,
  modelUsage: [
    { model: 'claude' as ModelType, requests: 523, tokens: 892000, avgLatency: 2100, specialty: 'Contracts & Risk' },
    { model: 'gpt-4' as ModelType, requests: 412, tokens: 645000, avgLatency: 2800, specialty: 'Financial Analysis' },
    { model: 'gemini' as ModelType, requests: 312, tokens: 421000, avgLatency: 1600, specialty: 'Search & Research' },
  ],
  routingDecisions: [
    { time: '2 min ago', task: 'Contract MAC clause analysis', routed: 'claude', reason: 'Legal complexity requires nuanced reasoning', confidence: 0.94 },
    { time: '5 min ago', task: 'EBITDA reconciliation', routed: 'gpt-4', reason: 'Numerical computation task', confidence: 0.91 },
    { time: '8 min ago', task: 'Comparable transaction search', routed: 'gemini', reason: 'Information retrieval task', confidence: 0.89 },
    { time: '12 min ago', task: 'Deal recommendation', routed: 'consensus', reason: 'High-stakes decision requires all models', confidence: 0.96 },
  ],
}

export default function OrchestrationPage() {
  const [selectedRule, setSelectedRule] = useState<string | null>(null)
  const metrics = ORCHESTRATION_METRICS

  return (
    <MainLayout 
      title="Model Orchestration" 
      subtitle="Intelligent routing engine that assigns tasks to the best-suited AI model"
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalRequests.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Requests (24h)</p>
          </Card>
          <Card className="p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{(metrics.avgLatencyMs / 1000).toFixed(1)}s</p>
            <p className="text-sm text-gray-500">Avg Latency</p>
          </Card>
          <Card className="p-6">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{(metrics.consensusRate * 100).toFixed(0)}%</p>
            <p className="text-sm text-gray-500">Consensus Rate</p>
          </Card>
          <Card className="p-6">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">${metrics.costToday.toFixed(2)}</p>
            <p className="text-sm text-gray-500">API Cost Today</p>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Routing Rules */}
          <div className="col-span-2">
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Intelligent Routing Rules</h2>
                <p className="text-sm text-gray-500">How DealScope decides which model handles each task</p>
              </div>
              <div className="divide-y divide-gray-100">
                {Object.entries(ROUTING_RULES).map(([key, rule]) => (
                  <div
                    key={key}
                    className={cn(
                      'px-6 py-4 cursor-pointer transition-colors',
                      selectedRule === key ? 'bg-teal-50' : 'hover:bg-gray-50'
                    )}
                    onClick={() => setSelectedRule(selectedRule === key ? null : key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          key === 'high_stakes_decision' ? 'bg-purple-100' :
                          rule.primaryModel === 'claude' ? 'bg-amber-100' :
                          rule.primaryModel === 'gpt-4' ? 'bg-emerald-100' : 'bg-blue-100'
                        )}>
                          <Brain className={cn(
                            'w-5 h-5',
                            key === 'high_stakes_decision' ? 'text-purple-600' :
                            rule.primaryModel === 'claude' ? 'text-amber-600' :
                            rule.primaryModel === 'gpt-4' ? 'text-emerald-600' : 'text-blue-600'
                          )} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 capitalize">
                            {key.replace(/_/g, ' ')}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {key === 'high_stakes_decision' ? 'All 3 models → Consensus' :
                             `${rule.primaryModel} → ${rule.validatorModel || 'No validator'}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {rule.useConsensus && <Badge variant="consensus">Consensus</Badge>}
                        <ChevronRight className={cn(
                          'w-5 h-5 text-gray-400 transition-transform',
                          selectedRule === key && 'rotate-90'
                        )} />
                      </div>
                    </div>

                    {selectedRule === key && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Primary</p>
                            <Badge variant={rule.primaryModel === 'claude' ? 'claude' : rule.primaryModel === 'gpt-4' ? 'gpt4' : 'gemini'}>
                              {rule.primaryModel}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Validator</p>
                            {rule.validatorModel ? (
                              <Badge variant={rule.validatorModel === 'claude' ? 'claude' : rule.validatorModel === 'gpt-4' ? 'gpt4' : 'gemini'}>
                                {rule.validatorModel}
                              </Badge>
                            ) : <span className="text-gray-400">None</span>}
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Timeout</p>
                            <span className="font-mono">{rule.timeoutMs / 1000}s</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Model Performance */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Model Performance</h2>
              </div>
              <div className="p-4 space-y-4">
                {metrics.modelUsage.map((usage) => {
                  const colors = {
                    claude: 'bg-amber-50 border-amber-200 text-amber-700',
                    'gpt-4': 'bg-emerald-50 border-emerald-200 text-emerald-700',
                    gemini: 'bg-blue-50 border-blue-200 text-blue-700',
                  }
                  return (
                    <div key={usage.model} className={cn('p-4 rounded-lg border', colors[usage.model])}>
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4" />
                        <span className="font-medium">{usage.model}</span>
                      </div>
                      <p className="text-xs opacity-70 mb-3">{usage.specialty}</p>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <p className="font-semibold">{usage.requests}</p>
                          <p className="opacity-70">requests</p>
                        </div>
                        <div>
                          <p className="font-semibold">{(usage.tokens / 1000).toFixed(0)}K</p>
                          <p className="opacity-70">tokens</p>
                        </div>
                        <div>
                          <p className="font-semibold">{(usage.avgLatency / 1000).toFixed(1)}s</p>
                          <p className="opacity-70">latency</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Routing Decisions */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Routing Decisions</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {metrics.routingDecisions.map((decision, index) => (
              <div key={index} className="px-6 py-4 flex items-center gap-6">
                <span className="text-xs text-gray-400 w-16">{decision.time}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{decision.task}</p>
                  <p className="text-xs text-gray-500">{decision.reason}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
                <Badge variant={
                  decision.routed === 'claude' ? 'claude' :
                  decision.routed === 'gpt-4' ? 'gpt4' :
                  decision.routed === 'gemini' ? 'gemini' : 'consensus'
                }>
                  {decision.routed}
                </Badge>
                <span className="text-sm font-medium text-gray-600">
                  {(decision.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Architecture Explanation */}
        <Card className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">
              Why Multi-Model Orchestration Matters
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each AI model has different strengths. DealScope leverages all three to provide 
              more accurate, reliable, and comprehensive analysis than any single model could achieve.
            </p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-2 mx-auto">
                <GitBranch className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-sm font-medium">Task</p>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-300" />
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-2 mx-auto">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm font-medium">Classify</p>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-300" />
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">C</div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">G4</div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">Ge</div>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-300" />
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-2 mx-auto">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm font-medium">Consensus</p>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-300" />
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-2 mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-medium">Result</p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
