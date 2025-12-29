import { NextRequest, NextResponse } from 'next/server'
import { classifyTask, ROUTING_RULES, buildConsensus, AGENT_PROMPTS } from '@/lib/ai/orchestrator'
import type { AgentResponse, ModelType } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, requireConsensus = true } = body

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Step 1: Classify the task
    const taskType = classifyTask(query)
    const routingRule = ROUTING_RULES[taskType] || ROUTING_RULES.high_stakes_decision

    // Step 2: Determine which models to use
    const modelsToUse: ModelType[] = []
    
    if (routingRule.useConsensus || requireConsensus) {
      modelsToUse.push('claude', 'gpt-4', 'gemini')
    } else {
      modelsToUse.push(routingRule.primaryModel)
      if (routingRule.validatorModel) {
        modelsToUse.push(routingRule.validatorModel)
      }
    }

    // Step 3: Run analysis with selected models
    const startTime = Date.now()
    const responses: AgentResponse[] = await Promise.all(
      modelsToUse.map(model => runModelAnalysis(model, query, taskType))
    )
    const totalTime = Date.now() - startTime

    // Step 4: Build consensus
    const result = responses.length > 1 
      ? buildConsensus(responses)
      : { agreed: true, confidence: responses[0].confidence, summary: responses[0].content, agentResponses: responses }

    return NextResponse.json({
      success: true,
      taskType,
      routing: routingRule,
      result,
      metadata: { modelsUsed: modelsToUse, totalTimeMs: totalTime }
    })

  } catch (error) {
    console.error('[Orchestrator] Error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

async function runModelAnalysis(model: ModelType, query: string, taskType: string): Promise<AgentResponse> {
  const startTime = Date.now()
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500))

  const responses: Record<ModelType, { content: string; confidence: number }> = {
    claude: {
      content: `Based on my analysis of the ${taskType.replace(/_/g, ' ')}:\n\n1. **Primary Finding**: Standard provisions with notable exceptions.\n2. **Risk Areas**: Potential concerns in liability sections.\n3. **Recommendation**: Further review recommended.`,
      confidence: 0.88 + Math.random() * 0.1,
    },
    'gpt-4': {
      content: `Financial Analysis:\n\n**Valuation**: EV/EBITDA 8.2x (vs. 7.5x industry)\n**DCF Value**: $48.2M\n**Recommendation**: Proceed with price negotiation.`,
      confidence: 0.85 + Math.random() * 0.1,
    },
    gemini: {
      content: `Search Results:\n\n**Found**: 12 relevant passages.\n**Key Data**: Customer concentration in Q3 report.\n**Recommendation**: Review flagged sections.`,
      confidence: 0.91 + Math.random() * 0.08,
    },
  }

  return {
    agentId: `${model}_agent`,
    agentName: model === 'claude' ? 'Contract Analyst' : model === 'gpt-4' ? 'Financial Analyst' : 'Market Researcher',
    model,
    content: responses[model].content,
    confidence: responses[model].confidence,
    tokens: 350 + Math.floor(Math.random() * 200),
    latencyMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  }
}
