'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Brain,
  Shield,
  Zap,
  FileSearch,
  MessageSquare,
  Scale,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Lock,
  Clock,
  Users,
  TrendingUp,
  GitCompare,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-slate-900">DealScope</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/how-it-works" className="text-slate-600 hover:text-slate-900 transition text-sm font-medium">
              How It Works
            </Link>
            <Link href="/dashboard" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-emerald-700 text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              Multi-Model Consensus Architecture
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              M&A Due Diligence
              <span className="block text-emerald-600">Validated by AI Consensus</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Three AI models analyze every document in parallel. Statistical consensus scoring 
              identifies where models agree—and flags disagreements for human review.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-lg transition shadow-lg shadow-emerald-500/25"
              >
                Try DealScope Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-lg transition border border-slate-200"
              >
                See How It Works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition Section - More Professional */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Multi-Model Validation Architecture</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Enterprise-grade AI orchestration that leverages the unique strengths of Claude, GPT-4, 
              and Gemini—with statistical consensus to ensure accuracy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GitCompare,
                title: 'Statistical Consensus',
                description: 'Standard deviation scoring across model outputs. When variance is low, confidence is high. When models disagree, human review is triggered.',
                stat: 'σ-Based Scoring',
              },
              {
                icon: Scale,
                title: 'Adversarial Validation',
                description: 'Models argue opposing positions on deal risks. Sequential debate where each model responds to the other\'s arguments. Independent judgment.',
                stat: 'Debate Protocol',
              },
              {
                icon: Shield,
                title: 'Full Audit Trail',
                description: 'Every finding attributed to its source model. Complete reasoning transparency. SOC 2 ready architecture with compliance logging.',
                stat: 'Model Attribution',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-slate-800 rounded-2xl"
              >
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-emerald-400 text-sm font-medium mb-2">{feature.stat}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How Multi-Model Analysis Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Upload a document. Three AI models analyze in parallel. Consensus metrics reveal confidence levels.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Upload', desc: 'PDF, DOCX, or TXT', icon: FileSearch },
              { step: '2', title: 'Parallel Analysis', desc: 'Claude + GPT-4 + Gemini', icon: Brain },
              { step: '3', title: 'Consensus Scoring', desc: 'Statistical validation', icon: BarChart3 },
              { step: '4', title: 'Attributed Findings', desc: 'Model-tagged results', icon: CheckCircle },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-emerald-600 font-bold text-sm mb-1">Step {item.step}</div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Differentiators */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Enterprise-Grade AI Orchestration</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Purpose-built for institutional due diligence with security, compliance, and transparency at the core.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MessageSquare, title: 'RAG Interrogation', desc: 'Ask questions, get cited answers with exact document references' },
              { icon: Scale, title: 'Agent Debate Arena', desc: 'Watch AI models argue opposing positions with independent judgment' },
              { icon: Brain, title: 'Reasoning Transparency', desc: 'See exactly how each model reaches its conclusions' },
              { icon: Lock, title: 'Private Storage', desc: 'AES-256 encrypted, signed URLs, SOC 2 compliant architecture' },
              { icon: Clock, title: 'Complete Audit Trail', desc: 'Every action logged with timestamps for compliance' },
              { icon: Users, title: 'Team Collaboration', desc: 'Secure workspaces for deal teams with role-based access' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition"
              >
                <feature.icon className="w-8 h-8 text-emerald-600 mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Specialization */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Specialized Model Orchestration</h2>
          <p className="text-slate-600 mb-12 max-w-2xl mx-auto">
            Each model receives domain-specific prompts optimized for their documented strengths
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                name: 'Claude', 
                company: 'Anthropic', 
                focus: 'Legal & Contract Analysis', 
                bgColor: 'bg-amber-100', 
                textColor: 'text-amber-600',
                specialties: ['MAC clauses', 'Termination rights', 'Indemnification', 'Reps & warranties']
              },
              { 
                name: 'GPT-4', 
                company: 'OpenAI', 
                focus: 'Financial & Valuation', 
                bgColor: 'bg-emerald-100', 
                textColor: 'text-emerald-600',
                specialties: ['Purchase price', 'Earnouts', 'Working capital', 'Deal multiples']
              },
              { 
                name: 'Gemini', 
                company: 'Google', 
                focus: 'Research & Context', 
                bgColor: 'bg-blue-100', 
                textColor: 'text-blue-600',
                specialties: ['Industry dynamics', 'Precedent deals', 'Regulatory landscape', 'Market context']
              },
            ].map((model) => (
              <div key={model.name} className="p-6 bg-white rounded-xl border border-slate-200 text-left">
                <div className={`w-12 h-12 ${model.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                  <span className={`${model.textColor} font-bold text-lg`}>{model.name[0]}</span>
                </div>
                <h3 className="font-semibold text-slate-900">{model.name}</h3>
                <p className="text-slate-400 text-sm mb-2">{model.company}</p>
                <p className="text-emerald-600 text-sm font-medium mb-3">{model.focus}</p>
                <ul className="space-y-1">
                  {model.specialties.map(s => (
                    <li key={s} className="text-slate-500 text-xs flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Due Diligence?</h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Upload your first document and see multi-model consensus in action.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition shadow-xl"
          >
            Launch DealScope
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-slate-400">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-white font-bold">DealScope</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/how-it-works" className="hover:text-white transition">How It Works</Link>
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <a href="mailto:hello@dealscope.ai" className="hover:text-white transition">Contact</a>
          </div>
          <p className="text-sm">© 2024 DealScope. Multi-Model AI Due Diligence.</p>
        </div>
      </footer>
    </div>
  )
}
