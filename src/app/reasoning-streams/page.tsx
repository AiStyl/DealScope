'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { ModelBadge } from '@/components/ui/ModelBadge'
import { cn } from '@/lib/utils'
import {
  Brain,
  Eye,
  Search,
  Lightbulb,
  CheckCircle,
  Target,
  Send,
  Loader2,
  AlertTriangle,
  FileText,
  RefreshCw,
  ChevronRight,
  Activity,
  TrendingUp,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ReasoningStep {
  step_number: number
  phase: 'observation' | 'analysis' | 'hypothesis' | 'verification' | 'conclusion'
  thought: string
  confidence: number
  evidence?: string[]
  timestamp: string
}

interface ReasoningResult {
  query: string
  model: string
  reasoning_chain: ReasoningStep[]
  final_answer: string
  total_steps: number
  reasoning_depth: string
  confidence_trajectory: number[]
}

interface Document {
  id: string
  name: string
  status: string
}

const PHASE_CONFIG = {
  observation: { icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Observation' },
  analysis: { icon: Search, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Analysis' },
  hypothesis: { icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Hypothesis' },
  verification: { icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-100', label: 'Verification' },
  conclusion: { icon: Target, color: 'text-green-600', bg: 'bg-green-100', label: 'Conclusion' },
}

const EXAMPLE_QUERIES = [
  'What are the key risks in this acquisition?',
  'Is the indemnification cap reasonable for this deal size?',
  'What regulatory approvals might be required?',
  'Are there any red flags in the representations and warranties?',
  'How does the earnout structure protect the buyer?',
]

export default function ReasoningStreamsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [result, setResult] = useState<ReasoningResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)

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

  // Simulate streaming effect
  useEffect(() => {
    if (result && visibleSteps < result.reasoning_chain.length) {
      setIsStreaming(true)
      const timer = setTimeout(() => {
        setVisibleSteps(v => v + 1)
      }, 800)
      return () => clearTimeout(timer)
    } else if (result && visibleSteps >= result.reasoning_chain.length) {
      setIsStreaming(false)
    }
  }, [result, visibleSteps])

  const runReasoning = async (customQuery?: string) => {
    const q = customQuery || query
    if (!q.trim()) {
      setError('Please enter a question')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setVisibleSteps(0)

    try {
      const response = await fetch('/api/reasoning-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          documentId: selectedDoc,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.reasoning)
      } else {
        setError(data.error || 'Reasoning failed')
      }
    } catch (err) {
      console.error('Reasoning error:', err)
      setError('Failed to generate reasoning. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <MainLayout
      title="Reasoning Streams"
      subtitle="Watch AI's step-by-step thought process in real-time"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="col-span-1 space-y-4">
          {/* Document Selection */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Context Document</h3>
            </div>

            {loadingDocs ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
              </div>
            ) : (
              <select
                value={selectedDoc || ''}
                onChange={(e) => setSelectedDoc(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">General M&A context</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name.slice(0, 40)}
                  </option>
                ))}
              </select>
            )}
          </Card>

          {/* Query Input */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Your Question</h3>
            </div>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about M&A risks, deal terms, or strategy..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
              rows={3}
              disabled={loading}
            />

            <Button
              onClick={() => runReasoning()}
              disabled={loading || !query.trim()}
              className="w-full mt-3 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Reasoning...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Start Reasoning
                </>
              )}
            </Button>
          </Card>

          {/* Example Queries */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-gray-900">Example Questions</h3>
            </div>
            <div className="space-y-2">
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuery(q)
                    runReasoning(q)
                  }}
                  disabled={loading}
                  className="w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>

          {/* Confidence Chart */}
          {result && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-gray-900">Confidence Trajectory</h3>
              </div>
              <div className="flex items-end justify-between h-20 gap-1">
                {result.confidence_trajectory.slice(0, visibleSteps).map((conf, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${conf * 100}%` }}
                    className={cn(
                      'flex-1 rounded-t',
                      conf >= 0.8 ? 'bg-green-500' :
                      conf >= 0.6 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Step 1</span>
                <span>Step {result.total_steps}</span>
              </div>
            </Card>
          )}
        </div>

        {/* Reasoning Stream */}
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
            <Card className="p-8">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600" />
                  <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI is Reasoning</h3>
                <p className="text-sm text-gray-500">Generating step-by-step analysis...</p>
              </div>
            </Card>
          ) : !result ? (
            <Card className="p-12 text-center">
              <Brain className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Reasoning Streams</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Ask a question and watch as the AI breaks down its thinking process
                into observable steps - from observation through conclusion.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Query Header */}
              <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ModelBadge model="claude" size="lg" />
                    <div>
                      <div className="text-sm text-purple-600 font-medium">Analyzing</div>
                      <div className="font-semibold text-purple-900">{result.query}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      result.reasoning_depth === 'deep' ? 'success' :
                      result.reasoning_depth === 'moderate' ? 'warning' : 'default'
                    }>
                      {result.reasoning_depth} reasoning
                    </Badge>
                    {isStreaming && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span className="text-xs">Streaming</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Reasoning Steps */}
              <div className="space-y-3">
                {result.reasoning_chain.slice(0, visibleSteps).map((step, i) => {
                  const config = PHASE_CONFIG[step.phase] || PHASE_CONFIG.analysis
                  const Icon = config.icon

                  return (
                    <motion.div
                      key={step.step_number}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-4">
                        <div className="flex gap-4">
                          {/* Step indicator */}
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center',
                              config.bg
                            )}>
                              <Icon className={cn('w-5 h-5', config.color)} />
                            </div>
                            {i < visibleSteps - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 mt-2" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="default" className={cn(config.bg, config.color, 'border-0')}>
                                  {config.label}
                                </Badge>
                                <span className="text-xs text-gray-400">Step {step.step_number}</span>
                              </div>
                              <div className={cn('text-sm font-medium', getConfidenceColor(step.confidence))}>
                                {(step.confidence * 100).toFixed(0)}% confident
                              </div>
                            </div>

                            <p className="text-gray-700 text-sm leading-relaxed">
                              {step.thought}
                            </p>

                            {step.evidence && step.evidence.length > 0 && (
                              <div className="mt-3 space-y-1">
                                <div className="text-xs font-medium text-gray-500">Supporting Evidence:</div>
                                {step.evidence.map((ev, j) => (
                                  <div key={j} className="flex items-start gap-2 text-xs text-gray-600">
                                    <ChevronRight className="w-3 h-3 mt-0.5 text-gray-400" />
                                    {ev}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}

                {/* Streaming indicator */}
                {isStreaming && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 px-4 py-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Final Answer */}
              {visibleSteps >= result.reasoning_chain.length && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-green-900">Final Answer</h3>
                    </div>
                    <p className="text-green-800 leading-relaxed">
                      {result.final_answer}
                    </p>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-green-200 text-sm text-green-700">
                      <span>{result.total_steps} reasoning steps</span>
                      <span>•</span>
                      <span>{result.reasoning_depth} analysis</span>
                      <span>•</span>
                      <span>Final confidence: {(result.confidence_trajectory[result.confidence_trajectory.length - 1] * 100).toFixed(0)}%</span>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
