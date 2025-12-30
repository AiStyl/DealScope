'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { ModelBadge } from '@/components/ui/ModelBadge'
import { cn } from '@/lib/utils'
import {
  GitCompare,
  Send,
  Loader2,
  AlertTriangle,
  FileText,
  Clock,
  Target,
  Trophy,
  Zap,
  CheckCircle,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModelResponse {
  model: string
  provider: string
  response: string
  key_points: string[]
  confidence: number
  processing_time_ms: number
}

interface ComparisonResult {
  prompt: string
  models: ModelResponse[]
  metrics: {
    average_confidence: number
    agreement_score: number
    total_processing_time_ms: number
    fastest_model: string
    highest_confidence: string
  }
}

interface Document {
  id: string
  name: string
  status: string
}

const EXAMPLE_PROMPTS = [
  'What are the key risks in this M&A transaction?',
  'Is the indemnification structure standard for this deal size?',
  'What regulatory concerns should be addressed?',
  'Are there any red flags in the representations and warranties?',
  'How does the earnout structure compare to market norms?',
]

const MODEL_COLORS = {
  Claude: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  'GPT-4': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  Gemini: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
}

export default function CompareModelsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const runComparison = async (customPrompt?: string) => {
    const p = customPrompt || prompt
    if (!p.trim()) {
      setError('Please enter a question')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/compare-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: p,
          documentId: selectedDoc,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.comparison)
      } else {
        setError(data.error || 'Comparison failed')
      }
    } catch (err) {
      console.error('Comparison error:', err)
      setError('Failed to compare models. Please try again.')
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
      title="Live Model Comparison"
      subtitle="See how Claude, GPT-4, and Gemini respond to the same question"
    >
      <div className="space-y-6">
        {/* Input Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <GitCompare className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-gray-900">Compare All 3 Models</h3>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* Document Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Context Document
              </label>
              <select
                value={selectedDoc || ''}
                onChange={(e) => setSelectedDoc(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                disabled={loading}
              >
                <option value="">General M&A context</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name.slice(0, 35)}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt Input */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Your Question
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && runComparison()}
                placeholder="Ask a question to compare across all models..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <Button
                onClick={() => runComparison()}
                disabled={loading || !prompt.trim()}
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Compare Models
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Try:</span>
            {EXAMPLE_PROMPTS.slice(0, 3).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPrompt(p)
                  runComparison(p)
                }}
                disabled={loading}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition disabled:opacity-50"
              >
                {p.slice(0, 40)}...
              </button>
            ))}
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

        {/* Loading */}
        {loading && (
          <Card className="p-8">
            <div className="flex justify-center gap-8 mb-6">
              {['Claude', 'GPT-4', 'Gemini'].map((model, i) => (
                <motion.div
                  key={model}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center mb-2 animate-pulse',
                    i === 0 ? 'bg-amber-100' : i === 1 ? 'bg-emerald-100' : 'bg-blue-100'
                  )}>
                    <span className={cn(
                      'text-xl font-bold',
                      i === 0 ? 'text-amber-600' : i === 1 ? 'text-emerald-600' : 'text-blue-600'
                    )}>
                      {model[0]}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{model}</span>
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400 mt-1" />
                </motion.div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500">
              Calling all 3 models in parallel...
            </p>
          </Card>
        )}

        {/* Results */}
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Metrics Summary */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-teal-600" />
                  <span className="text-sm text-gray-500">Agreement</span>
                </div>
                <div className={cn(
                  'text-2xl font-bold',
                  result.metrics.agreement_score >= 0.8 ? 'text-green-600' :
                  result.metrics.agreement_score >= 0.6 ? 'text-amber-600' : 'text-red-600'
                )}>
                  {(result.metrics.agreement_score * 100).toFixed(0)}%
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-500">Avg Confidence</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {(result.metrics.average_confidence * 100).toFixed(0)}%
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-gray-500">Fastest</span>
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {result.metrics.fastest_model}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-500">Most Confident</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {result.metrics.highest_confidence}
                </div>
              </Card>
            </div>

            {/* Side-by-Side Responses */}
            <div className="grid grid-cols-3 gap-4">
              {result.models.map((model) => {
                const colors = MODEL_COLORS[model.model as keyof typeof MODEL_COLORS] || MODEL_COLORS.Claude
                
                return (
                  <motion.div
                    key={model.model}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={cn('p-4 h-full', colors.bg, colors.border)}>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <ModelBadge model={model.model.toLowerCase().replace('-', '') as any} size="lg" showLabel />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {(model.processing_time_ms / 1000).toFixed(1)}s
                        </div>
                      </div>

                      {/* Confidence */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">Confidence:</span>
                        <span className={cn('text-sm font-semibold', getConfidenceColor(model.confidence))}>
                          {(model.confidence * 100).toFixed(0)}%
                        </span>
                        {model.model === result.metrics.highest_confidence && (
                          <Trophy className="w-3 h-3 text-amber-500" />
                        )}
                        {model.model === result.metrics.fastest_model && (
                          <Zap className="w-3 h-3 text-amber-500" />
                        )}
                      </div>

                      {/* Response */}
                      <div className="text-sm text-gray-700 mb-4 leading-relaxed max-h-48 overflow-y-auto">
                        {model.response}
                      </div>

                      {/* Key Points */}
                      {model.key_points.length > 0 && (
                        <div className="pt-3 border-t border-gray-200">
                          <div className="text-xs font-semibold text-gray-500 mb-2">Key Points:</div>
                          <ul className="space-y-1">
                            {model.key_points.slice(0, 5).map((point, i) => (
                              <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Query Info */}
            <Card className="p-4 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  <span className="font-medium">Query:</span> "{result.prompt}"
                </div>
                <div className="text-gray-500">
                  Total time: {(result.metrics.total_processing_time_ms / 1000).toFixed(1)}s (parallel)
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !result && (
          <Card className="p-12 text-center">
            <GitCompare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Compare AI Models Side-by-Side</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Ask a question and see how Claude, GPT-4, and Gemini each respond.
              Compare their confidence levels, key points, and response times.
            </p>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
