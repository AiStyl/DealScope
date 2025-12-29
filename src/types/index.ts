// Agent types
export type ModelType = 'claude' | 'gpt-4' | 'gemini'

export interface Agent {
  id: string
  name: string
  role: string
  model: ModelType
  avatar?: string
  color: string
  systemPrompt: string
  isActive: boolean
}

export interface AgentResponse {
  agentId: string
  agentName: string
  model: ModelType
  content: string
  confidence: number
  reasoning?: string
  evidence?: string[]
  tokens: number
  latencyMs: number
  timestamp: string
}

// Analysis types
export interface AnalysisRequest {
  dealId: string
  documentId?: string
  query: string
  agents: string[]
  requireConsensus: boolean
}

export interface ConsensusResult {
  agreed: boolean
  confidence: number
  summary: string
  agentResponses: AgentResponse[]
  dissent?: {
    agentId: string
    reason: string
  }[]
  votingBreakdown: {
    for: string[]
    against: string[]
    abstain: string[]
  }
}

// Streaming types
export interface StreamChunk {
  type: 'start' | 'token' | 'complete' | 'error'
  agentId: string
  content?: string
  metadata?: {
    tokens?: number
    latencyMs?: number
    confidence?: number
  }
}

// Debate types
export interface DebateTurn {
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

export interface DebateResult {
  question: string
  turns: DebateTurn[]
  verdict: {
    winner: 'for' | 'against' | 'draw'
    reasoning: string
    confidence: number
    judge: string
  }
  metadata: {
    totalTokens: number
    durationMs: number
    modelsUsed: ModelType[]
  }
}

// Finding types
export interface Finding {
  id: string
  type: 'risk' | 'opportunity' | 'anomaly' | 'insight' | 'contract_clause'
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
  evidence?: string
  confidence: number
  consensusScore?: number
  modelsAgreed?: ModelType[]
  source: {
    documentId?: string
    documentName?: string
    pageNumber?: number
    excerpt?: string
  }
  timestamp: string
}

// Dashboard types
export interface DealMetrics {
  totalDeals: number
  activeDeals: number
  completedDeals: number
  totalFindings: number
  criticalRisks: number
  avgConfidence: number
  documentsProcessed: number
  analysisRuns: number
}

export interface DealSummary {
  id: string
  name: string
  companyName: string
  dealType: string
  status: string
  targetValue?: number
  currency: string
  riskScore: number
  findingsCount: number
  lastActivity: string
  progress: number
}

// Orchestration types
export interface TaskRouting {
  taskType: string
  primaryModel: ModelType
  validatorModel?: ModelType
  useConsensus: boolean
  timeoutMs: number
  retryCount: number
}

export interface OrchestrationMetrics {
  totalRequests: number
  avgLatencyMs: number
  consensusRate: number
  modelUsage: {
    model: ModelType
    requests: number
    tokens: number
    avgLatency: number
  }[]
  costEstimate: number
}

// Real-time types
export interface RealtimeMessage {
  type: 'agent_start' | 'agent_thinking' | 'agent_response' | 'consensus_building' | 'complete'
  timestamp: string
  data: unknown
}

export interface ThinkingState {
  agentId: string
  stage: 'analyzing' | 'reasoning' | 'synthesizing' | 'validating'
  progress: number
  currentThought?: string
}
