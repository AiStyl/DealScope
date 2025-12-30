'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Brain,
  FileSearch,
  GitCompare,
  Scale,
  Shield,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Database,
  Lock,
  Eye,
  Server,
} from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-slate-900">DealScope</span>
          </Link>
          <Link href="/dashboard" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition">
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            How DealScope Works
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Complete transparency about our AI architecture. No black boxes. 
            No magic claims. Just rigorous engineering.
          </p>
        </div>
      </section>

      {/* Multi-Model Analysis Flow */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">1. Multi-Model Analysis</h2>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-5 gap-4 items-center">
              {[
                { label: 'Upload', icon: FileSearch, desc: 'PDF/DOCX/TXT' },
                { label: 'Extract', icon: Database, desc: 'Text extraction' },
                { label: 'Analyze', icon: Brain, desc: '3 models parallel' },
                { label: 'Consensus', icon: GitCompare, desc: 'Statistical comparison' },
                { label: 'Results', icon: CheckCircle, desc: 'Attributed findings' },
              ].map((step, i) => (
                <div key={step.label} className="text-center">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <step.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">{step.label}</div>
                  <div className="text-slate-500 text-xs">{step.desc}</div>
                  {i < 4 && <div className="hidden md:block text-slate-300 text-2xl mt-2">→</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                model: 'Claude',
                company: 'Anthropic',
                color: 'amber',
                focus: 'Legal Analysis',
                specialties: ['MAC clauses', 'Termination rights', 'Indemnification', 'Reps & warranties'],
              },
              {
                model: 'GPT-4',
                company: 'OpenAI',
                color: 'emerald',
                focus: 'Financial Analysis',
                specialties: ['Purchase price mechanics', 'Earnouts', 'Working capital', 'Valuations'],
              },
              {
                model: 'Gemini',
                company: 'Google',
                color: 'blue',
                focus: 'Research & Context',
                specialties: ['Industry dynamics', 'Precedent transactions', 'Regulatory landscape', 'Entity relationships'],
              },
            ].map((m) => (
              <div key={m.model} className="p-6 bg-white rounded-xl border border-slate-200">
                <div className={`w-10 h-10 bg-${m.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <span className={`text-${m.color}-600 font-bold`}>{m.model[0]}</span>
                </div>
                <h3 className="font-semibold text-slate-900">{m.model}</h3>
                <p className="text-slate-400 text-sm mb-3">{m.company}</p>
                <p className="text-emerald-600 font-medium text-sm mb-3">{m.focus}</p>
                <ul className="space-y-1">
                  {m.specialties.map(s => (
                    <li key={s} className="text-slate-500 text-xs flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-emerald-50 rounded-xl border border-emerald-200">
            <h4 className="font-semibold text-emerald-900 mb-2">Consensus Scoring</h4>
            <p className="text-emerald-800 text-sm">
              We calculate standard deviation across model risk scores. Low variance (σ &lt; 10) = <strong>Strong Agreement</strong>. 
              High variance (σ &gt; 25) = <strong>Disagreement Flag</strong> triggering human review. 
              This isn't just averaging - it's statistical validation.
            </p>
          </div>
        </div>
      </section>

      {/* Agent Debate */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">2. Adversarial Debate</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">How Debate Works</h3>
              <div className="space-y-4">
                {[
                  { step: 1, text: 'Claude argues FOR the position (e.g., "MAC clause is adequate")' },
                  { step: 2, text: 'GPT-4 SEES Claude\'s argument and argues AGAINST' },
                  { step: 3, text: 'Round 2: Claude rebuts GPT-4\'s points' },
                  { step: 4, text: 'GPT-4 delivers final counter-argument' },
                  { step: 5, text: 'Gemini judges based on evidence quality & logic' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{item.step}</span>
                    </div>
                    <p className="text-slate-600 text-sm">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Why This Matters</h3>
              <ul className="space-y-3">
                {[
                  'Models RESPOND to each other - not scripted',
                  'Surfaces arguments humans might miss',
                  'Reveals weaknesses in position defense',
                  'Independent judge prevents bias',
                  'Creates defensible audit trail',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2 text-slate-600 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What We DON'T Claim */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">3. What We DON'T Claim</h2>
          </div>

          <div className="bg-red-50 rounded-xl p-8 border border-red-200">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Not a Replacement for Lawyers',
                  desc: 'AI assists human experts. It doesn\'t replace them. Always have qualified counsel review findings.',
                },
                {
                  title: 'AI Can Hallucinate',
                  desc: 'Language models sometimes generate plausible but incorrect information. We mitigate with multi-model validation, but verify critical findings.',
                },
                {
                  title: 'No Real-Time Data',
                  desc: 'Models have knowledge cutoffs. For current market data, regulatory status, or recent events, use specialized sources.',
                },
                {
                  title: 'Not 100% Accurate',
                  desc: 'We optimize for high-value signal, not perfection. Expect some false positives. The goal is to surface issues for human review.',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">{item.title}</h4>
                    <p className="text-red-700 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">4. Security & Compliance</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: 'Private Storage',
                points: ['AES-256 encryption at rest', 'Signed URLs with expiration', 'No public bucket access', 'File-level access control'],
              },
              {
                icon: Eye,
                title: 'Audit Trail',
                points: ['Every action logged', 'User attribution', 'Timestamp tracking', 'SOC 2 ready architecture'],
              },
              {
                icon: Server,
                title: 'Data Handling',
                points: ['Documents never used for training', 'Processing in secure environment', 'Automatic data retention policies', 'GDPR compliant deletion'],
              },
            ].map((section) => (
              <div key={section.title} className="bg-white rounded-xl p-6 border border-slate-200">
                <section.icon className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="font-semibold text-slate-900 mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-slate-600 text-sm">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Questions?</h2>
          <p className="text-slate-600 mb-8">
            We're happy to discuss our architecture in detail. Reach out anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition"
            >
              Try DealScope
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="mailto:hello@dealscope.ai"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">D</span>
            </div>
            <span className="font-semibold text-slate-900">DealScope</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 DealScope</p>
        </div>
      </footer>
    </div>
  )
}
