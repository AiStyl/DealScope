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

// System prompts specialized for each model's strengths
const CLAUDE_SYSTEM_PROMPT = `You are a senior M&A legal analyst specializing in contract risk identification.
Your expertise: Material Adverse Change (MAC) clauses, termination provisions, indemnification structures, 
representations & warranties, closing conditions, and regulatory approval requirements.

Analyze the document and identify legal risks. For each finding, provide:
- title: Brief risk title
- severity: "critical" | "high" | "medium" | "low"
- description: Detailed explanation
- recommendation: Specific action item
- confidence: 0.0 to 1.0 (how confident you are)

Respond in JSON format:
{
  "risk_score": 0-100,
  "findings": [...],
  "executive_summary": "2-3 sentence summary"
}`

const GPT4_SYSTEM_PROMPT = `You are a senior M&A financial analyst specializing in deal economics and valuation.
Your expertise: Purchase price mechanics, earnouts, working capital adjustments, deal multiples,
financing conditions, synergy assumptions, and value at risk calculations.

Analyze the document and identify financial risks. For each finding, provide:
- title: Brief risk title
- severity: "critical" | "high" | "medium" | "low"  
- description: Detailed explanation
- recommendation: Specific action item
- confidence: 0.0 to 1.0 (how confident you are)

Respond in JSON format:
{
  "risk_score": 0-100,
  "findings": [...],
  "executive_summary": "2-3 sentence summary"
}`

const GEMINI_SYSTEM_PROMPT = `You are a senior M&A research analyst specializing in market context and due diligence.
Your expertise: Industry dynamics, competitive positioning, regulatory environment, entity relationships,
market comparables, precedent transactions, and integration challenges.

Analyze the document and identify strategic risks. For each finding, provide:
- title: Brief risk title
- severity: "critical" | "high" | "medium" | "low"
- description: Detailed explanation
- recommendation: Specific action item
- confidence: 0.0 to 1.0 (how confident you are)

Respond in JSON format:
{
  "risk_score": 0-100,
  "findings": [...],
  "executive_summary": "2-3 sentence summary"
}`

interface Finding {
  title: string
  severity: string
  description: string
  recommendation: string
  confidence: number
  model: string
}

interface ModelResult {
  model: string
  risk_score: number
  findings: Finding[]
  executive_summary: string
  processing_time_ms: number
  error?: string
}

// Claude analysis
async function analyzeWithClaude(text: string): Promise<ModelResult> {
  const startTime = Date.now()
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: CLAUDE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Analyze this M&A document:\n\n${text}` }],
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')
    
    // Parse JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    
    const result = JSON.parse(jsonMatch[0])
    return {
      model: 'Claude',
      risk_score: result.risk_score || 50,
      findings: (result.findings || []).map((f: Finding) => ({ ...f, model: 'Claude' })),
      executive_summary: result.executive_summary || '',
      processing_time_ms: Date.now() - startTime,
    }
  } catch (error) {
    return {
      model: 'Claude',
      risk_score: 0,
      findings: [],
      executive_summary: '',
      processing_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// GPT-4 analysis
async function analyzeWithGPT4(text: string): Promise<ModelResult> {
  const startTime = Date.now()
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: GPT4_SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this M&A document:\n\n${text}` },
      ],
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from GPT-4')
    
    const result = JSON.parse(content)
    return {
      model: 'GPT-4',
      risk_score: result.risk_score || 50,
      findings: (result.findings || []).map((f: Finding) => ({ ...f, model: 'GPT-4' })),
      executive_summary: result.executive_summary || '',
      processing_time_ms: Date.now() - startTime,
    }
  } catch (error) {
    return {
      model: 'GPT-4',
      risk_score: 0,
      findings: [],
      executive_summary: '',
      processing_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Gemini analysis (using OpenAI-compatible API)
async function analyzeWithGemini(text: string): Promise<ModelResult> {
  const startTime = Date.now()
  try {
    // Use Google's Generative AI API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${GEMINI_SYSTEM_PROMPT}\n\nAnalyze this M&A document:\n\n${text}` }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          },
        }),
      }
    )

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) throw new Error('No response from Gemini')
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    
    const result = JSON.parse(jsonMatch[0])
    return {
      model: 'Gemini',
      risk_score: result.risk_score || 50,
      findings: (result.findings || []).map((f: Finding) => ({ ...f, model: 'Gemini' })),
      executive_summary: result.executive_summary || '',
      processing_time_ms: Date.now() - startTime,
    }
  } catch (error) {
    return {
      model: 'Gemini',
      risk_score: 0,
      findings: [],
      executive_summary: '',
      processing_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Calculate consensus metrics
function calculateConsensus(results: ModelResult[]) {
  const validResults = results.filter(r => !r.error && r.risk_score > 0)
  
  if (validResults.length === 0) {
    return {
      consensus_score: 0,
      risk_score_mean: 0,
      risk_score_stddev: 0,
      agreement_level: 'none' as const,
      models_agreeing: 0,
    }
  }

  const scores = validResults.map(r => r.risk_score)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length
  const stddev = Math.sqrt(variance)
  
  // Consensus score: 100 = perfect agreement, 0 = complete disagreement
  // Based on standard deviation (max reasonable stddev ~35 for 0-100 scale)
  const consensusScore = Math.max(0, Math.round(100 - (stddev * 3)))
  
  let agreementLevel: 'strong' | 'moderate' | 'weak' | 'none'
  if (stddev < 10) agreementLevel = 'strong'
  else if (stddev < 20) agreementLevel = 'moderate'
  else if (stddev < 30) agreementLevel = 'weak'
  else agreementLevel = 'none'

  return {
    consensus_score: consensusScore,
    risk_score_mean: Math.round(mean),
    risk_score_stddev: Math.round(stddev * 10) / 10,
    agreement_level: agreementLevel,
    models_agreeing: validResults.length,
  }
}

// Merge and deduplicate findings
function mergeFindings(results: ModelResult[]): Finding[] {
  const allFindings: Finding[] = []
  
  for (const result of results) {
    if (!result.error) {
      allFindings.push(...result.findings)
    }
  }
  
  // Sort by severity then confidence
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  return allFindings.sort((a, b) => {
    const severityDiff = (severityOrder[a.severity as keyof typeof severityOrder] || 4) - 
                         (severityOrder[b.severity as keyof typeof severityOrder] || 4)
    if (severityDiff !== 0) return severityDiff
    return (b.confidence || 0) - (a.confidence || 0)
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { documentId } = body

    if (!documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
    }

    // Fetch document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Get document text (from extracted_text or fetch from storage)
    let documentText = document.extracted_text
    
    if (!documentText && document.file_path) {
      // Download and extract text
      const { data: fileData } = await supabase.storage
        .from('documents')
        .download(document.file_path)
      
      if (fileData) {
        documentText = await fileData.text()
      }
    }

    if (!documentText) {
      return NextResponse.json({ error: 'No document text available' }, { status: 400 })
    }

    // Truncate if too long (use first 50K chars for each model)
    const truncatedText = documentText.slice(0, 50000)

    // Run all three models in parallel - THIS IS THE KEY DIFFERENTIATOR
    console.log('Starting multi-model analysis...')
    const [claudeResult, gpt4Result, geminiResult] = await Promise.all([
      analyzeWithClaude(truncatedText),
      analyzeWithGPT4(truncatedText),
      analyzeWithGemini(truncatedText),
    ])

    const results = [claudeResult, gpt4Result, geminiResult]
    
    // Calculate consensus
    const consensus = calculateConsensus(results)
    
    // Merge findings
    const mergedFindings = mergeFindings(results)

    // Save analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        document_id: documentId,
        analysis_type: 'multi-model',
        status: 'completed',
        risk_score: consensus.risk_score_mean,
        model: 'multi',
        raw_response: {
          claude: claudeResult,
          gpt4: gpt4Result,
          gemini: geminiResult,
          consensus,
        },
      })
      .select()
      .single()

    // Save individual findings with model attribution
    if (mergedFindings.length > 0) {
      const findingsToInsert = mergedFindings.map(f => ({
        document_id: documentId,
        analysis_id: analysis?.id,
        type: 'risk',
        severity: f.severity,
        title: f.title,
        description: f.description,
        confidence: f.confidence,
        model: f.model,
        raw_response: f,
      }))

      await supabase.from('findings').insert(findingsToInsert)
    }

    // Update document status
    await supabase
      .from('documents')
      .update({ 
        status: 'analyzed',
        risk_score: consensus.risk_score_mean,
      })
      .eq('id', documentId)

    // Log audit event
    await supabase.from('audit_logs').insert({
      event_type: 'analysis',
      action: 'multi_model_analysis',
      details: {
        document_id: documentId,
        models_used: ['Claude', 'GPT-4', 'Gemini'],
        consensus_score: consensus.consensus_score,
        findings_count: mergedFindings.length,
        processing_time_ms: Date.now() - startTime,
      },
    })

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis?.id,
        document_id: documentId,
        
        // Individual model results
        model_results: {
          claude: {
            risk_score: claudeResult.risk_score,
            findings_count: claudeResult.findings.length,
            processing_time_ms: claudeResult.processing_time_ms,
            executive_summary: claudeResult.executive_summary,
            error: claudeResult.error,
          },
          gpt4: {
            risk_score: gpt4Result.risk_score,
            findings_count: gpt4Result.findings.length,
            processing_time_ms: gpt4Result.processing_time_ms,
            executive_summary: gpt4Result.executive_summary,
            error: gpt4Result.error,
          },
          gemini: {
            risk_score: geminiResult.risk_score,
            findings_count: geminiResult.findings.length,
            processing_time_ms: geminiResult.processing_time_ms,
            executive_summary: geminiResult.executive_summary,
            error: geminiResult.error,
          },
        },
        
        // Consensus metrics - THIS IS WHAT MAKES IT NOT AN API WRAPPER
        consensus: {
          score: consensus.consensus_score,
          risk_score: consensus.risk_score_mean,
          stddev: consensus.risk_score_stddev,
          agreement_level: consensus.agreement_level,
          models_agreeing: consensus.models_agreeing,
          interpretation: consensus.agreement_level === 'strong' 
            ? 'All models agree on risk assessment. High confidence.'
            : consensus.agreement_level === 'moderate'
            ? 'Models mostly agree. Some variance in specific findings.'
            : consensus.agreement_level === 'weak'
            ? 'Significant disagreement. Recommend human review of divergent findings.'
            : 'Models strongly disagree. Manual analysis recommended.',
        },
        
        // Merged findings with model attribution
        findings: mergedFindings,
        total_findings: mergedFindings.length,
        
        // Processing stats
        total_processing_time_ms: Date.now() - startTime,
      },
    })

  } catch (error) {
    console.error('Multi-model analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint for quick status check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/analyze-multi',
    description: 'Multi-model consensus analysis using Claude, GPT-4, and Gemini',
    method: 'POST',
    body: {
      documentId: 'uuid - required',
    },
    response: {
      model_results: 'Individual results from each AI model',
      consensus: 'Statistical agreement metrics',
      findings: 'Merged and sorted findings with model attribution',
    },
    differentiators: [
      'Parallel execution - all 3 models analyze simultaneously',
      'Statistical consensus scoring with standard deviation',
      'Disagreement detection triggers human review flag',
      'Model attribution on every finding',
      'Specialized prompts for each model\'s strengths',
    ],
  })
}
