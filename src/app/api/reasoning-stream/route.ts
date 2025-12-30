import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface ReasoningStep {
  step_number: number
  phase: 'observation' | 'analysis' | 'hypothesis' | 'verification' | 'conclusion'
  thought: string
  confidence: number
  evidence?: string[]
  timestamp: string
}

interface ReasoningResult {
  query: string
  model: string
  reasoning_chain: ReasoningStep[]
  final_answer: string
  total_steps: number
  reasoning_depth: 'shallow' | 'moderate' | 'deep'
  confidence_trajectory: number[]
}

// Generate detailed reasoning chain using Claude
async function generateReasoningChain(
  query: string,
  context: string
): Promise<ReasoningResult> {
  const systemPrompt = `You are an expert M&A analyst. When analyzing questions, you must show your complete reasoning process step by step.

For each reasoning step, provide:
1. The phase: observation, analysis, hypothesis, verification, or conclusion
2. Your thought at this step
3. Your confidence level (0-1)
4. Any evidence supporting this step

Structure your response as JSON:
{
  "reasoning_chain": [
    {
      "step_number": 1,
      "phase": "observation",
      "thought": "First, I notice that...",
      "confidence": 0.6,
      "evidence": ["Evidence 1", "Evidence 2"]
    }
  ],
  "final_answer": "Based on my analysis...",
  "reasoning_depth": "deep"
}

Show at least 5-8 reasoning steps that demonstrate your analytical process.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Query: ${query}\n\nContext:\n${context.slice(0, 30000)}`
    }],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      const chain = parsed.reasoning_chain || []
      
      // Add timestamps
      const now = Date.now()
      chain.forEach((step: ReasoningStep, i: number) => {
        step.timestamp = new Date(now + i * 2000).toISOString()
      })

      return {
        query,
        model: 'Claude',
        reasoning_chain: chain,
        final_answer: parsed.final_answer || 'Analysis complete',
        total_steps: chain.length,
        reasoning_depth: parsed.reasoning_depth || 'moderate',
        confidence_trajectory: chain.map((s: ReasoningStep) => s.confidence),
      }
    }
  } catch (e) {
    console.error('Error parsing reasoning chain:', e)
  }

  // Fallback
  return {
    query,
    model: 'Claude',
    reasoning_chain: [
      {
        step_number: 1,
        phase: 'observation',
        thought: 'Analyzing the provided context and query...',
        confidence: 0.5,
        timestamp: new Date().toISOString(),
      },
      {
        step_number: 2,
        phase: 'analysis',
        thought: 'Identifying key factors relevant to the question...',
        confidence: 0.6,
        timestamp: new Date(Date.now() + 2000).toISOString(),
      },
      {
        step_number: 3,
        phase: 'conclusion',
        thought: content.text.slice(0, 500),
        confidence: 0.7,
        timestamp: new Date(Date.now() + 4000).toISOString(),
      },
    ],
    final_answer: content.text,
    total_steps: 3,
    reasoning_depth: 'shallow',
    confidence_trajectory: [0.5, 0.6, 0.7],
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { query, documentId, context } = body

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 })
    }

    // Get context from document if provided
    let analysisContext = context || ''
    
    if (documentId && !analysisContext) {
      const { data: document } = await supabase
        .from('documents')
        .select('extracted_text, name')
        .eq('id', documentId)
        .single()
      
      if (document?.extracted_text) {
        analysisContext = `Document: ${document.name}\n\n${document.extracted_text}`
      }
    }

    if (!analysisContext) {
      analysisContext = 'General M&A context. Analyze based on industry best practices.'
    }

    const result = await generateReasoningChain(query, analysisContext)

    // Log audit
    try {
      await supabase.from('audit_logs').insert({
        event_type: 'analysis',
        action: 'reasoning_stream',
        details: {
          query,
          document_id: documentId,
          total_steps: result.total_steps,
          reasoning_depth: result.reasoning_depth,
          processing_time_ms: Date.now() - startTime,
        },
      })
    } catch (e) {
      console.log('Audit error:', e)
    }

    return NextResponse.json({
      success: true,
      reasoning: {
        ...result,
        metadata: {
          processing_time_ms: Date.now() - startTime,
          document_id: documentId,
        },
      },
    })

  } catch (error) {
    console.error('Reasoning stream error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Reasoning stream failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/reasoning-stream',
    description: 'Generate step-by-step reasoning chain for M&A analysis',
    method: 'POST',
    body: {
      query: 'string - The question to analyze (required)',
      documentId: 'uuid - Document for context (optional)',
      context: 'string - Direct context text (optional)',
    },
    outputs: {
      reasoning_chain: 'Array of reasoning steps with phase, thought, confidence',
      final_answer: 'Synthesized conclusion',
      confidence_trajectory: 'Confidence levels through the reasoning process',
    },
    phases: ['observation', 'analysis', 'hypothesis', 'verification', 'conclusion'],
  })
}
