'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Button, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { ModelType } from '@/types'
import { Scale, Swords, ThumbsUp, ThumbsDown, RotateCcw, Award, Brain } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DebateTurn {
  round: number
  side: 'for' | 'against'
  agentId: string
  agentName: string
  model: ModelType
  argument: string
  evidence: string[]
  confidence: number
  timestamp: string
}

type DebateStage = 'setup' | 'debating' | 'judging' | 'verdict'

const MOCK_DEBATE_TURNS: DebateTurn[] = [
  { round: 1, side: 'for', agentId: 'financial', agentName: 'Financial Analyst', model: 'gpt-4', argument: 'The acquisition should proceed based on compelling financial fundamentals:\n\n1. **Attractive Valuation**: At 8.2x EV/EBITDA, the deal is only marginally above sector median.\n\n2. **Synergy Potential**: $4.2M in cost synergies identified.\n\n3. **Strategic Fit**: Fills critical gap in cloud infrastructure.', evidence: ['Comparable analysis', 'Synergy model'], confidence: 0.85, timestamp: new Date().toISOString() },
  { round: 1, side: 'against', agentId: 'risk', agentName: 'Risk Assessor', model: 'claude', argument: 'The acquisition carries unacceptable risks:\n\n1. **Customer Concentration**: 67% revenue in top 3 customers with no contracts.\n\n2. **Integration Risk**: Legacy systems require $8-12M migration.\n\n3. **IP Litigation**: Pending patent dispute could result in $2-5M liability.', evidence: ['Customer analysis', 'IT due diligence'], confidence: 0.82, timestamp: new Date().toISOString() },
  { round: 2, side: 'for', agentId: 'contract', agentName: 'Contract Analyst', model: 'claude', argument: 'The deal structure adequately mitigates risks:\n\n1. **Customer Risk**: 15% escrow tied to retention.\n\n2. **Integration**: Revised model includes $10M budget, still 12% IRR.\n\n3. **IP Protection**: Full indemnification with $5M escrow.', evidence: ['Escrow agreement', 'Updated model'], confidence: 0.88, timestamp: new Date().toISOString() },
  { round: 2, side: 'against', agentId: 'market', agentName: 'Market Researcher', model: 'gemini', argument: 'Market conditions argue against proceeding:\n\n1. **Timing**: 3 larger acquisitions at lower multiples (avg 6.8x).\n\n2. **Alternatives**: AWS partnership achieves 70% of objectives at 20% cost.\n\n3. **Opportunity Cost**: Prevents participation in Project Horizon.', evidence: ['M&A report', 'Partnership terms'], confidence: 0.79, timestamp: new Date().toISOString() },
]

function getBadgeVariant(model: ModelType): 'claude' | 'gpt4' | 'gemini' {
  if (model === 'gpt-4') return 'gpt4'
  return model as 'claude' | 'gemini'
}

export default function DebatePage() {
  const [stage, setStage] = useState<DebateStage>('setup')
  const [turns, setTurns] = useState<DebateTurn[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [activeTurn, setActiveTurn] = useState<'for' | 'against' | null>(null)
  const [currentContent, setCurrentContent] = useState('')
  const [verdict, setVerdict] = useState<{ winner: 'for' | 'against' | 'draw'; reasoning: string; confidence: number } | null>(null)
  const question = "Should we proceed with the acquisition of TechFlow Solutions at the proposed $52M valuation?"

  const startDebate = async () => {
    setStage('debating')
    setTurns([])
    setCurrentRound(1)
    setVerdict(null)

    for (const turn of MOCK_DEBATE_TURNS) {
      setActiveTurn(turn.side)
      setCurrentRound(turn.round)
      setCurrentContent('')

      const words = turn.argument.split(' ')
      for (const word of words) {
        setCurrentContent(prev => prev + word + ' ')
        await new Promise(resolve => setTimeout(resolve, 40))
      }

      setTurns(prev => [...prev, turn])
      setCurrentContent('')
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setStage('judging')
    setActiveTurn(null)
    await new Promise(resolve => setTimeout(resolve, 3000))

    setStage('verdict')
    setVerdict({
      winner: 'for',
      reasoning: 'While AGAINST raised legitimate concerns, FOR successfully demonstrated risks are mitigated through deal structure. Recommendation: Proceed with acquisition.',
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
    <MainLayout title="Agent Debate Arena" subtitle="AI agents argue for and against positions">
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Debate Question</p>
              <h2 className="text-xl font-semibold text-white">{question}</h2>
            </div>
            <div className="flex items-center gap-3">
              {stage === 'setup' && <Button onClick={startDebate}><Swords className="w-4 h-4" /> Start Debate</Button>}
              {stage !== 'setup' && <Button variant="secondary" onClick={resetDebate}><RotateCcw className="w-4 h-4" /> Reset</Button>}
            </div>
          </div>
          {stage !== 'setup' && (
            <div className="mt-6 flex items-center gap-6">
              <Badge variant={stage === 'debating' ? 'info' : stage === 'judging' ? 'consensus' : 'success'}>
                {stage === 'debating' && `Round ${currentRound}`}
                {stage === 'judging' && 'Judge Deliberating'}
                {stage === 'verdict' && 'Verdict Reached'}
              </Badge>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <ThumbsUp className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-emerald-700">FOR the Acquisition</span>
            </div>
            {turns.filter(t => t.side === 'for').map((turn, i) => <DebateTurnCard key={i} turn={turn} />)}
            {activeTurn === 'for' && currentContent && (
              <DebateTurnCard turn={{ ...MOCK_DEBATE_TURNS.find(t => t.round === currentRound && t.side === 'for')!, argument: currentContent }} isStreaming />
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 rounded-lg border border-red-200">
              <ThumbsDown className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-700">AGAINST the Acquisition</span>
            </div>
            {turns.filter(t => t.side === 'against').map((turn, i) => <DebateTurnCard key={i} turn={turn} />)}
            {activeTurn === 'against' && currentContent && (
              <DebateTurnCard turn={{ ...MOCK_DEBATE_TURNS.find(t => t.round === currentRound && t.side === 'against')!, argument: currentContent }} isStreaming />
            )}
          </div>
        </div>

        <AnimatePresence>
          {(stage === 'judging' || stage === 'verdict') && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-white" />
                    <h3 className="font-semibold text-white">Neutral Judge</h3>
                    <Badge variant="consensus">Claude</Badge>
                  </div>
                </div>
                <div className="p-6">
                  {stage === 'judging' && (
                    <div className="flex items-center justify-center gap-3 py-8">
                      <div className="w-3 h-3 rounded-full bg-purple-600 animate-bounce" />
                      <div className="w-3 h-3 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-3 h-3 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-3 text-gray-600">Deliberating...</span>
                    </div>
                  )}
                  {stage === 'verdict' && verdict && (
                    <div className="space-y-6">
                      <div className={cn('p-6 rounded-xl text-center', verdict.winner === 'for' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200')}>
                        <h4 className={cn('text-2xl font-bold', verdict.winner === 'for' ? 'text-emerald-700' : 'text-red-700')}>
                          {verdict.winner === 'for' ? '✓ PROCEED' : '✗ DO NOT PROCEED'}
                        </h4>
                        <p className="mt-2 text-sm text-gray-600">Confidence: {(verdict.confidence * 100).toFixed(0)}%</p>
                      </div>
                      <p className="text-gray-600">{verdict.reasoning}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  )
}

function DebateTurnCard({ turn, isStreaming }: { turn: DebateTurn; isStreaming?: boolean }) {
  const colors = {
    claude: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    'gpt-4': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    gemini: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  }
  const style = colors[turn.model]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn('rounded-xl border-2 overflow-hidden', style.bg, style.border)}>
      <div className="px-4 py-3 border-b border-opacity-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          <span className={cn('font-medium', style.text)}>{turn.agentName}</span>
        </div>
        <Badge variant={getBadgeVariant(turn.model)}>{turn.model}</Badge>
      </div>
      <div className="p-4">
        <p className={cn('text-sm text-gray-700 whitespace-pre-wrap', isStreaming && 'streaming-cursor')}>{turn.argument}</p>
      </div>
    </motion.div>
  )
}
