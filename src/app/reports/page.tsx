'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { ModelBadge } from '@/components/ui/ModelBadge'
import { cn } from '@/lib/utils'
import {
  FileText,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle,
  FileSearch,
  Clock,
  RefreshCw,
  ChevronRight,
  Shield,
  Lightbulb,
  Target,
  Copy,
  Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Document {
  id: string
  name: string
  status: string
  risk_score: number | null
  created_at: string
}

interface Finding {
  title: string
  severity: string
  description: string
  model: string
}

interface ReportSection {
  title: string
  content: string
  findings?: Finding[]
  risk_score?: number
}

interface Report {
  title: string
  generated_at: string
  document_name: string
  sections: ReportSection[]
  overall_risk_score: number
  recommendation: string
  markdown?: string
}

export default function ReportsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [reportType, setReportType] = useState<'executive_summary' | 'full_analysis' | 'risk_assessment'>('executive_summary')
  const [loading, setLoading] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

  const generateReport = async () => {
    if (!selectedDoc) {
      setError('Please select a document')
      return
    }

    setLoading(true)
    setError(null)
    setReport(null)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDoc,
          reportType,
          format: 'markdown',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setReport(data.report)
      } else {
        setError(data.error || 'Report generation failed')
      }
    } catch (err) {
      console.error('Report error:', err)
      setError('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (report?.markdown) {
      await navigator.clipboard.writeText(report.markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadMarkdown = () => {
    if (report?.markdown) {
      const blob = new Blob([report.markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.document_name.replace(/\.[^/.]+$/, '')}_report.md`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const selectedDocument = documents.find(d => d.id === selectedDoc)

  return (
    <MainLayout
      title="Report Generator"
      subtitle="Generate AI-powered due diligence reports"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="col-span-1 space-y-6">
          {/* Document Selection */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Select Document</h3>
            </div>

            {loadingDocs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No analyzed documents</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc.id)}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition',
                      selectedDoc === doc.id
                        ? 'bg-purple-50 border-2 border-purple-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {doc.name.slice(0, 30)}
                      </span>
                      {doc.risk_score !== null && (
                        <Badge variant={
                          doc.risk_score >= 70 ? 'danger' :
                          doc.risk_score >= 40 ? 'warning' : 'success'
                        }>
                          {doc.risk_score}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Report Type */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileSearch className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Report Type</h3>
            </div>

            <div className="space-y-2">
              {[
                { value: 'executive_summary', label: 'Executive Summary', desc: 'High-level for leadership' },
                { value: 'full_analysis', label: 'Full Analysis', desc: 'Comprehensive findings' },
                { value: 'risk_assessment', label: 'Risk Assessment', desc: 'Focused on risks' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setReportType(type.value as typeof reportType)}
                  className={cn(
                    'w-full p-3 rounded-lg text-left transition',
                    reportType === type.value
                      ? 'bg-teal-50 border-2 border-teal-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  )}
                >
                  <div className="font-medium text-sm text-gray-900">{type.label}</div>
                  <div className="text-xs text-gray-500">{type.desc}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={generateReport}
            disabled={loading || !selectedDoc}
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>

        {/* Report Preview */}
        <div className="col-span-2">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
              >
                <AlertTriangle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="p-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600" />
                      <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Generating Report</h3>
                    <p className="text-sm text-gray-500">
                      AI is analyzing findings and creating your report...
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}

            {!loading && !report && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Generate a Report</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Select a document and report type, then click Generate to create
                    an AI-powered due diligence report.
                  </p>
                </Card>
              </motion.div>
            )}

            {!loading && report && (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Report Header */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
                      <p className="text-sm text-gray-500">
                        Generated {new Date(report.generated_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={copyToClipboard}>
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={downloadMarkdown}>
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                    report.overall_risk_score >= 70 ? 'bg-red-100 text-red-700' :
                    report.overall_risk_score >= 40 ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  )}>
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Overall Risk Score: {report.overall_risk_score}/100</span>
                  </div>
                </Card>

                {/* Report Sections */}
                {report.sections.map((section, i) => (
                  <Card key={i} className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      {section.title.includes('Critical') && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {section.title.includes('Opportunities') && <Lightbulb className="w-4 h-4 text-amber-500" />}
                      {section.title.includes('Action') && <Target className="w-4 h-4 text-teal-500" />}
                      {section.title}
                    </h3>
                    
                    <div className="text-sm text-gray-700 whitespace-pre-wrap mb-4">
                      {section.content}
                    </div>

                    {section.findings && section.findings.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {section.findings.map((finding, j) => (
                          <div
                            key={j}
                            className={cn(
                              'p-4 rounded-lg border',
                              getSeverityColor(finding.severity)
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{finding.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant={
                                  finding.severity === 'critical' ? 'danger' :
                                  finding.severity === 'high' ? 'warning' : 'default'
                                }>
                                  {finding.severity}
                                </Badge>
                                <ModelBadge model={finding.model} size="sm" />
                              </div>
                            </div>
                            <p className="text-sm">{finding.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}

                {/* Recommendation */}
                <Card className="p-6 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-teal-600" />
                    <h3 className="font-semibold text-teal-900">Recommendation</h3>
                  </div>
                  <p className="text-teal-800">{report.recommendation}</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  )
}
