'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  ClipboardCheck,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  Play,
  RefreshCw,
  Filter,
  Lightbulb,
  Scale,
  DollarSign,
  Settings,
  ShoppingCart,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChecklistItem {
  id: string
  category: string
  item: string
  description: string
  status: 'not_started' | 'in_progress' | 'complete' | 'flagged'
  priority: 'critical' | 'high' | 'medium' | 'low'
  ai_assessment?: string
  documents_needed: string[]
}

interface ChecklistResult {
  deal_type: string
  items: ChecklistItem[]
  completion_percentage: number
  critical_items_remaining: number
  flagged_items: number
  ai_recommendations: string[]
  categories: string[]
}

interface Document {
  id: string
  name: string
  status: string
}

const STATUS_CONFIG = {
  not_started: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100', label: 'Not Started' },
  in_progress: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'In Progress' },
  complete: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Complete' },
  flagged: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Flagged' },
}

const PRIORITY_CONFIG = {
  critical: { color: 'text-red-700', bg: 'bg-red-100' },
  high: { color: 'text-orange-700', bg: 'bg-orange-100' },
  medium: { color: 'text-amber-700', bg: 'bg-amber-100' },
  low: { color: 'text-gray-700', bg: 'bg-gray-100' },
}

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  legal: { icon: Scale, color: 'text-purple-600' },
  financial: { icon: DollarSign, color: 'text-green-600' },
  operational: { icon: Settings, color: 'text-blue-600' },
  commercial: { icon: ShoppingCart, color: 'text-amber-600' },
}

export default function DealChecklistPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [result, setResult] = useState<ChecklistResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({})

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

  const generateChecklist = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/deal-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDoc,
          deal_type: 'acquisition',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.checklist)
        setExpandedCategories(new Set(data.checklist.categories))
        setLocalStatuses({})
      } else {
        setError(data.error || 'Generation failed')
      }
    } catch (err) {
      console.error('Checklist error:', err)
      setError('Failed to generate checklist.')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const updateItemStatus = (itemId: string, status: string) => {
    setLocalStatuses(prev => ({ ...prev, [itemId]: status }))
  }

  const getItemStatus = (item: ChecklistItem): string => {
    return localStatuses[item.id] || item.status
  }

  const getFilteredItems = (items: ChecklistItem[]) => {
    if (!filterStatus) return items
    return items.filter(item => getItemStatus(item) === filterStatus)
  }

  const calculateProgress = () => {
    if (!result) return 0
    const statuses = result.items.map(item => getItemStatus(item))
    const completed = statuses.filter(s => s === 'complete').length
    return Math.round((completed / result.items.length) * 100)
  }

  return (
    <MainLayout
      title="Due Diligence Checklist"
      subtitle="AI-powered M&A due diligence tracking"
    >
      <div className="grid grid-cols-4 gap-6">
        {/* Left Panel */}
        <div className="col-span-1 space-y-4">
          {/* Document Selection */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Source Document</h3>
            </div>

            <select
              value={selectedDoc || ''}
              onChange={(e) => setSelectedDoc(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3"
              disabled={loading}
            >
              <option value="">Standard checklist only</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name.slice(0, 35)}
                </option>
              ))}
            </select>

            <Button
              onClick={generateChecklist}
              disabled={loading}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {result ? 'Regenerate' : 'Generate Checklist'}
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 mt-2 text-center">
              {selectedDoc ? 'AI will assess items based on document' : 'Standard M&A checklist'}
            </p>
          </Card>

          {/* Progress */}
          {result && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Progress</h3>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Completion</span>
                  <span className="font-medium">{calculateProgress()}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Items</span>
                  <span>{result.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Critical Remaining</span>
                  <span className="text-red-600 font-medium">{result.critical_items_remaining}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Flagged</span>
                  <span className="text-amber-600 font-medium">{result.flagged_items}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Filter */}
          {result && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Filter by Status</h3>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setFilterStatus(null)}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg text-sm text-left transition',
                    !filterStatus ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'
                  )}
                >
                  All Items
                </button>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                  const count = result.items.filter(i => getItemStatus(i) === status).length
                  return (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={cn(
                        'w-full px-3 py-2 rounded-lg text-sm text-left transition flex justify-between',
                        filterStatus === status ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'
                      )}
                    >
                      <span>{config.label}</span>
                      <Badge variant="default">{count}</Badge>
                    </button>
                  )
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="col-span-3 space-y-4">
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
                  <ClipboardCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Generating Checklist</h3>
                <p className="text-sm text-gray-500">
                  {selectedDoc ? 'AI is analyzing document and assessing items...' : 'Building standard M&A checklist...'}
                </p>
              </div>
            </Card>
          ) : !result ? (
            <Card className="p-12 text-center">
              <ClipboardCheck className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Due Diligence Checklist</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Generate a comprehensive M&A due diligence checklist. Optionally select a document
                for AI to automatically assess which items are addressed.
              </p>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* AI Recommendations */}
              {result.ai_recommendations.length > 0 && (
                <Card className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-amber-900">AI Recommendations</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.ai_recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Checklist by Category */}
              {result.categories.map((category) => {
                const categoryItems = getFilteredItems(result.items.filter(i => i.category === category))
                if (categoryItems.length === 0) return null

                const CategoryIcon = CATEGORY_CONFIG[category]?.icon || ClipboardCheck
                const isExpanded = expandedCategories.has(category)

                return (
                  <Card key={category} className="overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          category === 'legal' ? 'bg-purple-100' :
                          category === 'financial' ? 'bg-green-100' :
                          category === 'operational' ? 'bg-blue-100' : 'bg-amber-100'
                        )}>
                          <CategoryIcon className={CATEGORY_CONFIG[category]?.color || 'text-gray-600'} />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900 capitalize">{category}</h3>
                          <p className="text-sm text-gray-500">
                            {categoryItems.filter(i => getItemStatus(i) === 'complete').length} of {categoryItems.length} complete
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        'w-5 h-5 text-gray-400 transition',
                        isExpanded && 'rotate-180'
                      )} />
                    </button>

                    {/* Category Items */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-100"
                        >
                          <div className="divide-y divide-gray-100">
                            {categoryItems.map((item) => {
                              const status = getItemStatus(item) as keyof typeof STATUS_CONFIG
                              const statusConfig = STATUS_CONFIG[status]
                              const StatusIcon = statusConfig.icon
                              const priorityConfig = PRIORITY_CONFIG[item.priority]

                              return (
                                <div key={item.id} className="p-4 hover:bg-gray-50 transition">
                                  <div className="flex items-start gap-4">
                                    {/* Status Dropdown */}
                                    <select
                                      value={status}
                                      onChange={(e) => updateItemStatus(item.id, e.target.value)}
                                      className={cn(
                                        'w-32 px-2 py-1 rounded border text-xs font-medium',
                                        statusConfig.bg, statusConfig.color
                                      )}
                                    >
                                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>{config.label}</option>
                                      ))}
                                    </select>

                                    {/* Item Content */}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-gray-900">{item.item}</span>
                                        <Badge variant="default" className={cn(priorityConfig.bg, priorityConfig.color, 'text-xs')}>
                                          {item.priority}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-500">{item.description}</p>
                                      
                                      {item.ai_assessment && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                                          <strong>AI Assessment:</strong> {item.ai_assessment}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
