'use client'

import { useState, useEffect, useRef } from 'react'
import { MainLayout } from '@/components/layout'
import { Card, Button, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { ModelType } from '@/types'
import { 
  Play, 
  Pause, 
  RotateCcw,
  Brain,
  Sparkles,
  Eye,
  Lightbulb,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ThinkingStep {
  id: string
  model: ModelType
  stage: 'observing' | 'reasoning' | 'synthesizing' | 'concluding'
  thought: string
  timestamp: number
}

// Simulated thinking streams for each model
const THINKING_STREAMS: Record<ModelType, ThinkingStep[]> = {
  claude: [
    { id: 'c1', model: 'claude', stage: 'observing', thought: "I'm examining the Stock Purchase Agreement, focusing on Section 7.2 which contains the Material Adverse Change clause...", timestamp: 0 },
    { id: 'c2', model: 'claude', stage: 'observing', thought: "Interesting - this MAC clause has an unusual carve-out. Let me compare this to standard M&A language...", timestamp: 800 },
    { id: 'c3', model: 'claude', stage: 'reasoning', thought: "The pandemic exception is broader than typical. In most deals I've analyzed, pandemic carve-outs are limited to direct operational impacts, but this one extends to 'any effect resulting from' - that's very broad.", timestamp: 1600 },
    { id: 'c4', model: 'claude', stage: 'reasoning', thought: "This could significantly limit the buyer's termination rights. If another pandemic or health emergency occurs, the seller would be protected even if their business fundamentally deteriorates.", timestamp: 2400 },
    { id: 'c5', model: 'claude', stage: 'synthesizing', thought: "Cross-referencing with the indemnification section (Section 9)... The 15% cap is below market average of 20-25%. Combined with the broad MAC carve-out, buyer protection seems weak.", timestamp: 3200 },
    { id: 'c6', model: 'claude', stage: 'concluding', thought: "HIGH RISK FINDING: Non-standard MAC clause materially favors seller. Recommend negotiating narrower pandemic language or increasing indemnification cap to offset risk. Confidence: 92%", timestamp: 4000 },
  ],
  'gpt-4': [
    { id: 'g1', model: 'gpt-4', stage: 'observing', thought: "Loading financial statements... Q3 2024 shows Revenue: $42.3M, EBITDA: $5.1M, Net Income: $2.8M", timestamp: 0 },
    { id: 'g2', model: 'gpt-4', stage: 'observing', thought: "Calculating key ratios... EBITDA margin: 12.1%, comparing to industry benchmark of 15.2%", timestamp: 700 },
    { id: 'g3', model: 'gpt-4', stage: 'reasoning', thought: "At $52M purchase price with $5.1M EBITDA, implied multiple is 10.2x. This is HIGH - sector median is 7.8x for companies of similar size and growth profile.", timestamp: 1400 },
    { id: 'g4', model: 'gpt-4', stage: 'reasoning', thought: "However, target is growing at 15% YoY vs industry 8%. Premium could be justified if growth continues. Running DCF sensitivity...", timestamp: 2100 },
    { id: 'g5', model: 'gpt-4', stage: 'synthesizing', thought: "DCF with 12% WACC, 3% terminal growth yields $48.2M fair value. Current price implies 8% premium. Synergies need to exceed $3.2M annually to justify.", timestamp: 2800 },
    { id: 'g6', model: 'gpt-4', stage: 'concluding', thought: "VALUATION ASSESSMENT: Deal is priced at 8% premium to intrinsic value. Acceptable if synergy targets are achievable. Recommend sensitivity analysis on synergy assumptions. Confidence: 88%", timestamp: 3500 },
  ],
  gemini: [
    { id: 'm1', model: 'gemini', stage: 'observing', thought: "Scanning document corpus for customer-related information... Found: Customer list, Revenue breakdown, Contract summaries", timestamp: 0 },
    { id: 'm2', model: 'gemini', stage: 'observing', thought: "Extracting customer concentration data: Top 3 customers = 67% of revenue (Customer A: 28%, Customer B: 22%, Customer C: 17%)", timestamp: 600 },
    { id: 'm3', model: 'gemini', stage: 'reasoning', thought: "Searching for contract terms with major customers... ALERT: No long-term agreements found. All relationships appear to be at-will or annual renewals.", timestamp: 1200 },
    { id: 'm4', model: 'gemini', stage: 'reasoning', thought: "Cross-referencing with market data... Customer A is a Fortune 500 with procurement policy changes expected in Q2. This is a potential churn risk.", timestamp: 1800 },
    { id: 'm5', model: 'gemini', stage: 'synthesizing', thought: "Comparable analysis: Similar deals with >60% customer concentration traded at 15-20% discount. Target appears overpriced given concentration risk.", timestamp: 2400 },
    { id: 'm6', model: 'gemini', stage: 'concluding', thought: "CRITICAL RISK: 67% revenue concentration without contractual protection. Recommend customer consent as closing condition + escrow tied to retention. Confidence: 94%", timestamp: 3000 },
  ],
}

export default function StreamsPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [streams, setStreams] = useState<Record<ModelType, ThinkingStep[]>>({
    claude: [],
    'gpt-4': [],
    gemini: [],
  })
  const [elapsedTime, setElapsedTime] = useState(0)
  const [completedModels, setCompletedModels] = useState<ModelType[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const runningRef = useRef(false)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const streamModelThoughts = async (model: ModelType) => {
    const thoughts = THINKING_STREAMS[model]
    
    for (let i = 0; i < thoughts.length; i++) {
      const delay = thoughts[i].timestamp - (i > 0 ? thoughts[i-1].timestamp : 0) + Math.random() * 500
      await new Promise(resolve => setTimeout(resolve, delay))
      
      if (!runningRef.current) return
      
      setStreams(prev => ({
        ...prev,
        [model]: [...prev[model], thoughts[i]]
      }))
    }

    setCompletedModels(prev => [...prev, model])
  }

  const startStreaming = () => {
    runningRef.current = true
    setIsRunning(true)
    setStreams({ claude: [], 'gpt-4': [], gemini: [] })
    setElapsedTime(0)
    setCompletedModels([])

    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 100)
    }, 100)

    // Stream all models in parallel
    streamModelThoughts('claude')
    streamModelThoughts('gpt-4')
    streamModelThoughts('gemini')
  }

  const stopStreaming = () => {
    runningRef.current = false
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const resetStreaming = () => {
    stopStreaming()
    setStreams({ claude: [], 'gpt-4': [], gemini: [] })
    setElapsedTime(0)
    setCompletedModels([])
  }

  const stageIcons = {
    observing: <Eye className="w-4 h-4" />,
    reasoning: <Brain className="w-4 h-4" />,
    synthesizing: <Sparkles className="w-4 h-4" />,
    concluding: <Lightbulb className="w-4 h-4" />,
  }

  const stageColors = {
    observing: 'bg-blue-100 text-blue-700 border-blue-200',
    reasoning: 'bg-purple-100 text-purple-700 border-purple-200',
    synthesizing: 'bg-amber-100 text-amber-700 border-amber-200',
    concluding: 'bg-green-100 text-green-700 border-green-200',
  }

  return (
    <MainLayout 
      title="Reasoning Streams" 
      subtitle="Watch AI models think in real-time - complete transparency into the analysis process"
    >
      <div className="space-y-6">
        {/* Control Panel */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-mono text-lg font-semibold text-gray-700">
                  {(elapsedTime / 1000).toFixed(1)}s
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {completedModels.includes('claude') && (
                  <Badge variant="claude"><CheckCircle className="w-3 h-3" /> Claude</Badge>
                )}
                {completedModels.includes('gpt-4') && (
                  <Badge variant="gpt4"><CheckCircle className="w-3 h-3" /> GPT-4</Badge>
                )}
                {completedModels.includes('gemini') && (
                  <Badge variant="gemini"><CheckCircle className="w-3 h-3" /> Gemini</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isRunning ? (
                <Button onClick={startStreaming}>
                  <Play className="w-4 h-4" />
                  Start Analysis
                </Button>
              ) : (
                <Button variant="secondary" onClick={stopStreaming}>
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              )}
              <Button variant="ghost" onClick={resetStreaming}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-6">
            <span className="text-sm text-gray-500">Thinking Stages:</span>
            {Object.entries(stageIcons).map(([stage, icon]) => (
              <div key={stage} className="flex items-center gap-1.5">
                <span className={cn('p-1 rounded', stageColors[stage as keyof typeof stageColors])}>
                  {icon}
                </span>
                <span className="text-sm text-gray-600 capitalize">{stage}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Three Column Stream Display */}
        <div className="grid grid-cols-3 gap-6">
          <StreamColumn
            model="claude"
            name="Claude"
            specialty="Contract & Risk Analysis"
            thoughts={streams.claude}
            isComplete={completedModels.includes('claude')}
            isRunning={isRunning && !completedModels.includes('claude')}
            stageIcons={stageIcons}
            stageColors={stageColors}
          />
          <StreamColumn
            model="gpt-4"
            name="GPT-4"
            specialty="Financial Modeling"
            thoughts={streams['gpt-4']}
            isComplete={completedModels.includes('gpt-4')}
            isRunning={isRunning && !completedModels.includes('gpt-4')}
            stageIcons={stageIcons}
            stageColors={stageColors}
          />
          <StreamColumn
            model="gemini"
            name="Gemini"
            specialty="Document Search & Research"
            thoughts={streams.gemini}
            isComplete={completedModels.includes('gemini')}
            isRunning={isRunning && !completedModels.includes('gemini')}
            stageIcons={stageIcons}
            stageColors={stageColors}
          />
        </div>

        {/* Convergence Analysis */}
        {completedModels.length === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-white" />
                  <h3 className="font-semibold text-white">Reasoning Convergence Analysis</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-3xl font-bold text-green-600">2</p>
                    <p className="text-sm text-green-700">Findings Agreed</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-3xl font-bold text-yellow-600">1</p>
                    <p className="text-sm text-yellow-700">Unique Insight</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-3xl font-bold text-purple-600">91%</p>
                    <p className="text-sm text-purple-700">Avg Confidence</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800">All Models Agree: Customer Concentration Risk</p>
                        <p className="text-sm text-green-700 mt-1">Claude, GPT-4, and Gemini all identified the 67% customer concentration as a critical risk requiring mitigation.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">Unique Insight from Claude: MAC Clause Weakness</p>
                        <p className="text-sm text-amber-700 mt-1">Only Claude identified the non-standard pandemic carve-out in the MAC clause. This legal nuance requires specialist review.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </MainLayout>
  )
}

// Stream Column Component
function StreamColumn({
  model,
  name,
  specialty,
  thoughts,
  isComplete,
  isRunning,
  stageIcons,
  stageColors,
}: {
  model: ModelType
  name: string
  specialty: string
  thoughts: ThinkingStep[]
  isComplete: boolean
  isRunning: boolean
  stageIcons: Record<string, React.ReactNode>
  stageColors: Record<string, string>
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const modelStyles = {
    claude: { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    'gpt-4': { gradient: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    gemini: { gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  }

  const styles = modelStyles[model]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [thoughts])

  return (
    <Card className="overflow-hidden h-[600px] flex flex-col">
      <div className={cn('h-1.5 bg-gradient-to-r', styles.gradient)} />
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center', styles.gradient)}>
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <p className="text-xs text-gray-500">{specialty}</p>
          </div>
        </div>
        {isComplete && <CheckCircle className="w-5 h-5 text-green-500" />}
        {isRunning && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500">Thinking</span>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        <AnimatePresence>
          {thoughts.map((thought) => (
            <motion.div
              key={thought.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn('p-3 rounded-lg border', styles.bg, styles.border)}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('p-1 rounded', stageColors[thought.stage])}>
                  {stageIcons[thought.stage]}
                </span>
                <span className="text-xs font-medium text-gray-500 capitalize">{thought.stage}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{thought.thought}</p>
            </motion.div>
          ))}
        </AnimatePresence>

        {isRunning && (
          <div className={cn('p-3 rounded-lg border', styles.bg, styles.border)}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-gray-500">Processing...</span>
            </div>
          </div>
        )}
      </div>

      {thoughts.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>{thoughts.length} thoughts</span>
          {isComplete && <span className="text-green-600 font-medium">Complete</span>}
        </div>
      )}
    </Card>
  )
}
