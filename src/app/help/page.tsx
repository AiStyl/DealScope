'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  HelpCircle,
  FileText,
  Brain,
  Scale,
  GitCompare,
  Target,
  Calculator,
  Calendar,
  ClipboardCheck,
  Network,
  Lightbulb,
  BarChart3,
  Settings,
  Play,
  ChevronRight,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Video,
  MessageSquare,
  Mail,
  Briefcase,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Feature {
  id: string
  name: string
  description: string
  value_proposition: string
  icon: React.ElementType
  color: string
  link: string
  steps: string[]
}

const FEATURES: Feature[] = [
  {
    id: 'document-review',
    name: 'Document Review',
    description: 'Upload M&A documents for AI-powered analysis',
    value_proposition: 'Reduce document review time by 80%. AI extracts key terms, risks, and action items in minutes instead of hours.',
    icon: FileText,
    color: 'blue',
    link: '/document-review',
    steps: [
      'Upload a document (PDF, DOCX, or image)',
      'AI extracts text and analyzes content',
      'Review findings with risk scores',
      'Export or share analysis',
    ],
  },
  {
    id: 'multi-agent',
    name: 'Multi-Agent Analysis',
    description: 'Three AI models analyze your documents simultaneously',
    value_proposition: 'Eliminate single-model bias. Statistical consensus across Claude, GPT-4, and Gemini reduces hallucinations by 60%.',
    icon: Brain,
    color: 'purple',
    link: '/multi-agent',
    steps: [
      'Select an analyzed document',
      'AI runs parallel analysis with 3 models',
      'Review consensus scores and disagreements',
      'Each finding tagged with source model',
    ],
  },
  {
    id: 'compare-models',
    name: 'Model Comparison',
    description: 'See how different AI models respond to the same question',
    value_proposition: 'Compare reasoning styles. See which model is most confident and fastest for your specific questions.',
    icon: GitCompare,
    color: 'teal',
    link: '/compare-models',
    steps: [
      'Enter a question about M&A',
      'All 3 models respond in parallel',
      'Compare responses side-by-side',
      'View agreement scores and timing',
    ],
  },
  {
    id: 'debate',
    name: 'Agent Debate Arena',
    description: 'AI models argue opposing positions on deal risks',
    value_proposition: 'Surface hidden risks. Adversarial debate reveals weaknesses in deal structure that consensus analysis might miss.',
    icon: Scale,
    color: 'amber',
    link: '/debate',
    steps: [
      'Enter a position to debate',
      'Claude argues FOR the position',
      'GPT-4 argues AGAINST (seeing Claude\'s argument)',
      'Gemini provides independent judgment',
    ],
  },
  {
    id: 'risk-simulation',
    name: 'Monte Carlo Risk',
    description: 'Run thousands of scenarios to quantify deal risk',
    value_proposition: 'Data-driven decisions. 10,000+ simulations provide statistical confidence intervals for deal outcomes.',
    icon: Target,
    color: 'red',
    link: '/risk-simulation',
    steps: [
      'Select document and set base value',
      'AI extracts risk factors from document',
      'Run 10,000+ Monte Carlo simulations',
      'View VaR, distribution, and worst cases',
    ],
  },
  {
    id: 'deal-simulator',
    name: 'Deal Simulator',
    description: 'Model deal scenarios with IRR and NPV calculations',
    value_proposition: 'Optimize deal structure. Instantly see how changes in price, leverage, or synergies affect returns.',
    icon: Calculator,
    color: 'emerald',
    link: '/deal-simulator',
    steps: [
      'Adjust deal parameters (price, debt, etc.)',
      'View IRR, NPV, and MOIC calculations',
      'Compare base vs upside/downside scenarios',
      'AI provides deal structure insights',
    ],
  },
  {
    id: 'valuation',
    name: 'Valuation Calculator',
    description: 'DCF and comparable company analysis',
    value_proposition: 'Professional valuation. Full DCF model with 5-year projections plus comparable company multiples.',
    icon: BarChart3,
    color: 'indigo',
    link: '/valuation',
    steps: [
      'Enter financial assumptions',
      'Review 5-year DCF projections',
      'Compare to peer multiples',
      'View football field valuation range',
    ],
  },
  {
    id: 'checklist',
    name: 'Due Diligence Checklist',
    description: 'AI-powered M&A checklist with 19 standard items',
    value_proposition: 'Never miss a step. Comprehensive checklist covers legal, financial, operational, and commercial DD.',
    icon: ClipboardCheck,
    color: 'cyan',
    link: '/deal-checklist',
    steps: [
      'Generate standard M&A checklist',
      'Optionally link to document for AI assessment',
      'Track status of each item',
      'Filter by category or status',
    ],
  },
  {
    id: 'timeline',
    name: 'Deal Timeline',
    description: 'Visual milestone tracking for deal execution',
    value_proposition: 'Stay on schedule. Track all critical dates and see which milestones are at risk.',
    icon: Calendar,
    color: 'rose',
    link: '/timeline',
    steps: [
      'View pre-loaded M&A milestones',
      'Add custom milestones with dates',
      'Update status as you progress',
      'Milestones auto-sort by date',
    ],
  },
  {
    id: 'knowledge-graph',
    name: 'Knowledge Graph',
    description: 'Visualize entities and relationships in documents',
    value_proposition: 'See the big picture. AI extracts companies, people, contracts, and their connections.',
    icon: Network,
    color: 'violet',
    link: '/knowledge-graph',
    steps: [
      'Select an analyzed document',
      'AI extracts entities and relationships',
      'Interactive graph visualization',
      'Click nodes to see connections',
    ],
  },
]

const FAQ = [
  {
    q: 'What makes DealScope different from ChatGPT?',
    a: 'DealScope is purpose-built for M&A. It uses 3 AI models simultaneously for statistical consensus, has specialized M&A prompts, and provides audit trails required for professional use.',
  },
  {
    q: 'How does multi-model consensus reduce errors?',
    a: 'When Claude, GPT-4, and Gemini all identify the same risk, you can be confident it\'s real. When they disagree, the system flags it for human review.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Documents are encrypted with AES-256, stored in SOC 2 compliant infrastructure, and never used to train AI models.',
  },
  {
    q: 'Can I use my own API keys?',
    a: 'Enterprise plans support custom API keys. Contact us for details.',
  },
]

export default function HelpPage() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <MainLayout
      title="Help & Documentation"
      subtitle="Learn how to get the most out of DealScope"
    >
      <div className="space-y-8">
        {/* Quick Start */}
        <Card className="p-6 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
              <Play className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-teal-900">Quick Start Guide</h2>
              <p className="text-teal-700">Get started in 3 simple steps</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {[
              { step: 1, title: 'Upload Documents', desc: 'Upload M&A documents for analysis', link: '/document-review' },
              { step: 2, title: 'Run AI Analysis', desc: 'Let 3 AI models analyze your docs', link: '/multi-agent' },
              { step: 3, title: 'Review Findings', desc: 'See risks, insights, and recommendations', link: '/dashboard' },
            ].map((item) => (
              <Link key={item.step} href={item.link}>
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg hover:shadow-md transition cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Feature Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Features</h2>
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedFeature(selectedFeature?.id === feature.id ? null : feature)}
                  className="cursor-pointer"
                >
                  <Card className={cn(
                    'p-4 transition',
                    selectedFeature?.id === feature.id && 'ring-2 ring-teal-500'
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        `bg-${feature.color}-100`
                      )}>
                        <Icon className={cn('w-5 h-5', `text-${feature.color}-600`)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{feature.name}</h3>
                          <ChevronRight className={cn(
                            'w-4 h-4 text-gray-400 transition',
                            selectedFeature?.id === feature.id && 'rotate-90'
                          )} />
                        </div>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedFeature?.id === feature.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="p-3 bg-amber-50 rounded-lg mb-4">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5" />
                                <p className="text-sm text-amber-800">{feature.value_proposition}</p>
                              </div>
                            </div>

                            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">How to use:</div>
                            <ol className="space-y-2 mb-4">
                              {feature.steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                                    {i + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>

                            <Link href={feature.link}>
                              <Button size="sm" className="gap-2">
                                Open {feature.name}
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* FAQ */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">{item.q}</span>
                  <ChevronRight className={cn(
                    'w-4 h-4 text-gray-400 transition',
                    expandedFaq === i && 'rotate-90'
                  )} />
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-100 pt-3">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Documentation</h3>
            <p className="text-sm text-gray-500 mb-3">Full API docs and guides</p>
            <Button variant="secondary" size="sm">View Docs</Button>
          </Card>

          <Card className="p-4 text-center">
            <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Live Chat</h3>
            <p className="text-sm text-gray-500 mb-3">Talk to our support team</p>
            <Button variant="secondary" size="sm">Start Chat</Button>
          </Card>

          <Card className="p-4 text-center">
            <Mail className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Email Support</h3>
            <p className="text-sm text-gray-500 mb-3">support@dealscope.ai</p>
            <Button variant="secondary" size="sm">Send Email</Button>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
