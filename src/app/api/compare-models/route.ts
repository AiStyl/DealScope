import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

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

interface ModelResponse {
  model: string
  provider: string
  response: string
  key_points: string[]
  confidence: number
  processing_time_ms: number
  tokens_used?: number
  error?: string
}

// Call Claude
async function callClaude(prompt: string, context: string): Promise<ModelResponse> {
  const startTime = Date.now()
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are an M&A expert. Analyze the question and provide:
1. A clear, concise response (2-3 paragraphs max)
2. 3-5 key points as bullet items
3. Your confidence level (0-1)

Respond in JSON format:
{
  "response": "Your analysis...",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "confidence": 0.85
}`,
      messages: [{
        role: 'user',
        content: `Context: ${context.slice(0, 10000)}\n\nQuestion: ${prompt}`
      }],
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response')

    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          model: 'Claude',
          provider: 'Anthropic',
          response: parsed.response || content.text,
          key_points: parsed.key_points || [],
          confidence: parsed.confidence || 0.7,
          processing_time_ms: Date.now() - startTime,
        }
      }
    } catch (e) {}

    return {
      model: 'Claude',
      provider: 'Anthropic',
      response: content.text,
      key_points: [],
      confidence: 0.7,
      processing_time_ms: Date.now() - startTime,
    }
  } catch (error) {
    console.error('Claude error:', error)
    return {
      model: 'Claude',
      provider: 'Anthropic',
      response: '',
      key_points: [],
      confidence: 0,
      processing_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Call GPT-4
async function callGPT4(prompt: string, context: string): Promise<ModelResponse> {
  const startTime = Date.now()
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: `You are an M&A expert. Analyze the question and provide:
1. A clear, concise response (2-3 paragraphs max)
2. 3-5 key points as bullet items
3. Your confidence level (0-1)

Respond in JSON format:
{
  "response": "Your analysis...",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "confidence": 0.85
}`
        },
        {
          role: 'user',
          content: `Context: ${context.slice(0, 10000)}\n\nQuestion: ${prompt}`
        }
      ],
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from GPT-4')

    const parsed = JSON.parse(content)
    return {
      model: 'GPT-4',
      provider: 'OpenAI',
      response: parsed.response || content,
      key_points: parsed.key_points || [],
      confidence: parsed.confidence || 0.7,
      processing_time_ms: Date.now() - startTime,
      tokens_used: response.usage?.total_tokens,
    }
  } catch (error) {
    console.error('GPT-4 error:', error)
    return {
      model: 'GPT-4',
      provider: 'OpenAI',
      response: '',
      key_points: [],
      confidence: 0,
      processing_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Call Gemini - FIXED with better error handling
async function callGemini(prompt: string, context: string): Promise<ModelResponse> {
  const startTime = Date.now()
  
  // Check if API key exists
  if (!process.env.GOOGLE_AI_API_KEY) {
    return {
      model: 'Gemini',
      provider: 'Google',
      response: 'Gemini API key not configured. Please add GOOGLE_AI_API_KEY to environment variables.',
      key_points: ['API key missing'],
      confidence: 0,
      processing_time_ms: Date.now() - startTime,
      error: 'GOOGLE_AI_API_KEY not configured',
    }
  }
  
  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: `You are an M&A expert. Analyze this question and provide:
1. A clear, concise response (2-3 paragraphs max)
2. 3-5 key points as bullet items
3. Your confidence level (0-1)

Context: ${context.slice(0, 8000)}

Question: ${prompt}

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{"response": "Your analysis here", "key_points": ["Point 1", "Point 2", "Point 3"], "confidence": 0.85}`
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error response:', errorText)
      throw new Error(`Gemini API returned ${response.status}: ${errorText.slice(0, 200)}`)
    }

    const data = await response.json()
    
    // Check for API errors in response
    if (data.error) {
      throw new Error(data.error.message || 'Gemini API error')
    }

    // Extract content from response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!content) {
      console.error('Gemini response structure:', JSON.stringify(data, null, 2).slice(0, 500))
      throw new Error('No content in Gemini response')
    }

    // Try to parse JSON from response
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7)
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3)
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3)
      }
      cleanContent = cleanContent.trim()

      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          model: 'Gemini',
          provider: 'Google',
          response: parsed.response || content,
          key_points: Array.isArray(parsed.key_points) ? parsed.key_points : [],
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
          processing_time_ms: Date.now() - startTime,
        }
      }
    } catch (parseError) {
      console.error('Error parsing Gemini JSON:', parseError)
    }

    // Fallback: return raw text if JSON parsing fails
    return {
      model: 'Gemini',
      provider: 'Google',
      response: content,
      key_points: [],
      confidence: 0.7,
      processing_time_ms: Date.now() - startTime,
    }
  } catch (error) {
    console.error('Gemini error:', error)
    return {
      model: 'Gemini',
      provider: 'Google',
      response: '',
      key_points: [],
      confidence: 0,
      processing_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { prompt, documentId, context } = body

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    // Get context
    let analysisContext = context || ''
    
    if (documentId && !analysisContext) {
      const { data: document } = await supabase
        .from('documents')
        .select('extracted_text, name')
        .eq('id', documentId)
        .single()
      
      if (document?.extracted_text) {
        analysisContext = document.extracted_text
      }
    }

    if (!analysisContext) {
      analysisContext = 'General M&A context. Analyze based on industry best practices and standard deal structures.'
    }

    // Call all 3 models in parallel
    const [claudeResult, gpt4Result, geminiResult] = await Promise.all([
      callClaude(prompt, analysisContext),
      callGPT4(prompt, analysisContext),
      callGemini(prompt, analysisContext),
    ])

    // Filter out errored results for metrics calculation
    const validResults = [claudeResult, gpt4Result, geminiResult].filter(r => !r.error && r.confidence > 0)
    
    // Calculate agreement metrics
    const confidences = validResults.map(r => r.confidence)
    const avgConfidence = confidences.length > 0 
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
      : 0
    const stdDev = confidences.length > 1
      ? Math.sqrt(confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) / confidences.length)
      : 0

    // Log audit
    try {
      await supabase.from('audit_logs').insert({
        event_type: 'analysis',
        action: 'model_comparison',
        details: {
          prompt,
          document_id: documentId,
          models_responded: validResults.length,
          avg_confidence: avgConfidence,
          agreement_score: 1 - stdDev,
          processing_time_ms: Date.now() - startTime,
        },
      })
    } catch (e) {
      console.log('Audit error:', e)
    }

    return NextResponse.json({
      success: true,
      comparison: {
        prompt,
        
        models: [claudeResult, gpt4Result, geminiResult],
        
        metrics: {
          models_responded: validResults.length,
          average_confidence: Math.round(avgConfidence * 100) / 100,
          agreement_score: Math.round((1 - stdDev) * 100) / 100,
          total_processing_time_ms: Date.now() - startTime,
          fastest_model: validResults.length > 0
            ? validResults.sort((a, b) => a.processing_time_ms - b.processing_time_ms)[0].model
            : 'N/A',
          highest_confidence: validResults.length > 0
            ? validResults.sort((a, b) => b.confidence - a.confidence)[0].model
            : 'N/A',
        },
      },
    })

  } catch (error) {
    console.error('Comparison error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Model comparison failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/compare-models',
    description: 'Compare responses from Claude, GPT-4, and Gemini side-by-side',
    method: 'POST',
    body: {
      prompt: 'string - Question to ask all models (required)',
      documentId: 'uuid - Document for context (optional)',
      context: 'string - Direct context text (optional)',
    },
    outputs: {
      models: 'Array of responses from each model (includes error field if failed)',
      metrics: 'Agreement score, confidence levels, processing times',
    },
    note: 'Gemini requires GOOGLE_AI_API_KEY environment variable',
  })
}
