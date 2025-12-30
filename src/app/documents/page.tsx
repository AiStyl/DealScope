'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button, Progress } from '@/components/ui'
import { ModelBadge, ModelBadgeGroup, ConsensusIndicator } from '@/components/ui/ModelBadge'
import { cn } from '@/lib/utils'
import {
  FileText,
  Upload,
  Search,
  Eye,
  Brain,
  AlertTriangle,
  CheckCircle,
  FileSearch,
  Sparkles,
  ChevronRight,
  Download,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Document {
  id: string
  name: string
  file_type: string
  file_size: number
  status: 'pending' | 'processing' | 'analyzed' | 'error'
  risk_score: number | null
  created_at: string
  file_path: string
  signed_url?: string
}

interface Finding {
  id: string
  document_id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  confidence: number
  model: string
  type: string
}

interface AnalysisResult {
  consensus: {
    score: number
    risk_score: number
    agreement_level: 'strong' | 'moderate' | 'weak' | 'none'
  }
  model_results: {
    claude: { risk_score: number; findings_count: number }
    gpt4: { risk_score: number; findings_count: number }
    gemini: { risk_score: number; findings_count: number }
  }
  findings: Finding[]
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [findings, setFindings] = useState<Finding[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Fetch documents from API
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/upload')
      const data = await response.json()
      if (data.documents) {
        setDocuments(data.documents)
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch findings for selected document
  const fetchFindings = useCallback(async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`)
      const data = await response.json()
      if (data.findings) {
        setFindings(data.findings)
      }
    } catch (err) {
      console.error('Failed to fetch findings:', err)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  useEffect(() => {
    if (selectedDoc) {
      fetchFindings(selectedDoc)
    } else {
      setFindings([])
      setAnalysisResult(null)
    }
  }, [selectedDoc, fetchFindings])

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        // Refresh documents list
        await fetchDocuments()
        // Select the new document
        if (data.document?.id) {
          setSelectedDoc(data.document.id)
        }
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Handle multi-model analysis
  const handleAnalyze = async (documentId: string) => {
    setAnalyzing(documentId)
    setError(null)

    try {
      const response = await fetch('/api/analyze-multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })

      const data = await response.json()

      if (data.success) {
        setAnalysisResult(data.analysis)
        // Refresh documents to get updated status
        await fetchDocuments()
        // Refresh findings
        await fetchFindings(documentId)
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Analysis failed. Please try again.')
    } finally {
      setAnalyzing(null)
    }
  }

  const selectedDocument = documents.find(d => d.id === selectedDoc)

  const filteredDocs = documents.filter(doc => {
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Count findings by severity
  const criticalFindings = findings.filter(f => f.severity === 'critical').length
  const highFindings = findings.filter(f => f.severity === 'high').length

  return (
    <MainLayout
      title="Document Review"
      subtitle="Upload documents for multi-model AI analysis with consensus scoring"
    >
      <div className="space-y-6">
        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
              <button onClick={() => setError(null)}>
                <X className="w-4 h-4 text-red-500" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
              {['all', 'analyzed', 'processing', 'pending'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize',
                    filterStatus === status
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <Button variant="secondary" size="sm" onClick={fetchDocuments}>
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
          </div>

          {/* Upload Button */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button className="gap-2" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Document
                </>
              )}
            </Button>
          </label>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Document List */}
          <div className={cn('space-y-4', selectedDoc ? 'col-span-1' : 'col-span-3')}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                {loading ? 'Loading...' : `${filteredDocs.length} Documents`}
              </h2>
              {selectedDoc && (
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close Preview
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : filteredDocs.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No documents yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload your first document to start multi-model AI analysis
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleUpload}
                    className="hidden"
                  />
                  <Button className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </Button>
                </label>
              </Card>
            ) : (
              <div className={cn(
                'space-y-3',
                selectedDoc ? '' : 'grid grid-cols-3 gap-4 space-y-0'
              )}>
                {filteredDocs.map((doc) => (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card
                      hover
                      onClick={() => setSelectedDoc(doc.id)}
                      className={cn(
                        'p-4 cursor-pointer transition-all',
                        selectedDoc === doc.id && 'ring-2 ring-teal-500 bg-teal-50/30'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate text-sm">
                            {doc.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={
                              doc.status === 'analyzed' ? 'success' :
                              doc.status === 'processing' ? 'warning' : 'default'
                            }>
                              {doc.status === 'processing' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse mr-1" />
                              )}
                              {doc.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatFileSize(doc.file_size)}
                            </span>
                          </div>

                          {doc.status === 'analyzed' && doc.risk_score !== null && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Risk Score</span>
                                <span className={cn(
                                  'text-xs font-semibold',
                                  doc.risk_score >= 70 ? 'text-red-600' :
                                  doc.risk_score >= 40 ? 'text-yellow-600' : 'text-green-600'
                                )}>
                                  {doc.risk_score}/100
                                </span>
                              </div>
                              <Progress
                                value={doc.risk_score}
                                variant={
                                  doc.risk_score >= 70 ? 'danger' :
                                  doc.risk_score >= 40 ? 'warning' : 'success'
                                }
                                size="sm"
                              />
                            </div>
                          )}

                          <div className="mt-2 text-xs text-gray-400">
                            {formatDate(doc.created_at)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Document Detail View */}
          <AnimatePresence>
            {selectedDoc && selectedDocument && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="col-span-2 space-y-4"
              >
                {/* Document Header */}
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">{selectedDocument.name}</h2>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(selectedDocument.file_size)} • Uploaded {formatDate(selectedDocument.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedDocument.signed_url && (
                        <Button variant="secondary" size="sm" asChild>
                          <a href={selectedDocument.signed_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4" />
                            View
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleAnalyze(selectedDocument.id)}
                        disabled={analyzing === selectedDocument.id}
                      >
                        {analyzing === selectedDocument.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            {selectedDocument.status === 'analyzed' ? 'Re-analyze' : 'Analyze'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Analysis in progress */}
                {analyzing === selectedDocument.id && (
                  <Card className="p-6">
                    <div className="text-center">
                      <div className="flex justify-center gap-4 mb-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2 animate-pulse">
                            <span className="text-amber-700 font-bold">C</span>
                          </div>
                          <span className="text-xs text-amber-600">Claude</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2 animate-pulse">
                            <span className="text-emerald-700 font-bold">G4</span>
                          </div>
                          <span className="text-xs text-emerald-600">GPT-4</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2 animate-pulse">
                            <span className="text-blue-700 font-bold">Ge</span>
                          </div>
                          <span className="text-xs text-blue-600">Gemini</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Multi-Model Analysis in Progress</h3>
                      <p className="text-sm text-gray-500">
                        3 AI models analyzing document in parallel...
                      </p>
                    </div>
                  </Card>
                )}

                {/* Analysis Summary */}
                {selectedDocument.status === 'analyzed' && (
                  <>
                    <div className="grid grid-cols-4 gap-4">
                      <Card className="p-4 text-center">
                        <div className={cn(
                          'text-2xl font-bold',
                          (selectedDocument.risk_score || 0) >= 70 ? 'text-red-600' :
                          (selectedDocument.risk_score || 0) >= 40 ? 'text-yellow-600' : 'text-green-600'
                        )}>
                          {selectedDocument.risk_score || 0}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Risk Score</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{findings.length}</div>
                        <div className="text-xs text-gray-500 mt-1">Total Findings</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{criticalFindings}</div>
                        <div className="text-xs text-gray-500 mt-1">Critical Issues</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-teal-600">3</div>
                        <div className="text-xs text-gray-500 mt-1">Models Used</div>
                      </Card>
                    </div>

                    {/* Consensus Card */}
                    {analysisResult && (
                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Brain className="w-4 h-4 text-purple-600" />
                          <h3 className="font-semibold text-gray-900">Multi-Model Consensus</h3>
                        </div>
                        <ConsensusIndicator
                          claudeScore={analysisResult.model_results.claude.risk_score}
                          gpt4Score={analysisResult.model_results.gpt4.risk_score}
                          geminiScore={analysisResult.model_results.gemini.risk_score}
                          consensusScore={analysisResult.consensus.score}
                          agreementLevel={analysisResult.consensus.agreement_level}
                        />
                      </Card>
                    )}
                  </>
                )}

                {/* Findings List */}
                {findings.length > 0 && (
                  <Card className="overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        <h3 className="font-semibold text-gray-900">AI Findings</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {criticalFindings > 0 && <Badge variant="danger">{criticalFindings} Critical</Badge>}
                        {highFindings > 0 && <Badge variant="warning">{highFindings} High</Badge>}
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                      {findings.map((finding, index) => (
                        <motion.div
                          key={finding.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                              finding.severity === 'critical' ? 'bg-red-100' :
                              finding.severity === 'high' ? 'bg-orange-100' :
                              finding.severity === 'medium' ? 'bg-yellow-100' :
                              'bg-gray-100'
                            )}>
                              {finding.severity === 'critical' || finding.severity === 'high' ? (
                                <AlertTriangle className={cn(
                                  'w-5 h-5',
                                  finding.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
                                )} />
                              ) : (
                                <FileSearch className="w-5 h-5 text-yellow-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{finding.title}</h4>
                                <Badge variant={
                                  finding.severity === 'critical' ? 'danger' :
                                  finding.severity === 'high' ? 'warning' :
                                  finding.severity === 'medium' ? 'warning' : 'default'
                                }>
                                  {finding.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="text-gray-500">
                                  Confidence: {(finding.confidence * 100).toFixed(0)}%
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Detected by:</span>
                                  <ModelBadge model={finding.model} size="sm" showLabel />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Empty state for pending documents */}
                {selectedDocument.status === 'pending' && !analyzing && (
                  <Card className="p-8 text-center">
                    <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Ready for Analysis</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Click "Analyze" to run multi-model AI analysis on this document
                    </p>
                    <Button onClick={() => handleAnalyze(selectedDocument.id)}>
                      <Brain className="w-4 h-4" />
                      Start Analysis
                    </Button>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  )
}
