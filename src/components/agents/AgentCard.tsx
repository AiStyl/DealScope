'use client'

import { cn } from '@/lib/utils'
import { Badge, Progress, Spinner } from '@/components/ui'
import type { ModelType } from '@/types'
import { Brain, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AgentCardProps {
  name: string
  role: string
  model: ModelType
  status: 'idle' | 'thinking' | 'responding' | 'complete' | 'error'
  content?: string
  confidence?: number
  tokens?: number
  latencyMs?: number
  className?: string
}

function getBadgeVariant(model: ModelType): 'claude' | 'gpt4' | 'gemini' {
  if (model === 'gpt-4') return 'gpt4'
  return model as 'claude' | 'gemini'
}

export function AgentCard({ name, role, model, status, content, confidence, tokens, latencyMs, className }: AgentCardProps) {
  const modelColors = {
    claude: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'bg-amber-500' },
    'gpt-4': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'bg-emerald-500' },
    gemini: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'bg-blue-500' },
  }
  const colors = modelColors[model]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl border-2 overflow-hidden transition-all duration-300', colors.bg, colors.border, className)}
    >
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.accent)}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={cn('font-semibold', colors.text)}>{name}</h3>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getBadgeVariant(model)}>{model.toUpperCase()}</Badge>
            {status === 'thinking' && <Spinner size="sm" />}
            {status === 'complete' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          </div>
        </div>
      </div>
      <div className="p-4">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-400 text-sm italic">
              Waiting to analyze...
            </motion.div>
          )}
          {status === 'thinking' && (
            <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Analyzing document...</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded-full w-full animate-pulse" />
                <div className="h-3 bg-gray-200 rounded-full w-4/5 animate-pulse" />
              </div>
            </motion.div>
          )}
          {(status === 'responding' || status === 'complete') && content && (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className={cn('text-sm leading-relaxed whitespace-pre-wrap', status === 'responding' && 'streaming-cursor')}>
                {content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {(status === 'complete' || status === 'responding') && (
        <div className="px-4 py-3 bg-white/50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            {confidence !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Confidence:</span>
                <div className="w-24"><Progress value={confidence * 100} size="sm" /></div>
                <span className="font-medium">{(confidence * 100).toFixed(0)}%</span>
              </div>
            )}
            <div className="flex items-center gap-4 text-gray-400">
              {tokens && <span>{tokens.toLocaleString()} tokens</span>}
              {latencyMs && <span>{(latencyMs / 1000).toFixed(1)}s</span>}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
