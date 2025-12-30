'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button, Progress } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  FileText,
  Download,
  Eye,
  Brain,
  Sparkles,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  ChevronRight,
  FileCheck,
  BarChart3,
  Shield,
  Briefcase,
  TrendingUp,
  Users,
  Edit3,
  Send,
  Loader2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Report templates
const TEMPLATES = [
  {
    id: 'ic-memo',
    name: 'IC Memo',
    description: 'Investment Committee presentation format',
    icon: Briefcase,
    color: 'purple',
    sections: ['Executive Summary', 'Deal Overview', 'Financials', 'Risks', 'Recommendation'],
  },
  {
    id: 'dd-report',
    name: 'Due Diligence Report',
    description: 'Comprehensive findings analysis',
    icon: FileCheck,
    color: 'blue',
    sections: ['Scope', 'Legal Review', 'Financial Analysis', 'Operations', 'IT & Systems', 'Key Findings'],
  },
  {
    id: 'risk-summary',
    name: 'Risk Summary',
    description: 'All flagged risks with mitigations',
    icon: Shield,
    color: 'red',
    sections: ['Critical Risks', 'High Risks', 'Medium Risks', 'Mitigations', 'Recommendations'],
  },
  {
    id: 'deal-summary',
    name: 'Deal Summary',
    description: 'One-pager for stakeholders',
    icon: TrendingUp,
    color: 'green',
    sections: ['Overview', 'Key Terms', 'Valuation', 'Timeline', 'Next Steps'],
  },
  {
    id: 'financial-model',
    name: 'Financial Analysis',
    description: 'Valuation and returns analysis',
    icon: BarChart3,
    color: 'amber',
    sections: ['Valuation', 'Comparables', 'DCF', 'Returns Analysis', 'Sensitivity'],
  },
  {
    id: 'team-update',
    name: 'Team Update',
    description: 'Progress report for deal team',
    icon: Users,
    color: 'teal',
    sections: ['Status', 'Completed Tasks', 'Open Items', 'Timeline', 'Action Items'],
  },
]

// Generated reports
const GENERATED_REPORTS = [
  {
    id: '1',
    name: 'TechCorp Acquisition - IC Memo',
    template: 'IC Memo',
    deal: 'TechCorp Acquisition',
    status: 'complete',
    generatedAt: '2024-12-28 14:32',
    pages: 12,
    models: ['claude', 'gpt-4'],
    confidence: 0.92,
  },
  {
    id: '2',
    name: 'TechCorp - Risk Assessment Summary',
    template: 'Risk Summary',
    deal: 'TechCorp Acquisition',
    status: 'complete',
    generatedAt: '2024-12-27 09:15',
    pages: 8,
    models: ['claude'],
    confidence: 0.89,
  },
  {
    id: '3',
    name: 'TechCorp - Financial Model Analysis',
    template: 'Financial Analysis',
    deal: 'TechCorp Acquisition',
    status: 'generating',
    generatedAt: '2024-12-29 10:00',
    pages: 0,
    models: ['gpt-4', 'claude'],
    confidence: 0,
    progress: 67,
  },
]

export default function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [showPreview, setShowPreview] = useState<string | null>(null)

  const selectedTemplateData = TEMPLATES.find(t => t.id === selectedTemplate)

  const handleGenerate = () => {
    if (!selectedTemplate) return
    setIsGenerating(true)
    setGenerationStep(0)

    // Simulate generation steps
    const steps = [
      'Aggregating deal data from all analyses...',
      'Retrieving findings from document reviews...',
      'Querying Claude for narrative sections...',
      'GPT-4 validating financial calculations...',
      'Building consensus on key findings...',
      'Formatting report with charts...',
      'Generating PDF...',
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      setGenerationStep(currentStep)
      if (currentStep >= steps.length) {
        clearInterval(interval)
        setTimeout(() => {
          setIsGenerating(false)
          setSelectedTemplate(null)
        }, 1000)
      }
    }, 1500)
  }

  const generationSteps = [
    { label: 'Aggregating data', status: generationStep > 0 ? 'complete' : generationStep === 0 && isGenerating ? 'active' : 'pending' },
    { label: 'Retrieving findings', status: generationStep > 1 ? 'complete' : generationStep === 1 ? 'active' : 'pending' },
    { label: 'Claude drafting', status: generationStep > 2 ? 'complete' : generationStep === 2 ? 'active' : 'pending' },
    { label: 'GPT-4 validation', status: generationStep > 3 ? 'complete' : generationStep === 3 ? 'active' : 'pending' },
    { label: 'Consensus building', status: generationStep > 4 ? 'complete' : generationStep === 4 ? 'active' : 'pending' },
    { label: 'Formatting', status: generationStep > 5 ? 'complete' : generationStep === 5 ? 'active' : 'pending' },
    { label: 'Exporting PDF', status: generationStep > 6 ? 'complete' : generationStep === 6 ? 'active' : 'pending' },
  ]

  return (
    <MainLayout
      title="Report Builder"
      subtitle="AI-powered generation of Investment Committee memos and Due Diligence reports"
    >
      <div className="space-y-6">
        {/* Template Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Report Templates</h2>
            <Badge variant="info">
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {TEMPLATES.map((template) => {
              const Icon = template.icon
              const isSelected = selectedTemplate === template.id
              return (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    hover
                    onClick={() => setSelectedTemplate(isSelected ? null : template.id)}
                    className={cn(
                      'p-4 cursor-pointer transition-all',
                      isSelected && 'ring-2 ring-teal-500 bg-teal-50/50'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        template.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        template.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        template.color === 'red' ? 'bg-red-100 text-red-600' :
                        template.color === 'green' ? 'bg-green-100 text-green-600' :
                        template.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                        'bg-teal-100 text-teal-600'
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{template.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.sections.slice(0, 3).map((section) => (
                            <span key={section} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {section}
                            </span>
                          ))}
                          {template.sections.length > 3 && (
                            <span className="text-xs text-gray-400">+{template.sections.length - 3} more</span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-teal-600" />
                      )}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Generation Panel */}
        <AnimatePresence>
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      Generate {selectedTemplateData?.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      AI will synthesize findings from all deal analyses into a professional report
                    </p>
                  </div>
                  {!isGenerating && (
                    <Button onClick={handleGenerate} className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Generate Report
                    </Button>
                  )}
                </div>

                {/* Generation Progress */}
                {isGenerating && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Generating report...</span>
                      <span className="font-medium text-teal-600">
                        {Math.round((generationStep / 7) * 100)}%
                      </span>
                    </div>
                    <Progress value={(generationStep / 7) * 100} size="lg" />
                    
                    <div className="grid grid-cols-7 gap-2 mt-4">
                      {generationSteps.map((step, index) => (
                        <div key={index} className="text-center">
                          <div className={cn(
                            'w-8 h-8 rounded-full mx-auto flex items-center justify-center mb-1',
                            step.status === 'complete' ? 'bg-green-100' :
                            step.status === 'active' ? 'bg-teal-100' :
                            'bg-gray-100'
                          )}>
                            {step.status === 'complete' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : step.status === 'active' ? (
                              <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                            ) : (
                              <span className="text-xs text-gray-400">{index + 1}</span>
                            )}
                          </div>
                          <span className={cn(
                            'text-[10px]',
                            step.status === 'complete' ? 'text-green-600' :
                            step.status === 'active' ? 'text-teal-600 font-medium' :
                            'text-gray-400'
                          )}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Model Activity */}
                    <div className="flex items-center justify-center gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg',
                        generationStep >= 2 && generationStep <= 4 ? 'bg-amber-100' : 'bg-gray-100'
                      )}>
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                          generationStep >= 2 && generationStep <= 4 ? 'bg-amber-500 text-white' : 'bg-gray-300 text-gray-600'
                        )}>
                          C
                        </div>
                        <span className={cn(
                          'text-sm',
                          generationStep >= 2 && generationStep <= 4 ? 'text-amber-700' : 'text-gray-500'
                        )}>
                          {generationStep === 2 ? 'Drafting...' : generationStep > 2 ? 'Complete' : 'Waiting'}
                        </span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg',
                        generationStep === 3 || generationStep === 4 ? 'bg-emerald-100' : 'bg-gray-100'
                      )}>
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                          generationStep === 3 || generationStep === 4 ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
                        )}>
                          G4
                        </div>
                        <span className={cn(
                          'text-sm',
                          generationStep === 3 || generationStep === 4 ? 'text-emerald-700' : 'text-gray-500'
                        )}>
                          {generationStep === 3 ? 'Validating...' : generationStep > 3 ? 'Complete' : 'Waiting'}
                        </span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg',
                        generationStep === 4 ? 'bg-purple-100' : 'bg-gray-100'
                      )}>
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                          generationStep === 4 ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-600'
                        )}>
                          ★
                        </div>
                        <span className={cn(
                          'text-sm',
                          generationStep === 4 ? 'text-purple-700' : 'text-gray-500'
                        )}>
                          {generationStep === 4 ? 'Building...' : generationStep > 4 ? 'Agreed' : 'Waiting'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sections Preview */}
                {!isGenerating && selectedTemplateData && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Report Sections</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTemplateData.sections.map((section, index) => (
                        <div key={section} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-700">{section}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated Reports */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Generated Reports</h2>
            <span className="text-sm text-gray-500">{GENERATED_REPORTS.length} reports</span>
          </div>
          <Card className="overflow-hidden">
            <div className="divide-y divide-gray-100">
              {GENERATED_REPORTS.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        report.status === 'complete' ? 'bg-green-100' : 'bg-yellow-100'
                      )}>
                        {report.status === 'complete' ? (
                          <FileText className="w-6 h-6 text-green-600" />
                        ) : (
                          <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{report.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <Badge variant={report.status === 'complete' ? 'success' : 'warning'}>
                            {report.status === 'complete' ? 'Complete' : 'Generating...'}
                          </Badge>
                          <span>{report.template}</span>
                          <span>•</span>
                          <span>{report.generatedAt}</span>
                          {report.status === 'complete' && (
                            <>
                              <span>•</span>
                              <span>{report.pages} pages</span>
                            </>
                          )}
                        </div>
                        {report.status === 'generating' && (
                          <div className="mt-2 w-48">
                            <Progress value={report.progress} size="sm" variant="warning" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Models Used */}
                      <div className="flex items-center gap-1">
                        {report.models.map((model) => (
                          <div
                            key={model}
                            className={cn(
                              'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold',
                              model === 'claude' ? 'bg-amber-100 text-amber-700' :
                              model === 'gpt-4' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-blue-100 text-blue-700'
                            )}
                          >
                            {model === 'claude' ? 'C' : model === 'gpt-4' ? 'G4' : 'Ge'}
                          </div>
                        ))}
                      </div>

                      {report.status === 'complete' && (
                        <>
                          <span className="text-sm text-gray-500">
                            {(report.confidence * 100).toFixed(0)}% confidence
                          </span>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Download className="w-4 h-4" />
                              PDF
                            </Button>
                            <Button size="sm">
                              <Send className="w-4 h-4" />
                              Share
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Multi-Model Value Prop */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Multi-Model Report Generation</h3>
              <p className="text-sm text-gray-600 mt-1">
                Reports are drafted by Claude for narrative quality, validated by GPT-4 for numerical accuracy, 
                and synthesized through our consensus engine. This ensures higher quality than any single model.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-center px-4">
                <div className="text-2xl font-bold text-purple-600">94%</div>
                <div className="text-xs text-gray-500">Accuracy</div>
              </div>
              <div className="text-center px-4 border-l border-purple-200">
                <div className="text-2xl font-bold text-purple-600">3.2s</div>
                <div className="text-xs text-gray-500">Avg Time</div>
              </div>
              <div className="text-center px-4 border-l border-purple-200">
                <div className="text-2xl font-bold text-purple-600">2</div>
                <div className="text-xs text-gray-500">Models</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
