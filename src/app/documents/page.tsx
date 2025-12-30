'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button, Progress } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  FileText,
  Upload,
  Search,
  Filter,
  Eye,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileSearch,
  Sparkles,
  ChevronRight,
  MoreVertical,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Mock documents data
const DOCUMENTS = [
  {
    id: '1',
    name: 'Merger Agreement - TechCorp Acquisition.pdf',
    type: 'Contract',
    pages: 127,
    uploadedAt: '2024-12-28',
    status: 'analyzed',
    riskScore: 72,
    findings: 14,
    criticalFindings: 3,
    models: ['claude', 'gpt-4'] as const,
  },
  {
    id: '2',
    name: 'Q3 2024 Financial Statements.pdf',
    type: 'Financial',
    pages: 45,
    uploadedAt: '2024-12-27',
    status: 'analyzed',
    riskScore: 34,
    findings: 8,
    criticalFindings: 0,
    models: ['gpt-4', 'gemini'] as const,
  },
  {
    id: '3',
    name: 'Due Diligence Checklist.xlsx',
    type: 'Checklist',
    pages: 12,
    uploadedAt: '2024-12-26',
    status: 'analyzed',
    riskScore: 15,
    findings: 2,
    criticalFindings: 0,
    models: ['claude'] as const,
  },
  {
    id: '4',
    name: 'Employee Stock Option Plan.pdf',
    type: 'Legal',
    pages: 34,
    uploadedAt: '2024-12-25',
    status: 'processing',
    riskScore: 0,
    findings: 0,
    criticalFindings: 0,
    models: ['claude', 'gpt-4', 'gemini'] as const,
  },
  {
    id: '5',
    name: 'IP Portfolio Summary.pdf',
    type: 'Legal',
    pages: 89,
    uploadedAt: '2024-12-24',
    status: 'pending',
    riskScore: 0,
    findings: 0,
    criticalFindings: 0,
    models: [] as const,
  },
]

// Mock annotations for selected document
const ANNOTATIONS = [
  {
    id: '1',
    type: 'risk',
    title: 'Material Adverse Change Clause',
    description: 'Broad MAC definition on page 12 may allow buyer to terminate without penalty. Missing carve-outs for market conditions.',
    page: 12,
    confidence: 0.94,
    model: 'claude',
    severity: 'critical',
  },
  {
    id: '2',
    type: 'clause',
    title: 'Change of Control Provision',
    description: 'Triggers acceleration of $45M in debt upon acquisition. Cross-reference with loan agreements required.',
    page: 23,
    confidence: 0.91,
    model: 'gpt-4',
    severity: 'high',
  },
  {
    id: '3',
    type: 'financial',
    title: 'Earnout Structure',
    description: 'Additional $50M contingent on EBITDA exceeding $120M in Year 2. Achievability: 68% based on projections.',
    page: 45,
    confidence: 0.87,
    model: 'gpt-4',
    severity: 'medium',
  },
  {
    id: '4',
    type: 'risk',
    title: 'Non-Compete Scope',
    description: 'Non-compete extends 5 years globally. May face enforceability challenges in California and EU jurisdictions.',
    page: 67,
    confidence: 0.89,
    model: 'claude',
    severity: 'medium',
  },
  {
    id: '5',
    type: 'clause',
    title: 'Indemnification Cap',
    description: 'Indemnification limited to 15% of purchase price ($37.5M). Standard for deals of this size.',
    page: 78,
    confidence: 0.92,
    model: 'gemini',
    severity: 'low',
  },
]

export default function DocumentsPage() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const selectedDocument = DOCUMENTS.find(d => d.id === selectedDoc)

  const filteredDocs = DOCUMENTS.filter(doc => {
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <MainLayout
      title="Document Review"
      subtitle="AI-powered document analysis with multi-model annotations and risk detection"
    >
      <div className="space-y-6">
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
          </div>

          {/* Upload Button */}
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Documents
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Document List */}
          <div className={cn('space-y-4', selectedDoc ? 'col-span-1' : 'col-span-3')}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                {filteredDocs.length} Documents
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
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        doc.type === 'Contract' ? 'bg-purple-100 text-purple-600' :
                        doc.type === 'Financial' ? 'bg-green-100 text-green-600' :
                        doc.type === 'Legal' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      )}>
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
                          <span className="text-xs text-gray-500">{doc.pages} pages</span>
                        </div>

                        {doc.status === 'analyzed' && (
                          <div className="mt-3 space-y-2">
                            {/* Risk Score */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Risk Score</span>
                              <span className={cn(
                                'text-xs font-semibold',
                                doc.riskScore >= 70 ? 'text-red-600' :
                                doc.riskScore >= 40 ? 'text-yellow-600' : 'text-green-600'
                              )}>
                                {doc.riskScore}/100
                              </span>
                            </div>
                            <Progress
                              value={doc.riskScore}
                              variant={
                                doc.riskScore >= 70 ? 'danger' :
                                doc.riskScore >= 40 ? 'warning' : 'success'
                              }
                              size="sm"
                            />

                            {/* Findings */}
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-gray-500">
                                {doc.findings} findings
                              </span>
                              {doc.criticalFindings > 0 && (
                                <span className="text-red-600 font-medium flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  {doc.criticalFindings} critical
                                </span>
                              )}
                            </div>

                            {/* Models Used */}
                            <div className="flex items-center gap-1 mt-2">
                              {doc.models.map((model) => (
                                <div
                                  key={model}
                                  className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                                    model === 'claude' ? 'bg-amber-100 text-amber-700' :
                                    model === 'gpt-4' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-blue-100 text-blue-700'
                                  )}
                                >
                                  {model === 'claude' ? 'C' : model === 'gpt-4' ? 'G4' : 'Ge'}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {doc.status === 'processing' && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 text-xs text-yellow-600">
                              <Brain className="w-3 h-3 animate-pulse" />
                              Analyzing with Claude & GPT-4...
                            </div>
                            <Progress value={65} variant="warning" size="sm" className="mt-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
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
                          {selectedDocument.pages} pages • Uploaded {selectedDocument.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Eye className="w-4 h-4" />
                        View PDF
                      </Button>
                      <Button size="sm">
                        <Brain className="w-4 h-4" />
                        Re-analyze
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Analysis Summary */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="p-4 text-center">
                    <div className={cn(
                      'text-2xl font-bold',
                      selectedDocument.riskScore >= 70 ? 'text-red-600' :
                      selectedDocument.riskScore >= 40 ? 'text-yellow-600' : 'text-green-600'
                    )}>
                      {selectedDocument.riskScore}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Risk Score</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedDocument.findings}</div>
                    <div className="text-xs text-gray-500 mt-1">Total Findings</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{selectedDocument.criticalFindings}</div>
                    <div className="text-xs text-gray-500 mt-1">Critical Issues</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-teal-600">{selectedDocument.models.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Models Used</div>
                  </Card>
                </div>

                {/* AI Annotations */}
                <Card className="overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <h3 className="font-semibold text-gray-900">AI Annotations</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="danger">3 Critical</Badge>
                      <Badge variant="warning">2 High</Badge>
                      <Badge variant="info">2 Medium</Badge>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {ANNOTATIONS.map((annotation, index) => (
                      <motion.div
                        key={annotation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                            annotation.type === 'risk' ? 'bg-red-100' :
                            annotation.type === 'clause' ? 'bg-blue-100' :
                            'bg-green-100'
                          )}>
                            {annotation.type === 'risk' ? (
                              <AlertTriangle className={cn(
                                'w-5 h-5',
                                annotation.severity === 'critical' ? 'text-red-600' : 'text-red-500'
                              )} />
                            ) : annotation.type === 'clause' ? (
                              <FileSearch className="w-5 h-5 text-blue-600" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{annotation.title}</h4>
                              <Badge variant={
                                annotation.severity === 'critical' ? 'danger' :
                                annotation.severity === 'high' ? 'warning' :
                                annotation.severity === 'medium' ? 'info' : 'default'
                              }>
                                {annotation.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{annotation.description}</p>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-gray-500">Page {annotation.page}</span>
                              <span className="text-gray-500">
                                Confidence: {(annotation.confidence * 100).toFixed(0)}%
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">Detected by:</span>
                                <div className={cn(
                                  'px-1.5 py-0.5 rounded text-[10px] font-semibold',
                                  annotation.model === 'claude' ? 'bg-amber-100 text-amber-700' :
                                  annotation.model === 'gpt-4' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-blue-100 text-blue-700'
                                )}>
                                  {annotation.model}
                                </div>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Multi-Model Consensus */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Multi-Model Analysis Consensus</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm">C</div>
                        <span className="font-medium text-amber-800">Claude</span>
                      </div>
                      <p className="text-xs text-amber-700">Identified 8 legal risks, recommended MAC clause review</p>
                      <div className="mt-2 text-xs text-amber-600">Confidence: 94%</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">G4</div>
                        <span className="font-medium text-emerald-800">GPT-4</span>
                      </div>
                      <p className="text-xs text-emerald-700">Validated financial terms, flagged earnout achievability</p>
                      <div className="mt-2 text-xs text-emerald-600">Confidence: 91%</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">★</div>
                        <span className="font-medium text-purple-800">Consensus</span>
                      </div>
                      <p className="text-xs text-purple-700">Both models agree on 12 of 14 findings. 2 require review.</p>
                      <div className="mt-2 text-xs text-purple-600">Agreement: 86%</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  )
}
