'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  GitCompare,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Link2,
  ArrowRight,
  RefreshCw,
  Play,
  AlertCircle,
  Lightbulb,
  Target,
  ChevronDown,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DocumentSummary {
  id: string
  name: string
  key_terms: string[]
  entities: string[]
  risk_areas: string[]
}

interface CrossReference {
  id: string
  type: 'consistency' | 'contradiction' | 'dependency' | 'reference' | 'gap'
  source_doc: string
  target_doc: string
  source_excerpt: string
  target_excerpt: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  recommendation?: string
}

interface AnalysisResult {
  documents_analyzed: DocumentSummary[]
  cross_references: CrossReference[]
  consistency_score: number
  key_conflicts: string[]
  coverage_gaps: string[]
  recommendations: string[]
}

interface Document {
  id: string
  name: string
  status: string
}

const TYPE_CONFIG = {
  consistency: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Consistent' },
  contradiction: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Contradiction' },
  dependency: { icon: Link2, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Dependency' },
  reference: { icon: ArrowRight, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Reference' },
  gap: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Coverage Gap' },
}

const SEVERITY_CONFIG = {
  critical: { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200' },
  high: { color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200' },
  medium: { color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200' },
  low: { color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' },
}

export default function CrossDocumentPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedRef, setSelectedRef] = useState<CrossReference | null>(null)

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

  const toggleDocument = (docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  const runAnalysis = async () => {
    if (selectedDocs.length < 2) {
      setError('Select at least 2 documents')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setSelectedRef(null)

    try {
      const response = await fetch('/api/cross-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds: selectedDocs }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.analysis)
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Failed to analyze documents. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <MainLayout
      title="Cross-Document Intelligence"
      subtitle="Find connections, contradictions, and gaps across multiple documents"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Document Selection */}
        <div className="col-span-1 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Select Documents</h3>
              </div>
              <Badge variant="default">{selectedDocs.length} selected</Badge>
            </div>

            {loadingDocs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
              </div>
            ) : documents.length < 2 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                Need at least 2 analyzed documents
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => toggleDocument(doc.id)}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition flex items-center gap-3',
                      selectedDocs.includes(doc.id)
                        ? 'bg-teal-50 border-2 border-teal-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center',
                      selectedDocs.includes(doc.id)
                        ? 'border-teal-500 bg-teal-500'
                        : 'border-gray-300'
                    )}>
                      {selectedDocs.includes(doc.id) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700 truncate">
                      {doc.name.slice(0, 35)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <Button
              onClick={runAnalysis}
              disabled={loading || selectedDocs.length < 2}
              className="w-full mt-4 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <GitCompare className="w-4 h-4" />
                  Analyze Cross-References
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 mt-2 text-center">
              Select 2+ documents to find connections
            </p>
          </Card>

          {/* Reference Type Legend */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Reference Types</h3>
            <div className="space-y-2">
              {Object.entries(TYPE_CONFIG).map(([type, config]) => {
                const Icon = config.icon
                const count = result?.cross_references.filter(r => r.type === type).length || 0
                return (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-6 h-6 rounded flex items-center justify-center', config.bg)}>
                        <Icon className={cn('w-3 h-3', config.color)} />
                      </div>
                      <span className="text-gray-600">{config.label}</span>
                    </div>
                    {result && <Badge variant="default">{count}</Badge>}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Results */}
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
                  <GitCompare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Analyzing Documents</h3>
                <p className="text-sm text-gray-500">
                  Finding cross-references across {selectedDocs.length} documents...
                </p>
              </div>
            </Card>
          ) : !result ? (
            <Card className="p-12 text-center">
              <GitCompare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Cross-Document Intelligence</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Select multiple documents to analyze them for consistencies, contradictions, 
                dependencies, and coverage gaps.
              </p>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Consistency Score */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-16 h-16 rounded-xl flex items-center justify-center',
                      result.consistency_score >= 0.8 ? 'bg-green-100' :
                      result.consistency_score >= 0.6 ? 'bg-amber-100' : 'bg-red-100'
                    )}>
                      <span className={cn(
                        'text-2xl font-bold',
                        getScoreColor(result.consistency_score)
                      )}>
                        {(result.consistency_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Consistency Score</div>
                      <div className="text-sm text-gray-500">
                        {result.documents_analyzed.length} documents analyzed
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {result.cross_references.filter(r => r.type === 'contradiction').length}
                      </div>
                      <div className="text-xs text-gray-500">Contradictions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {result.coverage_gaps.length}
                      </div>
                      <div className="text-xs text-gray-500">Gaps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {result.cross_references.filter(r => r.type === 'consistency').length}
                      </div>
                      <div className="text-xs text-gray-500">Consistent</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Cross References */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Cross-References ({result.cross_references.length})
                </h3>
                
                {result.cross_references.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    No cross-references found between documents
                  </div>
                ) : (
                  <div className="space-y-3">
                    {result.cross_references.map((ref) => {
                      const typeConfig = TYPE_CONFIG[ref.type] || TYPE_CONFIG.reference
                      const severityConfig = SEVERITY_CONFIG[ref.severity]
                      const Icon = typeConfig.icon

                      return (
                        <motion.div
                          key={ref.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            'p-4 rounded-lg border cursor-pointer transition',
                            selectedRef?.id === ref.id
                              ? 'border-teal-500 bg-teal-50'
                              : severityConfig.border + ' ' + severityConfig.bg,
                            'hover:shadow-md'
                          )}
                          onClick={() => setSelectedRef(selectedRef?.id === ref.id ? null : ref)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', typeConfig.bg)}>
                                <Icon className={cn('w-4 h-4', typeConfig.color)} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={
                                    ref.severity === 'critical' ? 'danger' :
                                    ref.severity === 'high' ? 'warning' : 'default'
                                  }>
                                    {ref.severity}
                                  </Badge>
                                  <span className="text-sm font-medium text-gray-900">
                                    {typeConfig.label}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{ref.description}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                  <span className="px-2 py-0.5 bg-white rounded">{ref.source_doc}</span>
                                  <ArrowRight className="w-3 h-3" />
                                  <span className="px-2 py-0.5 bg-white rounded">{ref.target_doc}</span>
                                </div>
                              </div>
                            </div>
                            <ChevronDown className={cn(
                              'w-4 h-4 text-gray-400 transition',
                              selectedRef?.id === ref.id && 'rotate-180'
                            )} />
                          </div>

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {selectedRef?.id === ref.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Source Excerpt:</div>
                                    <div className="p-2 bg-white rounded text-sm text-gray-700 italic">
                                      "{ref.source_excerpt}"
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Target Excerpt:</div>
                                    <div className="p-2 bg-white rounded text-sm text-gray-700 italic">
                                      "{ref.target_excerpt}"
                                    </div>
                                  </div>
                                  {ref.recommendation && (
                                    <div className="p-2 bg-teal-50 rounded text-sm text-teal-700">
                                      <strong>Recommendation:</strong> {ref.recommendation}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </Card>

              {/* Key Conflicts & Gaps */}
              {(result.key_conflicts.length > 0 || result.coverage_gaps.length > 0) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {result.key_conflicts.length > 0 && (
                    <Card className="p-4 border-red-200 bg-red-50">
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-red-900">Key Conflicts</h3>
                      </div>
                      <ul className="space-y-2">
                        {result.key_conflicts.map((conflict, i) => (
                          <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                            <span className="font-bold">•</span>
                            {conflict}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {result.coverage_gaps.length > 0 && (
                    <Card className="p-4 border-amber-200 bg-amber-50">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <h3 className="font-semibold text-amber-900">Coverage Gaps</h3>
                      </div>
                      <ul className="space-y-2">
                        {result.coverage_gaps.map((gap, i) => (
                          <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                            <span className="font-bold">•</span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <Card className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-teal-600" />
                    <h3 className="font-semibold text-teal-900">Recommendations</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-teal-700 flex items-start gap-2">
                        <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
