'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Button, Badge, Progress } from '@/components/ui'
import { MOCK_DEBATE_TURNS } from '@/lib/ai/mockData'
import { cn, getAgentColor } from '@/lib/utils'
import type { DebateTurn, ModelType } from '@/types'
import { 
  Play, 
  RotateCcw, 
  Swords,
  Scale,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Clock,
  Award,
  Brain
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type DebateStage = 'setup' | 'debating' | 'judging' | 'verdict'

export default function DebatePage() {
  const [stage, setStage] = useState<DebateStage>('setup')
  const [currentRound, setCurrentRound] = useState(0)
  const [turns, setTurns] = useState<DebateTurn[]>([])
  const [activeTurn, setActiveTurn] = useState<'for' | 'against' | null>(null)
  const [currentContent, setCurrentContent] = useState('')
  const [verdict, setVerdict] = useState<{
    winner: 'for' | 'against' | 'draw'
    reasoning: string
    confidence: number
  } | null>(null)
  const [question] = useState("Should we proceed with the acquisition of TechFlow Solutions at the proposed $52M valuation?")

  const startDebate = async () => {
    setStage('debating')
    setTurns([])
    setCurrentRound(1)
    setVerdict(null)

    // Simulate debate rounds
    for (const turn of MOCK_DEBATE_TURNS) {
      setActiveTurn(turn.side)
      setCurrentRound(turn.round)
      setCurrentContent('')

      // Simulate streaming
      const words = turn.argument.split(' ')
      for (const word of words) {
        setCurrentContent(prev => prev + word + ' ')
        await new Promise(resolve => setTimeout(resolve, 40))
      }

      // Add completed turn
      setTurns(prev => [...prev, turn])
      setCurrentContent('')
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Judging phase
    setStage('judging')
    setActiveTurn(null)
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Verdict
    setStage('verdict')
    setVerdict({
      winner: 'for',
      reasoning: "While the AGAINST team raised legitimate concerns about customer concentration and integration risks, the FOR team successfully demonstrated that these risks are adequately mitigated through the negotiated deal structure (escrow, indemnification, customer consent conditions). The fundamental financial case remains strong with justified premium and credible synergies. The opportunity cost argument was compelling but speculative. Recommendation: Proceed with acquisition.",
      confidence: 0.72
    })
  }

  const resetDebate = () => {
    setStage('setup')
    setTurns([])
    setCurrentRound(0)
    setActiveTurn(null)
    setCurrentContent('')
    setVerdict(null)
  }

  return (
    <MainLayout 
      title="Agent Debate Arena" 
      subtitle="AI agents argue for and against positions to stress-test decisions"
    >
      <div className="space-y-6">
        {/* Question Card */}
        <Card className="p-6 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Debate Question</p>
              <h2 className="text-xl font-semibold text-white">{question}</h2>
            </div>
            <div className="flex items-center gap-3">
              {stage === 'setup' && (
                <Button onClick={startDebate}>
                  <Swords className="w-4 h-4" />
                  Start Debate
                </Button>
              )}
              {stage !== 'setup' && (
                <Button variant="secondary" onClick={resetDebate}>
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Status Bar */}
          {stage !== 'setup' && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Badge variant={stage === 'debating' ? 'info' : stage === 'judging' ? 'consensus' : 'success'}>
                  {stage === 'debating' && `Round ${currentRound} of 2`}
                  {stage === 'judging' && 'Judge Deliberating'}
                  {stage === 'verdict' && 'Verdict Reached'}
                </Badge>
                <span className="text-sm text-gray-400">
                  {turns.length} arguments exchanged
                </span>
              </div>
              {activeTurn && (
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full animate-pulse',
                    activeTurn === 'for' ? 'bg-emerald-500' : 'bg-red-500'
                  )} />
                  <span className="text-sm text-gray-300">
                    {activeTurn === 'for' ? 'FOR team speaking...' : 'AGAINST team speaking...'}
                  </span>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Debate Arena */}
        <div className="grid grid-cols-2 gap-6">
          {/* FOR Side */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <ThumbsUp className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-emerald-700">FOR the Acquisition</span>
              <div className="ml-auto flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white">C</div>
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white">G</div>
              </div>
            </div>

            {/* FOR turns */}
            <div className="space-y-4">
              {turns.filter(t => t.side === 'for').map((turn, index) => (
                <DebateTurnCard key={index} turn={turn} />
              ))}
              {activeTurn === 'for' && currentContent && (
                <DebateTurnCard
                  turn={{
                    round: currentRound,
                    side: 'for',
                    agentId: currentRound === 1 ? 'financial_modeler' : 'contract_analyst',
                    agentName: currentRound === 1 ? 'Financial Analyst' : 'Contract Analyst',
                    model: currentRound === 1 ? 'gpt-4' : 'claude',
                    argument: currentContent,
                    evidence: [],
                    confidence: 0,
                    timestamp: new Date().toISOString(),
                  }}
                  isStreaming
                />
              )}
            </div>
          </div>

          {/* AGAINST Side */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 rounded-lg border border-red-200">
              <ThumbsDown className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-700">AGAINST the Acquisition</span>
              <div className="ml-auto flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white">C</div>
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white">G</div>
              </div>
            </div>

            {/* AGAINST turns */}
            <div className="space-y-4">
              {turns.filter(t => t.side === 'against').map((turn, index) => (
                <DebateTurnCard key={index} turn={turn} />
              ))}
              {activeTurn === 'against' && currentContent && (
                <DebateTurnCard
                  turn={{
                    round: currentRound,
                    side: 'against',
                    agentId: currentRound === 1 ? 'risk_assessor' : 'market_researcher',
                    agentName: currentRound === 1 ? 'Risk Assessor' : 'Market Researcher',
                    model: currentRound === 1 ? 'claude' : 'gemini',
                    argument: currentContent,
                    evidence: [],
                    confidence: 0,
                    timestamp: new Date().toISOString(),
                  }}
                  isStreaming
                />
              )}
            </div>
          </div>
        </div>

        {/* Judge Section */}
        <AnimatePresence>
          {(stage === 'judging' || stage === 'verdict') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-white" />
                    <h3 className="font-semibold text-white">Neutral Judge</h3>
                    <Badge variant="consensus">Claude Opus</Badge>
                  </div>
                </div>
                <div className="p-6">
                  {stage === 'judging' && (
                    <div className="flex items-center justify-center gap-3 py-8">
                      <div className="w-3 h-3 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-3 h-3 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-3 h-3 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-3 text-gray-600">Deliberating on arguments...</span>
                    </div>
                  )}
                  {stage === 'verdict' && verdict && (
                    <div className="space-y-6">
                      {/* Winner Banner */}
                      <div className={cn(
                        'p-6 rounded-xl text-center',
                        verdict.winner === 'for' ? 'bg-emerald-50 border border-emerald-200' :
                        verdict.winner === 'against' ? 'bg-red-50 border border-red-200' :
                        'bg-gray-50 border border-gray-200'
                      )}>
                        <p className="text-sm text-gray-500 mb-2">Verdict</p>
                        <h4 className={cn(
                          'text-2xl font-bold',
                          verdict.winner === 'for' ? 'text-emerald-700' :
                          verdict.winner === 'against' ? 'text-red-700' :
                          'text-gray-700'
                        )}>
                          {verdict.winner === 'for' ? '✓ PROCEED WITH ACQUISITION' :
                           verdict.winner === 'against' ? '✗ DO NOT PROCEED' :
                           '⚖ INSUFFICIENT EVIDENCE'}
                        </h4>
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <span className="text-sm text-gray-500">Confidence:</span>
                          <span className="font-semibold text-gray-700">{(verdict.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      {/* Reasoning */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Judge's Reasoning</h4>
                        <p className="text-gray-600 leading-relaxed">{verdict.reasoning}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How It Works (when in setup) */}
        {stage === 'setup' && (
          <Card className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">
                How the Debate Arena Works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                AI agents take opposing positions and argue with evidence. This adversarial process 
                surfaces risks and opportunities that a single perspective might miss.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600">1</div>
                <h3 className="font-semibold text-gray-900 mb-1">Teams Form</h3>
                <p className="text-sm text-gray-600">FOR and AGAINST teams assemble with different AI models</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600">2</div>
                <h3 className="font-semibold text-gray-900 mb-1">Arguments</h3>
                <p className="text-sm text-gray-600">Each side presents evidence-backed arguments</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600">3</div>
                <h3 className="font-semibold text-gray-900 mb-1">Rebuttals</h3>
                <p className="text-sm text-gray-600">Teams respond to opposing arguments directly</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600">4</div>
                <h3 className="font-semibold text-gray-900 mb-1">Verdict</h3>
                <p className="text-sm text-gray-600">Neutral judge synthesizes and recommends</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}

// Debate Turn Card Component
function DebateTurnCard({ turn, isStreaming }: { turn: DebateTurn; isStreaming?: boolean }) {
  const modelColors: Record<ModelType, { bg: string; text: string; accent: string }> = {
    claude: { bg: 'bg-amber-50', text: 'text-amber-700', accent: 'bg-amber-500' },
    'gpt-4': { bg: 'bg-emerald-50', text: 'text-emerald-700', accent: 'bg-emerald-500' },
    gemini: { bg: 'bg-blue-50', text: 'text-blue-700', accent: 'bg-blue-500' },
  }

  const colors = modelColors[turn.model]

  return (
    <motion.div
      initial={{ opacity: 0, x: turn.side === 'for' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn('rounded-xl border-2 overflow-hidden', colors.bg, `border-${turn.model === 'claude' ? 'amber' : turn.model === 'gpt-4' ? 'emerald' : 'blue'}-200`)}
    >
      <div className="px-4 py-3 border-b border-opacity-30 flex items-center justify-between" style={{ borderColor: getAgentColor(turn.model) + '40' }}>
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors.accent)}>
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className={cn('text-sm font-medium', colors.text)}>{turn.agentName}</p>
            <p className="text-xs text-gray-500">Round {turn.round}</p>
          </div>
        </div>
        <Badge variant={turn.model}>{turn.model}</Badge>
      </div>
      <div className="p-4">
        <p className={cn('text-sm text-gray-700 leading-relaxed whitespace-pre-wrap', isStreaming && 'streaming-cursor')}>
          {turn.argument}
        </p>
        {turn.evidence.length > 0 && !isStreaming && (
          <div className="mt-3 flex flex-wrap gap-2">
            {turn.evidence.map((e, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-white rounded border border-gray-200 text-gray-600">
                📎 {e}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
