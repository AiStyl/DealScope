'use client'

import { cn } from '@/lib/utils'
import { Badge, Progress } from '@/components/ui'
import type { AgentResponse, ModelType } from '@/types'
import { CheckCircle, XCircle, Minus, Users, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface ConsensusBuilderProps {
  responses: AgentResponse[]
  isBuilding: boolean
  consensusReached?: boolean
  consensusScore?: number
  summary?: string
  className?: string
}

export function ConsensusBuilder({
  responses,
  isBuilding,
  consensusReached,
  consensusScore,
  summary,
  className,
}: ConsensusBuilderProps) {
  const modelColors: Record<ModelType, string> = {
    claude: '#d97706',
    'gpt-4': '#10a37f',
    gemini: '#4285f4',
  }

  // Calculate voting breakdown
  const votes = {
    agree: responses.filter(r => r.confidence >= 0.7),
    uncertain: responses.filter(r => r.confidence >= 0.5 && r.confidence < 0.7),
    disagree: responses.filter(r => r.confidence < 0.5),
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'rounded-xl border-2 overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200',
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Consensus Engine</h3>
              <p className="text-xs text-purple-200">Multi-model agreement analysis</p>
            </div>
          </div>
          <Badge variant="consensus">
            {isBuilding ? 'Building...' : consensusReached ? 'Consensus' : 'Divergent'}
          </Badge>
        </div>
      </div>

      {/* Voting Visualization */}
      <div className="p-6 space-y-6">
        {/* Model Agreement Lines */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Model Agreement
          </h4>
          
          <div className="relative">
            {/* Connection Lines SVG */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              {responses.length >= 2 && responses.map((r1, i) => 
                responses.slice(i + 1).map((r2, j) => {
                  const similarity = Math.min(r1.confidence, r2.confidence)
                  return (
                    <line
                      key={`${i}-${j}`}
                      x1={`${(i + 1) * (100 / (responses.length + 1))}%`}
                      y1="50%"
                      x2={`${(i + j + 2) * (100 / (responses.length + 1))}%`}
                      y2="50%"
                      stroke={similarity >= 0.7 ? '#22c55e' : similarity >= 0.5 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="2"
                      strokeOpacity={isBuilding ? 0.3 : 0.6}
                      strokeDasharray={isBuilding ? '5,5' : 'none'}
                      className={isBuilding ? 'animate-pulse' : ''}
                    />
                  )
                })
              )}
            </svg>

            {/* Model Nodes */}
            <div className="relative z-10 flex justify-around py-4">
              {responses.map((response, index) => (
                <motion.div
                  key={response.agentId}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-lg',
                      isBuilding && 'animate-pulse'
                    )}
                    style={{ backgroundColor: modelColors[response.model] }}
                  >
                    {(response.confidence * 100).toFixed(0)}%
                  </div>
                  <span className="text-xs font-medium text-gray-600">{response.model}</span>
                  <div className="flex items-center gap-1">
                    {response.confidence >= 0.7 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : response.confidence >= 0.5 ? (
                      <Minus className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Voting Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
            <div className="text-2xl font-bold text-green-600">{votes.agree.length}</div>
            <div className="text-xs text-green-600 font-medium">High Confidence</div>
            <div className="mt-2 flex justify-center gap-1">
              {votes.agree.map(v => (
                <div
                  key={v.agentId}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: modelColors[v.model] }}
                />
              ))}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{votes.uncertain.length}</div>
            <div className="text-xs text-yellow-600 font-medium">Uncertain</div>
            <div className="mt-2 flex justify-center gap-1">
              {votes.uncertain.map(v => (
                <div
                  key={v.agentId}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: modelColors[v.model] }}
                />
              ))}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
            <div className="text-2xl font-bold text-red-600">{votes.disagree.length}</div>
            <div className="text-xs text-red-600 font-medium">Low Confidence</div>
            <div className="mt-2 flex justify-center gap-1">
              {votes.disagree.map(v => (
                <div
                  key={v.agentId}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: modelColors[v.model] }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Consensus Score */}
        {consensusScore !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Overall Consensus</span>
              <span className={cn(
                'text-lg font-bold',
                consensusScore >= 0.8 ? 'text-green-600' : 
                consensusScore >= 0.6 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {(consensusScore * 100).toFixed(0)}%
              </span>
            </div>
            <Progress
              value={consensusScore * 100}
              variant={consensusScore >= 0.8 ? 'success' : consensusScore >= 0.6 ? 'warning' : 'danger'}
              size="lg"
            />
          </div>
        )}

        {/* Summary */}
        {summary && !isBuilding && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 border border-purple-200"
          >
            <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Synthesized Conclusion
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </motion.div>
        )}

        {/* Building Animation */}
        {isBuilding && (
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="text-sm font-medium ml-2">Building consensus...</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
