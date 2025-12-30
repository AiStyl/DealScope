'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { ModelBadge } from '@/components/ui/ModelBadge'
import { cn } from '@/lib/utils'
import {
  Scale,
  Zap,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Trophy,
  Target,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DebateRound {
  round: number
  for_argument: {
    model: string
    argument: string
    key_points: string[]
    evidence_cited: string[]
    timestamp: string
  }
  against_argument: {
    model: string
    argument: string
    key_points: string[]
    evidence_cited: string[]
    timestamp: string
  }
}

interface DebateResult {
  topic: string
  format: {
    for_model: string
    against_model: string
    judge_model: string
    total_rounds: number
  }
  rounds: DebateRound[]
  verdict: {
    winner: 'FOR' | 'AGAINST' | 'TIE'
    confidence: number
    reasoning: string
    key_factors: string[]
    recommendation: string
  }
  processing_time_ms: number
}

const EXAMPLE_TOPICS = [
  'The MAC clause exclusions adequately protect the buyer',
  'The indemnification cap at 10% is sufficient for this deal size',
  'Cross-industry M&A risks outweigh the potential synergies',
  'The asymmetric breakup fee structure is unfair to the seller',
  'Earnout provisions should be included to bridge valuation gap',
  'The non-compete clause is overly restrictive and may face legal challenges',
  'The representations and warranties are sufficiently comprehensive',
  'The deal timeline allows adequate time for regulatory approval',
]

export default function DebatePage() {
  const [topic, setTopic] = useState('')
  const [rounds, setRounds] = useState(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DebateResult | null>(null)
  const [activeRound, setActiveRound] = useState(0)

  const startDebate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to debate')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, rounds }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.debate)
        setActiveRound(0)
      } else {
        setError(data.error || 'Debate failed')
      }
    } catch (err) {
      console.error('Debate error:', err)
      setError('Failed to start debate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getVerdictColor = (winner: string) => {
    if (winner === 'FOR') return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    if (winner === 'AGAINST') return 'text-red-600 bg-red-50 border-red-200'
    return 'text-amber-600 bg-amber-50 border-amber-200'
  }

  return (
    <MainLayout
      title="Agent Debate Arena"
      subtitle="Watch AI models argue opposing positions on M&A deal risks"
    >
      <div className="space-y-6">
        {/* Topic Input */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Debate Topic</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter a position to debate
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The MAC clause exclusions adequately protect the buyer"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={2}
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Debate Rounds
                </label>
                <select
                  value={rounds}
                  onChange={(e) => setRounds(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                >
                  <option value={1}>1 Round (Quick)</option>
                  <option value={2}>2 Rounds (Standard)</option>
                  <option value={3}>3 Rounds (Deep)</option>
                </select>
              </div>

              <div className="flex-1" />

              <Button
                onClick={startDebate}
                disabled={loading || !topic.trim()}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Debate in Progress...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Start Debate
                  </>
                )}
              </Button>
            </div>

            {/* Example Topics */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Or try an example topic:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_TOPICS.slice(0, 4).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition disabled:opacity-50"
                  >
                    {t.length > 50 ? t.slice(0, 50) + '...' : t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

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

        {/* Loading State */}
        {loading && (
          <Card className="p-8">
            <div className="text-center">
              <div className="flex justify-center gap-8 mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-2 animate-pulse">
                    <span className="text-amber-700 font-bold text-xl">C</span>
                  </div>
                  <span className="text-sm text-amber-600 font-medium">Claude</span>
                  <span className="text-xs text-gray-500">Arguing FOR</span>
                </div>
                <div className="flex items-center">
                  <Scale className="w-8 h-8 text-purple-400 animate-bounce" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-2 animate-pulse">
                    <span className="text-emerald-700 font-bold text-xl">G4</span>
                  </div>
                  <span className="text-sm text-emerald-600 font-medium">GPT-4</span>
                  <span className="text-xs text-gray-500">Arguing AGAINST</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Adversarial Debate in Progress</h3>
              <p className="text-sm text-gray-500 mb-4">
                Models are exchanging arguments sequentially. Each model sees and responds to the other's points.
              </p>
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Debate Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Debate Header */}
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900">Debate Complete</h3>
                  <p className="text-sm text-purple-700">"{result.topic}"</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-purple-600">{result.format.total_rounds} rounds</span>
                  <span className="text-purple-600">{(result.processing_time_ms / 1000).toFixed(1)}s</span>
                </div>
              </div>
            </Card>

            {/* Participants */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-amber-50 border-amber-200">
                <div className="flex items-center gap-3 mb-2">
                  <ModelBadge model="claude" size="lg" />
                  <div>
                    <div className="font-semibold text-amber-800">Claude</div>
                    <div className="text-xs text-amber-600">Arguing FOR</div>
                  </div>
                </div>
                <ThumbsUp className="w-5 h-5 text-amber-500" />
              </Card>

              <Card className="p-4 bg-emerald-50 border-emerald-200">
                <div className="flex items-center gap-3 mb-2">
                  <ModelBadge model="gpt-4" size="lg" />
                  <div>
                    <div className="font-semibold text-emerald-800">GPT-4</div>
                    <div className="text-xs text-emerald-600">Arguing AGAINST</div>
                  </div>
                </div>
                <ThumbsDown className="w-5 h-5 text-emerald-500" />
              </Card>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <ModelBadge model="gemini" size="lg" />
                  <div>
                    <div className="font-semibold text-blue-800">Gemini</div>
                    <div className="text-xs text-blue-600">Judge</div>
                  </div>
                </div>
                <Scale className="w-5 h-5 text-blue-500" />
              </Card>
            </div>

            {/* Round Navigation */}
            <div className="flex items-center gap-2">
              {result.rounds.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveRound(i)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition',
                    activeRound === i
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  Round {i + 1}
                </button>
              ))}
            </div>

            {/* Active Round */}
            {result.rounds[activeRound] && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* FOR Argument */}
                <Card className="p-6 border-amber-200">
                  <div className="flex items-center gap-2 mb-4">
                    <ModelBadge model="claude" size="md" showLabel />
                    <Badge variant="success">FOR</Badge>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {result.rounds[activeRound].for_argument.argument}
                    </p>
                  </div>
                  {result.rounds[activeRound].for_argument.key_points.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-amber-100">
                      <h4 className="text-xs font-semibold text-amber-800 mb-2">Key Points:</h4>
                      <ul className="space-y-1">
                        {result.rounds[activeRound].for_argument.key_points.map((point, i) => (
                          <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>

                {/* AGAINST Argument */}
                <Card className="p-6 border-emerald-200">
                  <div className="flex items-center gap-2 mb-4">
                    <ModelBadge model="gpt-4" size="md" showLabel />
                    <Badge variant="danger">AGAINST</Badge>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {result.rounds[activeRound].against_argument.argument}
                    </p>
                  </div>
                  {result.rounds[activeRound].against_argument.key_points.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-emerald-100">
                      <h4 className="text-xs font-semibold text-emerald-800 mb-2">Key Points:</h4>
                      <ul className="space-y-1">
                        {result.rounds[activeRound].against_argument.key_points.map((point, i) => (
                          <li key={i} className="text-xs text-emerald-700 flex items-start gap-2">
                            <Target className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Verdict */}
            <Card className={cn('p-6 border-2', getVerdictColor(result.verdict.winner))}>
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold text-lg">Verdict: {result.verdict.winner}</h3>
                  <p className="text-sm opacity-80">
                    Confidence: {(result.verdict.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="ml-auto">
                  <ModelBadge model="gemini" size="md" showLabel />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Reasoning:</h4>
                  <p className="text-sm opacity-90">{result.verdict.reasoning}</p>
                </div>

                {result.verdict.key_factors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Key Factors:</h4>
                    <ul className="space-y-1">
                      {result.verdict.key_factors.map((factor, i) => (
                        <li key={i} className="text-sm opacity-90 flex items-start gap-2">
                          <Sparkles className="w-3 h-3 mt-1 flex-shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-current/20">
                  <h4 className="text-sm font-semibold mb-2">Recommendation:</h4>
                  <p className="text-sm opacity-90">{result.verdict.recommendation}</p>
                </div>
              </div>
            </Card>

            {/* New Debate Button */}
            <div className="text-center">
              <Button
                variant="secondary"
                onClick={() => {
                  setResult(null)
                  setTopic('')
                }}
                className="gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Start New Debate
              </Button>
            </div>
          </motion.div>
        )}

        {/* Empty State - How it works */}
        {!loading && !result && (
          <Card className="p-8 text-center">
            <Scale className="w-16 h-16 text-purple-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">How Agent Debate Works</h3>
            <p className="text-sm text-gray-500 max-w-lg mx-auto mb-6">
              Enter a position about an M&A deal risk. Claude will argue FOR the position, 
              GPT-4 will argue AGAINST (seeing Claude's argument first), and Gemini will judge 
              based on evidence quality and logical consistency.
            </p>
            <div className="flex justify-center gap-8 text-sm">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                  <span className="text-amber-700 font-bold">C</span>
                </div>
                <span className="text-gray-600">Claude argues FOR</span>
              </div>
              <div className="flex items-center">
                <ArrowRight className="w-5 h-5 text-gray-300" />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                  <span className="text-emerald-700 font-bold">G4</span>
                </div>
                <span className="text-gray-600">GPT-4 rebuts</span>
              </div>
              <div className="flex items-center">
                <ArrowRight className="w-5 h-5 text-gray-300" />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <span className="text-blue-700 font-bold">Ge</span>
                </div>
                <span className="text-gray-600">Gemini judges</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
