'use client'

import { cn } from '@/lib/utils'

interface ModelBadgeProps {
  model: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

// Model color schemes
const MODEL_STYLES = {
  claude: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: 'C',
    label: 'Claude',
    company: 'Anthropic',
  },
  'gpt-4': {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: 'G4',
    label: 'GPT-4',
    company: 'OpenAI',
  },
  gemini: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: 'Ge',
    label: 'Gemini',
    company: 'Google',
  },
  Claude: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: 'C',
    label: 'Claude',
    company: 'Anthropic',
  },
  'GPT-4': {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: 'G4',
    label: 'GPT-4',
    company: 'OpenAI',
  },
  Gemini: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: 'Ge',
    label: 'Gemini',
    company: 'Google',
  },
} as const

const SIZE_STYLES = {
  sm: {
    badge: 'w-5 h-5 text-[8px]',
    label: 'text-[10px]',
  },
  md: {
    badge: 'w-6 h-6 text-[10px]',
    label: 'text-xs',
  },
  lg: {
    badge: 'w-8 h-8 text-xs',
    label: 'text-sm',
  },
}

export function ModelBadge({ model, size = 'md', showLabel = false, className }: ModelBadgeProps) {
  const normalizedModel = model.toLowerCase()
  const style = MODEL_STYLES[model as keyof typeof MODEL_STYLES] || 
                MODEL_STYLES[normalizedModel as keyof typeof MODEL_STYLES] ||
                { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: '?', label: model, company: '' }
  
  const sizeStyle = SIZE_STYLES[size]

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-bold border',
          style.bg,
          style.text,
          style.border,
          sizeStyle.badge
        )}
        title={`${style.label} (${style.company})`}
      >
        {style.icon}
      </div>
      {showLabel && (
        <span className={cn(style.text, sizeStyle.label, 'font-medium')}>
          {style.label}
        </span>
      )}
    </div>
  )
}

// Multiple badges in a row
interface ModelBadgeGroupProps {
  models: string[]
  size?: 'sm' | 'md' | 'lg'
  max?: number
  className?: string
}

export function ModelBadgeGroup({ models, size = 'md', max = 3, className }: ModelBadgeGroupProps) {
  const displayModels = models.slice(0, max)
  const remaining = models.length - max

  return (
    <div className={cn('flex items-center -space-x-1', className)}>
      {displayModels.map((model, i) => (
        <ModelBadge 
          key={`${model}-${i}`} 
          model={model} 
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div className={cn(
          'rounded-full flex items-center justify-center font-bold bg-gray-100 text-gray-600 border border-gray-200 ring-2 ring-white',
          SIZE_STYLES[size].badge
        )}>
          +{remaining}
        </div>
      )}
    </div>
  )
}

// Consensus indicator with all 3 models
interface ConsensusIndicatorProps {
  claudeScore?: number
  gpt4Score?: number
  geminiScore?: number
  consensusScore: number
  agreementLevel: 'strong' | 'moderate' | 'weak' | 'none'
  className?: string
}

export function ConsensusIndicator({
  claudeScore,
  gpt4Score,
  geminiScore,
  consensusScore,
  agreementLevel,
  className,
}: ConsensusIndicatorProps) {
  const agreementColors = {
    strong: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    moderate: 'text-amber-600 bg-amber-50 border-amber-200',
    weak: 'text-orange-600 bg-orange-50 border-orange-200',
    none: 'text-red-600 bg-red-50 border-red-200',
  }

  return (
    <div className={cn('p-4 rounded-xl border', agreementColors[agreementLevel], className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Model Consensus</span>
        <span className="text-lg font-bold">{consensusScore}%</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        {claudeScore !== undefined && (
          <div className="p-2 bg-white/50 rounded-lg">
            <ModelBadge model="claude" size="sm" className="justify-center mb-1" />
            <div className="text-xs font-semibold">{claudeScore}</div>
          </div>
        )}
        {gpt4Score !== undefined && (
          <div className="p-2 bg-white/50 rounded-lg">
            <ModelBadge model="gpt-4" size="sm" className="justify-center mb-1" />
            <div className="text-xs font-semibold">{gpt4Score}</div>
          </div>
        )}
        {geminiScore !== undefined && (
          <div className="p-2 bg-white/50 rounded-lg">
            <ModelBadge model="gemini" size="sm" className="justify-center mb-1" />
            <div className="text-xs font-semibold">{geminiScore}</div>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-center capitalize">
        {agreementLevel} Agreement
      </div>
    </div>
  )
}

export default ModelBadge
