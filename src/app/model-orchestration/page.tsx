'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { ModelBadge } from '@/components/ui/ModelBadge'
import { cn } from '@/lib/utils'
import {
  Workflow,
  Brain,
  FileText,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  Clock,
  Zap,
  GitMerge,
  Scale,
  MessageSquare,
  BarChart3,
  Shield,
  Activity,
  RefreshCw,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface WorkflowStep {
  id: string
  name: string
  description: string
  models: string[]
  status: 'pending' | 'active' | 'complete'
  duration?: number
  output?: string
}

const ORCHESTRATION_WORKFLOWS = [
  {
    id: 'consensus',
    name: 'Multi-Model Consensus',
    description: 'Three models analyze in parallel, statistical consensus calculates agreement',
    icon: GitMerge,
    color: 'emerald',
    steps: [
      { id: 'input', name: 'Document Input', description: 'Upload and preprocess document', models: [], status: 'complete' as const },
      { id: 'parallel', name: 'Parallel Analysis', description: 'Claude, GPT-4, Gemini analyze simultaneously', models: ['claude', 'gpt-4', 'gemini'], status: 'complete' as const },
      { id: 'aggregate', name: 'Response Aggregation', description: 'Collect findings from all models', models: [], status: 'complete' as const },
      { id: 'consensus', name: 'Consensus Scoring', description: 'Calculate statistical agreement using std deviation', models: [], status: 'complete' as const },
      { id: 'output', name: 'Attributed Output', description: 'Each finding tagged with detecting model', models: [], status: 'complete' as const },
    ],
  },
  {
    id: 'debate',
    name: 'Adversarial Debate',
    description: 'Sequential debate where models see and respond to each other',
    icon: Scale,
    color: 'purple',
    steps: [
      { id: 'topic', name: 'Topic Selection', description: 'Define the position to debate', models: [], status: 'complete' as const },
      { id: 'for', name: 'FOR Argument', description: 'Claude argues in favor of the position', models: ['claude'], status: 'complete' as const },
      { id: 'against', name: 'AGAINST Rebuttal', description: 'GPT-4 sees Claude\'s argument and rebuts', models: ['gpt-4'], status: 'complete' as const },
      { id: 'rounds', name: 'Additional Rounds', description: 'Each model responds to the other', models: ['claude', 'gpt-4'], status: 'complete' as const },
      { id: 'judge', name: 'Independent Judgment', description: 'Gemini evaluates without seeing prior turns', models: ['gemini'], status: 'complete' as const },
    ],
  },
  {
    id: 'interrogation',
    name: 'RAG Interrogation',
    description: 'Context-aware Q&A with citation extraction',
    icon: MessageSquare,
    color: 'teal',
    steps: [
      { id: 'embed', name: 'Document Embedding', description: 'Chunk and vectorize document content', models: [], status: 'complete' as const },
      { id: 'retrieve', name: 'Context Retrieval', description: 'Find relevant passages for the question', models: [], status: 'complete' as const },
      { id: 'generate', name: 'Answer Generation', description: 'Claude generates response with context', models: ['claude'], status: 'complete' as const },
      { id: 'cite', name: 'Citation Extraction', description: 'Identify exact passages supporting the answer', models: [], status: 'complete' as const },
      { id: 'flags', name: 'Risk Flagging', description: 'Highlight potential concerns in the answer', models: [], status: 'complete' as const },
    ],
  },
  {
    id: 'reasoning',
    name: 'Reasoning Streams',
    description: 'Step-by-step thought process visualization',
    icon: Brain,
    color: 'amber',
    steps: [
      { id: 'query', name: 'Query Analysis', description: 'Parse and understand the question', models: [], status: 'complete' as const },
      { id: 'observe', name: 'Observation Phase', description: 'Identify relevant facts in context', models: ['claude'], status: 'complete' as const },
      { id: 'analyze', name: 'Analysis Phase', description: 'Connect facts and identify patterns', models: ['claude'], status: 'complete' as const },
      { id: 'hypothesize', name: 'Hypothesis Formation', description: 'Form potential conclusions', models: ['claude'], status: 'complete' as const },
      { id: 'conclude', name: 'Conclusion', description: 'Synthesize final answer with confidence', models: ['claude'], status: 'complete' as const },
    ],
  },
]

const MODEL_STATS = [
  { model: 'claude', name: 'Claude', company: 'Anthropic', specialization: 'Legal & Contract Analysis', color: 'amber' },
  { model: 'gpt-4', name: 'GPT-4', company: 'OpenAI', specialization: 'Financial & Valuation', color: 'emerald' },
  { model: 'gemini', name: 'Gemini', company: 'Google', specialization: 'Research & Context', color: 'blue' },
]

export default function ModelOrchestrationPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(ORCHESTRATION_WORKFLOWS[0])
  const [activeStep, setActiveStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Animate through steps
  const playAnimation = () => {
    setIsAnimating(true)
    setActiveStep(0)
    
    let step = 0
    const interval = setInterval(() => {
      step++
      if (step >= selectedWorkflow.steps.length) {
        clearInterval(interval)
        setIsAnimating(false)
      } else {
        setActiveStep(step)
      }
    }, 1500)
  }

  useEffect(() => {
    setActiveStep(selectedWorkflow.steps.length - 1)
  }, [selectedWorkflow])

  return (
    <MainLayout
      title="Model Orchestration"
      subtitle="How DealScope coordinates multiple AI models"
    >
      <div className="space-y-6">
        {/* Model Cards */}
        <div className="grid grid-cols-3 gap-4">
          {MODEL_STATS.map((model) => (
            <Card key={model.model} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <ModelBadge model={model.model as any} size="lg" />
                <div>
                  <div className="font-semibold text-gray-900">{model.name}</div>
                  <div className="text-xs text-gray-500">{model.company}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Specialization:</span> {model.specialization}
              </div>
            </Card>
          ))}
        </div>

        {/* Workflow Selection */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Orchestration Patterns</h3>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={playAnimation}
              disabled={isAnimating}
              className="gap-2"
            >
              {isAnimating ? (
                <>
                  <Activity className="w-4 h-4 animate-pulse" />
                  Animating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Play Animation
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {ORCHESTRATION_WORKFLOWS.map((workflow) => {
              const Icon = workflow.icon
              return (
                <button
                  key={workflow.id}
                  onClick={() => setSelectedWorkflow(workflow)}
                  className={cn(
                    'p-4 rounded-xl text-left transition',
                    selectedWorkflow.id === workflow.id
                      ? `bg-${workflow.color}-50 border-2 border-${workflow.color}-500`
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-2',
                    `bg-${workflow.color}-100`
                  )}>
                    <Icon className={cn('w-5 h-5', `text-${workflow.color}-600`)} />
                  </div>
                  <div className="font-medium text-gray-900 text-sm">{workflow.name}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {workflow.description}
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Workflow Visualization */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            {(() => {
              const Icon = selectedWorkflow.icon
              return <Icon className={cn('w-5 h-5', `text-${selectedWorkflow.color}-600`)} />
            })()}
            <h3 className="font-semibold text-gray-900">{selectedWorkflow.name} Pipeline</h3>
          </div>

          {/* Pipeline Steps */}
          <div className="flex items-start justify-between">
            {selectedWorkflow.steps.map((step, i) => (
              <div key={step.id} className="flex items-start">
                {/* Step */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center w-40"
                >
                  {/* Status indicator */}
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all',
                    i <= activeStep
                      ? `bg-${selectedWorkflow.color}-100`
                      : 'bg-gray-100',
                    i === activeStep && isAnimating && 'ring-4 ring-offset-2 ring-teal-400 animate-pulse'
                  )}>
                    {i <= activeStep ? (
                      <CheckCircle className={cn('w-6 h-6', `text-${selectedWorkflow.color}-600`)} />
                    ) : (
                      <Clock className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Step info */}
                  <div className="text-center">
                    <div className={cn(
                      'font-medium text-sm mb-1',
                      i <= activeStep ? 'text-gray-900' : 'text-gray-400'
                    )}>
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {step.description}
                    </div>

                    {/* Models involved */}
                    {step.models.length > 0 && (
                      <div className="flex justify-center gap-1">
                        {step.models.map((model) => (
                          <ModelBadge key={model} model={model as any} size="sm" />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Arrow */}
                {i < selectedWorkflow.steps.length - 1 && (
                  <div className="flex items-center h-12 px-2">
                    <ArrowRight className={cn(
                      'w-5 h-5',
                      i < activeStep ? `text-${selectedWorkflow.color}-400` : 'text-gray-300'
                    )} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Technical Details */}
        <div className="grid grid-cols-2 gap-6">
          {/* Why Multi-Model */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <GitMerge className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Why Multi-Model?</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Reduced Hallucination</div>
                  <div className="text-gray-500">Statistical consensus filters out single-model errors</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Specialized Strengths</div>
                  <div className="text-gray-500">Each model optimized for specific analysis types</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Confidence Metrics</div>
                  <div className="text-gray-500">Model agreement indicates finding reliability</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Technical Implementation */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-gray-900">Technical Implementation</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-mono text-xs text-gray-600 mb-1">Parallel Execution</div>
                <div className="text-gray-700">Promise.all() for concurrent API calls, ~3x faster than sequential</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-mono text-xs text-gray-600 mb-1">Consensus Algorithm</div>
                <div className="text-gray-700">Standard deviation across risk scores, low σ = high agreement</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-mono text-xs text-gray-600 mb-1">Model Attribution</div>
                <div className="text-gray-700">Every finding tagged with detecting model for transparency</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-mono text-xs text-gray-600 mb-1">Audit Logging</div>
                <div className="text-gray-700">Full trace of all model interactions for compliance</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Architecture Summary */}
        <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Workflow className="w-5 h-5 text-teal-400" />
            <h3 className="font-semibold">Enterprise-Grade AI Architecture</h3>
          </div>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-teal-400">3</div>
              <div className="text-sm text-gray-400">AI Models</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">4</div>
              <div className="text-sm text-gray-400">Orchestration Patterns</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">100%</div>
              <div className="text-sm text-gray-400">Model Attribution</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400">SOC 2</div>
              <div className="text-sm text-gray-400">Ready Architecture</div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
