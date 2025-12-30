import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

interface DebateRound {
  round: number
  for_argument: {
    model: string
    argument: string
    key_points: string[]
    evidence_cited: string[]
    timestamp: string
  }
  against_argument: {
    model: string
    argument: string
    key_points: string[]
    evidence_cited: string[]
    timestamp: string
  }
}

interface DebateVerdict {
  winner: 'FOR' | 'AGAINST' | 'TIE'
  confidence: number
  reasoning: string
  key_factors: string[]
  recommendation: string
  judge_model: string
}

// Claude argues FOR the position
async function claudeArguesFor(
  topic: string,
  context: string,
  previousArguments: string = ''
): Promise<{ argument: string; key_points: string[]; evidence_cited: string[] }> {
  const systemPrompt = `You are a senior M&A partner at a top law firm. You must argue IN FAVOR of the following position.
Your argument should be:
- Evidence-based (cite specific clauses, figures, precedents)
- Structured and logical
- Acknowledge counterarguments but explain why the position still holds
- Professional tone suitable for an investment committee

${previousArguments ? `The opposing counsel has argued:\n${previousArguments}\n\nYou must directly address their points while maintaining your position.` : ''}

Respond in JSON format:
{
  "argument": "Your full argument (2-3 paragraphs)",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "evidence_cited": ["Specific evidence or clause referenced"]
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Topic to debate: "${topic}"\n\nContext/Document:\n${context.slice(0, 30000)}`
    }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  
  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    // Fallback if JSON parsing fails
  }
  
  return {
    argument: content.text,
    key_points: [],
    evidence_cited: [],
  }
}

// GPT-4 argues AGAINST the position - it SEES Claude's argument
async function gpt4ArguesAgainst(
  topic: string,
  context: string,
  forArgument: string,
  previousRebuttals: string = ''
): Promise<{ argument: string; key_points: string[]; evidence_cited: string[] }> {
  const systemPrompt = `You are a senior M&A partner at a rival law firm. You must argue AGAINST the following position.
Your argument should be:
- Evidence-based (cite specific clauses, figures, precedents)
- Directly address and rebut the opposing counsel's arguments
- Find weaknesses in their logic or evidence
- Professional tone suitable for an investment committee

${previousRebuttals ? `You previously argued:\n${previousRebuttals}\n\nBuild on your previous points and address new arguments.` : ''}

Respond in JSON format:
{
  "argument": "Your full rebuttal (2-3 paragraphs)",
  "key_points": ["Rebuttal 1", "Rebuttal 2", "Rebuttal 3"],
  "evidence_cited": ["Specific evidence or clause referenced"]
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Topic: "${topic}"\n\nContext:\n${context.slice(0, 30000)}\n\n---\n\nOpposing counsel (arguing FOR) states:\n${forArgument}\n\nProvide your rebuttal arguing AGAINST.`
      },
    ],
    max_tokens: 2048,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from GPT-4')
  
  return JSON.parse(content)
}

// Gemini judges the debate
async function geminiJudges(
  topic: string,
  context: string,
  debateRounds: DebateRound[]
): Promise<DebateVerdict> {
  const debateTranscript = debateRounds.map(round => `
## Round ${round.round}

### FOR (${round.for_argument.model}):
${round.for_argument.argument}
Key points: ${round.for_argument.key_points.join(', ')}

### AGAINST (${round.against_argument.model}):
${round.against_argument.argument}
Key points: ${round.against_argument.key_points.join(', ')}
`).join('\n---\n')

  const prompt = `You are a neutral arbitrator evaluating an M&A debate. You must determine which side presented the stronger argument.

TOPIC: "${topic}"

DOCUMENT CONTEXT (abbreviated):
${context.slice(0, 15000)}

---

DEBATE TRANSCRIPT:
${debateTranscript}

---

Evaluate based on:
1. Quality of evidence cited
2. Logical consistency
3. Relevance to M&A best practices
4. Strength of rebuttals
5. Practical implications for the deal

Respond in JSON format:
{
  "winner": "FOR" or "AGAINST" or "TIE",
  "confidence": 0.0 to 1.0,
  "reasoning": "2-3 paragraph explanation of your decision",
  "key_factors": ["Factor 1", "Factor 2", "Factor 3"],
  "recommendation": "What should the deal team do based on this debate?"
}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    }
  )

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error('No response from Gemini')

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      return {
        ...result,
        judge_model: 'Gemini',
      }
    }
  } catch (e) {
    // Fallback
  }

  return {
    winner: 'TIE',
    confidence: 0.5,
    reasoning: content,
    key_factors: [],
    recommendation: 'Review the debate transcript manually.',
    judge_model: 'Gemini',
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { topic, documentId, context, rounds = 2 } = body

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 })
    }

    // Get context from document if provided
    let debateContext = context || ''
    
    if (documentId && !debateContext) {
      const { data: document } = await supabase
        .from('documents')
        .select('extracted_text, name')
        .eq('id', documentId)
        .single()
      
      if (document?.extracted_text) {
        debateContext = document.extracted_text
      }
    }

    if (!debateContext) {
      debateContext = 'No specific document context provided. Debate based on general M&A principles.'
    }

    const debateRounds: DebateRound[] = []
    let lastForArgument = ''
    let lastAgainstArgument = ''

    // Run the debate rounds - THIS IS SEQUENTIAL, NOT PARALLEL
    // Each model SEES and RESPONDS to the other's argument
    for (let i = 1; i <= Math.min(rounds, 3); i++) {
      console.log(`Starting debate round ${i}...`)
      
      // Claude argues FOR
      const forResult = await claudeArguesFor(
        topic,
        debateContext,
        lastAgainstArgument
      )
      
      // GPT-4 argues AGAINST - it SEES Claude's argument
      const againstResult = await gpt4ArguesAgainst(
        topic,
        debateContext,
        forResult.argument,
        lastAgainstArgument
      )

      debateRounds.push({
        round: i,
        for_argument: {
          model: 'Claude',
          argument: forResult.argument,
          key_points: forResult.key_points || [],
          evidence_cited: forResult.evidence_cited || [],
          timestamp: new Date().toISOString(),
        },
        against_argument: {
          model: 'GPT-4',
          argument: againstResult.argument,
          key_points: againstResult.key_points || [],
          evidence_cited: againstResult.evidence_cited || [],
          timestamp: new Date().toISOString(),
        },
      })

      lastForArgument = forResult.argument
      lastAgainstArgument = againstResult.argument
    }

    // Gemini judges the full debate
    console.log('Gemini is judging the debate...')
    const verdict = await geminiJudges(topic, debateContext, debateRounds)

    // Log audit event
    await supabase.from('audit_logs').insert({
      event_type: 'debate',
      action: 'agent_debate',
      details: {
        topic,
        document_id: documentId,
        rounds: debateRounds.length,
        winner: verdict.winner,
        confidence: verdict.confidence,
        processing_time_ms: Date.now() - startTime,
      },
    })

    return NextResponse.json({
      success: true,
      debate: {
        topic,
        document_id: documentId,
        
        // The debate format
        format: {
          for_model: 'Claude',
          against_model: 'GPT-4',
          judge_model: 'Gemini',
          total_rounds: debateRounds.length,
        },
        
        // Full debate transcript
        rounds: debateRounds,
        
        // Verdict from Gemini
        verdict: {
          winner: verdict.winner,
          confidence: verdict.confidence,
          reasoning: verdict.reasoning,
          key_factors: verdict.key_factors,
          recommendation: verdict.recommendation,
        },
        
        // Why this matters
        implications: {
          if_for_wins: 'The position is likely defensible. Proceed with current structure.',
          if_against_wins: 'The position has material weaknesses. Consider renegotiation or additional protections.',
          if_tie: 'Arguments are balanced. Escalate to senior stakeholders for final decision.',
        },
        
        processing_time_ms: Date.now() - startTime,
      },
    })

  } catch (error) {
    console.error('Debate error:', error)
    return NextResponse.json(
      { error: 'Debate failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint for quick debate without document
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const topic = searchParams.get('topic')

  if (!topic) {
    return NextResponse.json({
      endpoint: '/api/debate',
      description: 'Adversarial AI debate - Claude argues FOR, GPT-4 argues AGAINST, Gemini judges',
      method: 'POST',
      body: {
        topic: 'string - The position to debate (required)',
        documentId: 'uuid - Document for context (optional)',
        context: 'string - Direct context text (optional)',
        rounds: 'number - Debate rounds 1-3 (default: 2)',
      },
      example_topics: [
        'The MAC clause exclusions adequately protect the buyer',
        'The indemnification cap at 10% is sufficient for this deal size',
        'Cross-industry M&A risks outweigh the potential synergies',
        'The asymmetric breakup fee structure is unfair to the seller',
        'Earnout provisions should be included to bridge valuation gap',
      ],
      differentiators: [
        'Sequential, not parallel - models see and respond to each other',
        'Real adversarial debate, not scripted responses',
        'Independent judge evaluates argument quality',
        'Applicable to any M&A decision point',
      ],
    })
  }

  // Quick single-round debate
  try {
    const forResult = await claudeArguesFor(topic, 'General M&A context')
    const againstResult = await gpt4ArguesAgainst(topic, 'General M&A context', forResult.argument)

    return NextResponse.json({
      topic,
      quick_debate: {
        for: { model: 'Claude', argument: forResult.argument, key_points: forResult.key_points },
        against: { model: 'GPT-4', argument: againstResult.argument, key_points: againstResult.key_points },
      },
      note: 'This is a quick single-round debate. Use POST for full multi-round debate with judging.',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Quick debate failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
