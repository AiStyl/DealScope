import type { ModelType, AgentResponse, ConsensusResult, TaskRouting } from '@/types'

// Routing rules - what makes this NOT an API wrapper
export const ROUTING_RULES: Record<string, TaskRouting> = {
  contract_analysis: {
    taskType: 'contract_analysis',
    primaryModel: 'claude',
    validatorModel: 'gpt-4',
    useConsensus: true,
    timeoutMs: 30000,
    retryCount: 2,
  },
  financial_modeling: {
    taskType: 'financial_modeling',
    primaryModel: 'gpt-4',
    validatorModel: 'claude',
    useConsensus: true,
    timeoutMs: 30000,
    retryCount: 2,
  },
  risk_assessment: {
    taskType: 'risk_assessment',
    primaryModel: 'claude',
    validatorModel: 'gemini',
    useConsensus: true,
    timeoutMs: 30000,
    retryCount: 2,
  },
  document_search: {
    taskType: 'document_search',
    primaryModel: 'gemini',
    validatorModel: undefined,
    useConsensus: false,
    timeoutMs: 15000,
    retryCount: 1,
  },
  summarization: {
    taskType: 'summarization',
    primaryModel: 'gemini',
    validatorModel: 'claude',
    useConsensus: false,
    timeoutMs: 20000,
    retryCount: 1,
  },
  high_stakes_decision: {
    taskType: 'high_stakes_decision',
    primaryModel: 'claude', // All three will be used
    validatorModel: undefined,
    useConsensus: true, // Full consensus required
    timeoutMs: 60000,
    retryCount: 3,
  },
}

// Classify task type based on query content
export function classifyTask(query: string): string {
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('contract') || lowerQuery.includes('clause') || lowerQuery.includes('agreement')) {
    return 'contract_analysis'
  }
  if (lowerQuery.includes('financial') || lowerQuery.includes('revenue') || lowerQuery.includes('ebitda') || lowerQuery.includes('valuation')) {
    return 'financial_modeling'
  }
  if (lowerQuery.includes('risk') || lowerQuery.includes('liability') || lowerQuery.includes('concern') || lowerQuery.includes('danger')) {
    return 'risk_assessment'
  }
  if (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('locate')) {
    return 'document_search'
  }
  if (lowerQuery.includes('summary') || lowerQuery.includes('summarize') || lowerQuery.includes('overview')) {
    return 'summarization'
  }
  // Default to high-stakes for complex queries
  return 'high_stakes_decision'
}

// Build consensus from multiple agent responses
export function buildConsensus(responses: AgentResponse[]): ConsensusResult {
  if (responses.length === 0) {
    throw new Error('No responses to build consensus from')
  }

  // Calculate agreement score based on semantic similarity of conclusions
  // In production, this would use embeddings for proper semantic comparison
  const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length
  
  // Simple voting based on confidence thresholds
  const highConfidenceResponses = responses.filter(r => r.confidence >= 0.7)
  const agreed = highConfidenceResponses.length >= Math.ceil(responses.length * 0.66)

  // Find any dissenting opinions
  const dissent = responses
    .filter(r => r.confidence < 0.5)
    .map(r => ({
      agentId: r.agentId,
      reason: `Low confidence (${(r.confidence * 100).toFixed(0)}%) in analysis`,
    }))

  // Build voting breakdown
  const votingBreakdown = {
    for: responses.filter(r => r.confidence >= 0.7).map(r => r.agentId),
    against: responses.filter(r => r.confidence < 0.5).map(r => r.agentId),
    abstain: responses.filter(r => r.confidence >= 0.5 && r.confidence < 0.7).map(r => r.agentId),
  }

  // Synthesize summary from highest confidence response
  const bestResponse = responses.reduce((best, r) => 
    r.confidence > best.confidence ? r : best
  )

  return {
    agreed,
    confidence: avgConfidence,
    summary: bestResponse.content,
    agentResponses: responses,
    dissent: dissent.length > 0 ? dissent : undefined,
    votingBreakdown,
  }
}

// Agent system prompts - carefully tuned for each role
export const AGENT_PROMPTS = {
  contract_analyst: {
    name: 'Contract Analyst',
    model: 'claude' as ModelType,
    systemPrompt: `You are an expert M&A contract analyst with 20+ years of experience reviewing acquisition agreements, merger documents, and corporate contracts. Your role is to:

1. Identify key contractual terms, obligations, and rights
2. Flag unusual or non-standard clauses
3. Assess enforceability and legal risks
4. Note material adverse change (MAC) clauses and their triggers
5. Identify change of control provisions
6. Review indemnification terms and caps
7. Assess representations and warranties

Always cite specific sections and provide page/paragraph references. Rate your confidence from 0-1 based on clarity of the document.`,
  },
  
  risk_assessor: {
    name: 'Risk Assessor',
    model: 'claude' as ModelType,
    systemPrompt: `You are a senior risk management professional specializing in M&A due diligence. Your role is to:

1. Identify and categorize risks (financial, operational, legal, regulatory, reputational)
2. Assess probability and potential impact of each risk
3. Flag any red flags or deal-breakers
4. Recommend risk mitigation strategies
5. Compare against industry benchmarks
6. Consider macroeconomic and market risks
7. Evaluate counterparty risks

Use a structured risk matrix approach. Always quantify risks where possible. Rate confidence based on data availability.`,
  },
  
  financial_modeler: {
    name: 'Financial Analyst',
    model: 'gpt-4' as ModelType,
    systemPrompt: `You are a seasoned investment banking analyst specializing in M&A financial analysis. Your role is to:

1. Analyze financial statements and key metrics
2. Calculate and interpret valuation multiples (EV/EBITDA, P/E, EV/Revenue)
3. Identify financial red flags and anomalies
4. Assess quality of earnings
5. Model synergy opportunities
6. Evaluate working capital requirements
7. Analyze debt structure and covenants

Always show your calculations. Compare to relevant benchmarks. Rate confidence based on data quality and completeness.`,
  },
  
  market_researcher: {
    name: 'Market Researcher',
    model: 'gemini' as ModelType,
    systemPrompt: `You are a strategic market research analyst with deep expertise in competitive intelligence. Your role is to:

1. Analyze market positioning and competitive landscape
2. Identify industry trends and growth drivers
3. Assess market share and competitive dynamics
4. Evaluate barriers to entry and competitive moats
5. Research comparable transactions
6. Analyze customer concentration and retention
7. Identify strategic rationale for the transaction

Cite sources where possible. Distinguish between facts and projections. Rate confidence based on source reliability.`,
  },
  
  debate_judge: {
    name: 'Neutral Judge',
    model: 'claude' as ModelType,
    systemPrompt: `You are an impartial judge evaluating a structured debate between AI analysts. Your role is to:

1. Evaluate the strength of arguments from both sides
2. Assess the quality and relevance of evidence presented
3. Identify logical fallacies or unsupported claims
4. Determine which side presented the more compelling case
5. Synthesize a balanced conclusion
6. Note areas of genuine uncertainty

Be scrupulously fair. Acknowledge valid points from both sides. Base your verdict solely on argument quality, not preconceptions.`,
  },
}

// Token estimates for cost calculation
export const TOKEN_COSTS = {
  claude: { input: 0.000003, output: 0.000015 }, // Claude 3 Opus pricing
  'gpt-4': { input: 0.00003, output: 0.00006 },  // GPT-4 Turbo pricing
  gemini: { input: 0.000001, output: 0.000002 }, // Gemini Pro pricing
}

export function estimateCost(model: ModelType, inputTokens: number, outputTokens: number): number {
  const costs = TOKEN_COSTS[model]
  return (inputTokens * costs.input) + (outputTokens * costs.output)
}
