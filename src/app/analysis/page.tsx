'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Button, Badge, Progress } from '@/components/ui'
import { AgentCard, ConsensusBuilder } from '@/components/agents'
import { MOCK_AGENT_RESPONSES } from '@/lib/ai/mockData'
import { cn } from '@/lib/utils'
import type { AgentResponse, ModelType } from '@/types'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FileText, 
  Upload,
  Sparkles,
  Clock,
  Coins,
  CheckCircle2,
  AlertCircle,
  Brain
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type AnalysisStage = 'idle' | 'uploading' | 'analyzing' | 'consensus' | 'complete'
type AgentStatus = 'idle' | 'thinking' | 'responding' | 'complete' | 'error'

interface AgentState {
  id: string
  name: string
  role: string
  model: ModelType
  status: AgentStatus
  content: string
  confidence: number
  tokens: number
  latencyMs: number
}

export default function AnalysisPage() {
  const [stage, setStage] = useState<AnalysisStage>('idle')
  const [agents, setAgents] = useState<AgentState[]>([
    { id: 'contract_analyst', name: 'Contract Analyst', role: 'Contract Review & Clause Analysis', model: 'claude', status: 'idle', content: '', confidence: 0, tokens: 0, latencyMs: 0 },
    { id: 'risk_assessor', name: 'Risk Assessor', role: 'Risk Identification & Mitigation', model: 'claude', status: 'idle', content: '', confidence: 0, tokens: 0, latencyMs: 0 },
    { id: 'financial_modeler', name: 'Financial Analyst', role: 'Financial Analysis & Valuation', model: 'gpt-4', status: 'idle', content: '', confidence: 0, tokens: 0, latencyMs: 0 },
  ])
  const [consensusBuilding, setConsensusBuilding] = useState(false)
  const [consensusResult, setConsensusResult] = useState<{
    reached: boolean
    score: number
    summary: string
  } | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 100)
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  // Simulate analysis
  const startAnalysis = async () => {
    setStage('analyzing')
    setIsRunning(true)
    setElapsedTime(0)
    setConsensusResult(null)

    // Reset agents
    setAgents(prev => prev.map(a => ({ ...a, status: 'thinking' as AgentStatus, content: '', confidence: 0 })))

    const mockResponses = MOCK_AGENT_RESPONSES.contract_review

    // Simulate each agent analyzing with delays
    for (let i = 0; i < agents.length; i++) {
      // Wait for "thinking" time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

      // Start "responding"
      setAgents(prev => prev.map((a, idx) => 
        idx === i ? { ...a, status: 'responding' as AgentStatus } : a
      ))

      // Simulate streaming response
      const response = mockResponses[i]
      const words = response.content.split(' ')
      let currentContent = ''

      for (const word of words) {
        currentContent += word + ' '
        setAgents(prev => prev.map((a, idx) => 
          idx === i ? { ...a, content: currentContent } : a
        ))
        await new Promise(resolve => setTimeout(resolve, 30))
      }

      // Mark complete
      setAgents(prev => prev.map((a, idx) => 
        idx === i ? { 
          ...a, 
          status: 'complete' as AgentStatus, 
          content: response.content,
          confidence: response.confidence,
          tokens: response.tokens,
          latencyMs: response.latencyMs
        } : a
      ))
    }

    // Start consensus building
    setStage('consensus')
    setConsensusBuilding(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setConsensusBuilding(false)
    setConsensusResult({
      reached: true,
      score: 0.89,
      summary: 'All three AI models agree on the key findings. The deal shows moderate risk primarily due to customer concentration and pending IP litigation, but these are mitigated by strong financial fundamentals and negotiated protections. Recommend proceeding with enhanced due diligence on the top 3 customer relationships.'
    })

    setStage('complete')
    setIsRunning(false)
  }

  const resetAnalysis = () => {
    setStage('idle')
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle', content: '', confidence: 0, tokens: 0, latencyMs: 0 })))
    setConsensusResult(null)
    setElapsedTime(0)
    setIsRunning(false)
  }

  const totalTokens = agents.reduce((sum, a) => sum + a.tokens, 0)
  const avgConfidence = agents.filter(a => a.confidence > 0).reduce((sum, a) => sum + a.confidence, 0) / agents.filter(a => a.confidence > 0).length || 0
  const estimatedCost = totalTokens * 0.00003 // Rough estimate

  return (
    <MainLayout 
      title="Multi-Agent Analysis" 
      subtitle="Watch Claude, GPT-4, and Gemini analyze your documents in real-time"
    >
      <div className="space-y-6">
        {/* Control Panel */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Document Selector */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Stock Purchase Agreement.pdf</p>
                  <p className="text-xs text-gray-500">Project Phoenix • 24 pages</p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2">
                {stage === 'idle' && <Badge variant="default">Ready</Badge>}
                {stage === 'analyzing' && <Badge variant="info"><Sparkles className="w-3 h-3" /> Analyzing</Badge>}
                {stage === 'consensus' && <Badge variant="consensus"><Brain className="w-3 h-3" /> Building Consensus</Badge>}
                {stage === 'complete' && <Badge variant="success"><CheckCircle2 className="w-3 h-3" /> Complete</Badge>}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {stage === 'idle' && (
                <Button onClick={startAnalysis}>
                  <Play className="w-4 h-4" />
                  Start Analysis
                </Button>
              )}
              {(stage === 'analyzing' || stage === 'consensus') && (
                <Button variant="secondary" disabled>
                  <Pause className="w-4 h-4" />
                  Running...
                </Button>
              )}
              {stage === 'complete' && (
                <Button variant="secondary" onClick={resetAnalysis}>
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Metrics Bar */}
          {stage !== 'idle' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-mono text-gray-600">
                      {(elapsedTime / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {totalTokens.toLocaleString()} tokens
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      ~${estimatedCost.toFixed(3)}
                    </span>
                  </div>
                </div>
                {avgConfidence > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Avg Confidence:</span>
                    <span className={cn(
                      'text-sm font-semibold',
                      avgConfidence >= 0.8 ? 'text-green-600' : 
                      avgConfidence >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {(avgConfidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </Card>

        {/* Agent Grid */}
        <div className="grid grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AgentCard
                name={agent.name}
                role={agent.role}
                model={agent.model}
                status={agent.status}
                content={agent.content}
                confidence={agent.confidence || undefined}
                tokens={agent.tokens || undefined}
                latencyMs={agent.latencyMs || undefined}
              />
            </motion.div>
          ))}
        </div>

        {/* Consensus Builder */}
        <AnimatePresence>
          {(stage === 'consensus' || stage === 'complete') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ConsensusBuilder
                responses={agents
                  .filter(a => a.status === 'complete')
                  .map(a => ({
                    agentId: a.id,
                    agentName: a.name,
                    model: a.model,
                    content: a.content,
                    confidence: a.confidence,
                    tokens: a.tokens,
                    latencyMs: a.latencyMs,
                    timestamp: new Date().toISOString(),
                  }))}
                isBuilding={consensusBuilding}
                consensusReached={consensusResult?.reached}
                consensusScore={consensusResult?.score}
                summary={consensusResult?.summary}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* How It Works Section (when idle) */}
        {stage === 'idle' && (
          <Card className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">
                Multi-Model AI Orchestration
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Unlike single-model AI tools, DealScope orchestrates Claude, GPT-4, and Gemini 
                to work together, each bringing unique strengths to your due diligence.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Claude</h3>
                <p className="text-sm text-gray-600">
                  Excels at contract analysis, nuanced reasoning, and identifying subtle risks. 
                  Best for legal document review.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">GPT-4</h3>
                <p className="text-sm text-gray-600">
                  Superior at financial calculations, valuation modeling, and numerical analysis. 
                  Best for financial due diligence.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Gemini</h3>
                <p className="text-sm text-gray-600">
                  Fast at document search, market research, and finding comparable transactions. 
                  Best for information retrieval.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900">Consensus Engine</h4>
                  <p className="text-sm text-purple-700">
                    When all three models agree, you know the finding is reliable. When they disagree, 
                    you know to investigate further. This multi-perspective approach catches risks that 
                    single-model systems miss.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
