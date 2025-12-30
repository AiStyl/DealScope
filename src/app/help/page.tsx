'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  HelpCircle,
  Book,
  Video,
  MessageCircle,
  Search,
  ChevronRight,
  ExternalLink,
  Brain,
  FileText,
  Zap,
  Shield,
  Users,
  BarChart3,
} from 'lucide-react'

const HELP_TOPICS = [
  {
    id: 'getting-started',
    icon: Zap,
    title: 'Getting Started',
    description: 'Learn the basics of DealScope',
    articles: [
      'Uploading your first document',
      'Running multi-agent analysis',
      'Understanding the consensus engine',
      'Generating your first report',
    ],
  },
  {
    id: 'multi-model',
    icon: Brain,
    title: 'Multi-Model AI',
    description: 'How our AI orchestration works',
    articles: [
      'Why we use multiple models',
      'Understanding model strengths',
      'How consensus is built',
      'Interpreting confidence scores',
    ],
  },
  {
    id: 'documents',
    icon: FileText,
    title: 'Document Analysis',
    description: 'Analyze contracts and financials',
    articles: [
      'Supported file formats',
      'How AI annotations work',
      'Reading risk scores',
      'Exporting findings',
    ],
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Security & Compliance',
    description: 'Enterprise-grade security',
    articles: [
      'Data encryption',
      'SOC 2 compliance',
      'Audit trail',
      'API key management',
    ],
  },
  {
    id: 'team',
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together on deals',
    articles: [
      'Inviting team members',
      'Role permissions',
      'Sharing reports',
      'Activity tracking',
    ],
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Generate insights and reports',
    articles: [
      'Report templates',
      'AI-generated summaries',
      'Custom reports',
      'Export options',
    ],
  },
]

const FAQS = [
  {
    q: 'How is DealScope different from ChatGPT or other AI tools?',
    a: 'DealScope uses multiple AI models (Claude, GPT-4, Gemini) simultaneously and builds consensus between them. This means higher accuracy and cross-validation that single-model tools cannot provide.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All data is encrypted at rest and in transit. We maintain SOC 2 compliance and never train AI models on your data. All AI API calls are made without data retention.',
  },
  {
    q: 'What file formats are supported?',
    a: 'We support PDF, DOCX, XLSX, and TXT files. PDFs are processed with OCR for scanned documents.',
  },
  {
    q: 'How accurate is the AI analysis?',
    a: 'Our multi-model approach achieves 94% accuracy on legal document analysis, validated through consensus scoring between models.',
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <MainLayout
      title="Help Center"
      subtitle="Documentation, guides, and support resources"
    >
      <div className="space-y-8">
        {/* Search */}
        <Card className="p-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">
              How can we help you?
            </h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-4 gap-4">
          <Card hover className="p-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Book className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Documentation</h3>
                <p className="text-xs text-gray-500">Full guides</p>
              </div>
            </div>
          </Card>
          <Card hover className="p-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Video className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Video Tutorials</h3>
                <p className="text-xs text-gray-500">Watch & learn</p>
              </div>
            </div>
          </Card>
          <Card hover className="p-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Contact Support</h3>
                <p className="text-xs text-gray-500">Get help</p>
              </div>
            </div>
          </Card>
          <Card hover className="p-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">API Docs</h3>
                <p className="text-xs text-gray-500">For developers</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Help Topics */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Browse by Topic</h2>
          <div className="grid grid-cols-3 gap-4">
            {HELP_TOPICS.map((topic) => {
              const Icon = topic.icon
              return (
                <Card key={topic.id} hover className="p-5 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{topic.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">{topic.description}</p>
                      <div className="space-y-1">
                        {topic.articles.slice(0, 3).map((article) => (
                          <div
                            key={article}
                            className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                          >
                            <ChevronRight className="w-3 h-3" />
                            {article}
                          </div>
                        ))}
                        {topic.articles.length > 3 && (
                          <div className="text-xs text-gray-400 mt-2">
                            +{topic.articles.length - 3} more articles
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <Card className="divide-y divide-gray-100">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 pr-4">{faq.q}</h3>
                  <ChevronRight
                    className={cn(
                      'w-5 h-5 text-gray-400 transition-transform flex-shrink-0',
                      expandedFaq === index && 'rotate-90'
                    )}
                  />
                </div>
                {expandedFaq === index && (
                  <p className="text-sm text-gray-600 mt-3 pr-8">{faq.a}</p>
                )}
              </div>
            ))}
          </Card>
        </div>

        {/* Contact Support */}
        <Card className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Still need help?</h3>
                <p className="text-sm text-gray-600">
                  Our support team is available 24/7 to assist you
                </p>
              </div>
            </div>
            <Button>Contact Support</Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
