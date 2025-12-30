'use client'

import { MainLayout } from '@/components/layout'
import { Card, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  Layers,
  Database,
  Shield,
  Cloud,
  Lock,
  FileCheck,
  GitBranch,
  Cpu,
  Network,
  ArrowRight,
  CheckCircle,
  Zap,
  Eye,
  BarChart3,
  Server,
  Globe,
  Key,
} from 'lucide-react'
import { motion } from 'framer-motion'

const ARCHITECTURE_LAYERS = [
  {
    name: 'Presentation Layer',
    description: 'React/Next.js with real-time updates',
    color: 'blue',
    technologies: ['Next.js 14', 'React', 'Tailwind CSS', 'Framer Motion'],
    icon: Globe,
  },
  {
    name: 'API Layer',
    description: 'RESTful endpoints with authentication',
    color: 'purple',
    technologies: ['Next.js API Routes', 'TypeScript', 'Zod Validation'],
    icon: Server,
  },
  {
    name: 'AI Orchestration',
    description: 'Multi-model coordination and consensus',
    color: 'emerald',
    technologies: ['Claude API', 'OpenAI API', 'Gemini API', 'Parallel Processing'],
    icon: Cpu,
  },
  {
    name: 'Data Layer',
    description: 'Secure storage with encryption',
    color: 'amber',
    technologies: ['Supabase', 'PostgreSQL', 'Row-Level Security', 'AES-256'],
    icon: Database,
  },
]

const SECURITY_FEATURES = [
  { name: 'End-to-End Encryption', description: 'AES-256 for data at rest, TLS 1.3 in transit', icon: Lock },
  { name: 'Row-Level Security', description: 'Database policies enforce data isolation', icon: Shield },
  { name: 'Signed URLs', description: 'Time-limited access to documents', icon: Key },
  { name: 'Audit Logging', description: 'Complete trail of all actions', icon: FileCheck },
  { name: 'RBAC Ready', description: 'Role-based access control framework', icon: Eye },
  { name: 'SOC 2 Architecture', description: 'Built for compliance requirements', icon: CheckCircle },
]

const AI_CAPABILITIES = [
  {
    category: 'Analysis Modes',
    items: [
      'Multi-Model Consensus',
      'Adversarial Debate',
      'RAG Interrogation',
      'Reasoning Streams',
    ],
  },
  {
    category: 'Risk Intelligence',
    items: [
      'Monte Carlo Simulation',
      'Sensitivity Analysis',
      'Knowledge Graph Extraction',
      'Cross-Document Analysis',
    ],
  },
  {
    category: 'Model Specialization',
    items: [
      'Claude: Legal & Contract',
      'GPT-4: Financial & Valuation',
      'Gemini: Research & Context',
      'Consensus: Statistical Validation',
    ],
  },
]

const DIFFERENTIATORS = [
  {
    title: 'Not Just an API Wrapper',
    description: 'Purpose-built orchestration logic that leverages each model\'s strengths',
    metric: 'Specialized prompts per model',
  },
  {
    title: 'Statistical Consensus',
    description: 'Standard deviation scoring identifies agreement and flags disagreements',
    metric: 'σ-based confidence',
  },
  {
    title: 'Full Attribution',
    description: 'Every finding tagged with the model that detected it',
    metric: '100% transparency',
  },
  {
    title: 'Sequential Debate',
    description: 'Models actually see and respond to each other\'s arguments',
    metric: 'Real adversarial analysis',
  },
]

export default function ArchitecturePage() {
  return (
    <MainLayout
      title="System Architecture"
      subtitle="Enterprise-grade AI infrastructure for M&A due diligence"
    >
      <div className="space-y-6">
        {/* Hero Stats */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { value: '3', label: 'AI Models', color: 'emerald' },
            { value: '12+', label: 'Analysis Tools', color: 'purple' },
            { value: 'AES-256', label: 'Encryption', color: 'blue' },
            { value: '100%', label: 'Attribution', color: 'amber' },
            { value: 'SOC 2', label: 'Ready', color: 'teal' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-4 text-center">
                <div className={cn('text-2xl font-bold', `text-${stat.color}-600`)}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Architecture Layers */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-gray-900">Architecture Layers</h3>
          </div>

          <div className="space-y-4">
            {ARCHITECTURE_LAYERS.map((layer, i) => {
              const Icon = layer.icon
              return (
                <motion.div
                  key={layer.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    `bg-${layer.color}-100`
                  )}>
                    <Icon className={cn('w-6 h-6', `text-${layer.color}-600`)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{layer.name}</span>
                      <span className="text-sm text-gray-500">— {layer.description}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {layer.technologies.map((tech) => (
                        <Badge key={tech} variant="default" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {i < ARCHITECTURE_LAYERS.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-300 rotate-90 flex-shrink-0" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Security Features */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Security & Compliance</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {SECURITY_FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.name} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                      <div className="text-xs text-gray-500">{feature.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* AI Capabilities */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">AI Capabilities</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {AI_CAPABILITIES.map((category) => (
                <div key={category.category}>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {category.category}
                  </div>
                  <ul className="space-y-1">
                    {category.items.map((item) => (
                      <li key={item} className="text-sm text-gray-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Differentiators */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900">What Makes This Different</h3>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {DIFFERENTIATORS.map((diff, i) => (
              <motion.div
                key={diff.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-600">{i + 1}</span>
                </div>
                <div className="font-semibold text-gray-900 mb-1">{diff.title}</div>
                <div className="text-sm text-gray-500 mb-2">{diff.description}</div>
                <Badge variant="success" className="text-xs">{diff.metric}</Badge>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Data Flow */}
        <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <Network className="w-5 h-5 text-teal-400" />
            <h3 className="font-semibold text-white">Data Flow Architecture</h3>
          </div>
          
          <div className="flex items-center justify-between text-white">
            {[
              { label: 'Document\nUpload', icon: FileCheck, color: 'blue' },
              { label: 'Secure\nStorage', icon: Database, color: 'purple' },
              { label: 'Parallel\nAnalysis', icon: Cpu, color: 'emerald' },
              { label: 'Consensus\nScoring', icon: BarChart3, color: 'amber' },
              { label: 'Attributed\nFindings', icon: Eye, color: 'teal' },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center mb-2',
                    `bg-${step.color}-500/20`
                  )}>
                    <step.icon className={cn('w-7 h-7', `text-${step.color}-400`)} />
                  </div>
                  <div className="text-xs text-center text-gray-400 whitespace-pre-line">
                    {step.label}
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <ArrowRight className="w-6 h-6 mx-4 text-gray-600" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-sm text-gray-400">Average Processing</div>
                <div className="text-xl font-bold text-white">&lt; 30 seconds</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Parallel Efficiency</div>
                <div className="text-xl font-bold text-white">3x Faster</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Storage</div>
                <div className="text-xl font-bold text-white">AES-256 Encrypted</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Technical Specifications */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Infrastructure</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Vercel Edge Network
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Supabase PostgreSQL
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Global CDN Distribution
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                99.9% Uptime SLA Ready
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">API Design</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                RESTful Architecture
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                TypeScript End-to-End
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Zod Schema Validation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Comprehensive Error Handling
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Compliance</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                SOC 2 Type II Ready
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                GDPR Architecture
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Complete Audit Trail
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Data Residency Options
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
