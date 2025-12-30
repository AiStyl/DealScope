import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Citation {
  text: string
  page?: number
  section?: string
  confidence: number
}

const INTERROGATION_SYSTEM_PROMPT = `You are a senior M&A analyst with expertise in due diligence, contract analysis, and deal structuring.
You have been given a document to analyze. Answer questions based ONLY on the document content.

Guidelines:
1. ALWAYS cite specific text from the document to support your answers
2. If the document doesn't contain information to answer the question, say so clearly
3. When quoting, use exact text in quotation marks
4. Provide section/page references when possible
5. If information is ambiguous, explain the different interpretations
6. Flag any concerning terms or clauses you notice

Response format:
{
  "answer": "Your detailed answer with inline citations",
  "citations": [
    {
      "text": "Exact quoted text from document",
      "section": "Section name if identifiable",
      "confidence": 0.0-1.0
    }
  ],
  "follow_up_questions": ["Suggested follow-up question 1", "Question 2"],
  "risk_flags": ["Any concerning items noticed while answering"]
}

Be thorough but concise. A deal team is relying on your analysis.`

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { documentId, question, conversationHistory = [] } = body

    if (!documentId || !question) {
      return NextResponse.json(
        { error: 'documentId and question are required' },
        { status: 400 }
      )
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

    // Get document text
    let documentText = document.extracted_text

    if (!documentText && document.file_path) {
      const { data: fileData } = await supabase.storage
        .from('documents')
        .download(document.file_path)

      if (fileData) {
        documentText = await fileData.text()
      }
    }

    if (!documentText) {
      return NextResponse.json(
        { error: 'No document text available for interrogation' },
        { status: 400 }
      )
    }

    // Fetch previous findings for additional context
    const { data: findings } = await supabase
      .from('findings')
      .select('title, description, severity, model')
      .eq('document_id', documentId)
      .limit(10)

    const findingsContext = findings && findings.length > 0
      ? `\n\nPreviously identified findings:\n${findings.map(f => `- [${f.severity}] ${f.title}: ${f.description}`).join('\n')}`
      : ''

    // Build conversation messages
    const messages: { role: 'user' | 'assistant'; content: string }[] = []

    // Add conversation history (limit to last 6 messages for context window)
    const recentHistory = conversationHistory.slice(-6)
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })
    }

    // Add current question with document context
    messages.push({
      role: 'user',
      content: `Document: "${document.name}"

--- DOCUMENT CONTENT START ---
${documentText.slice(0, 80000)}
--- DOCUMENT CONTENT END ---
${findingsContext}

Question: ${question}

Provide a detailed answer with citations from the document.`,
    })

    // Call Claude for analysis
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: INTERROGATION_SYSTEM_PROMPT,
      messages,
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Parse response
    let parsedResponse: {
      answer: string
      citations: Citation[]
      follow_up_questions: string[]
      risk_flags: string[]
    }

    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        // Fallback if not JSON
        parsedResponse = {
          answer: content.text,
          citations: [],
          follow_up_questions: [],
          risk_flags: [],
        }
      }
    } catch (e) {
      parsedResponse = {
        answer: content.text,
        citations: [],
        follow_up_questions: [],
        risk_flags: [],
      }
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      event_type: 'interrogation',
      action: 'question_asked',
      details: {
        document_id: documentId,
        question,
        citations_count: parsedResponse.citations?.length || 0,
        processing_time_ms: Date.now() - startTime,
      },
    })

    return NextResponse.json({
      success: true,
      response: {
        answer: parsedResponse.answer,
        citations: parsedResponse.citations || [],
        follow_up_questions: parsedResponse.follow_up_questions || [],
        risk_flags: parsedResponse.risk_flags || [],
        
        // Context for the UI
        document: {
          id: documentId,
          name: document.name,
        },
        
        // Conversation state
        conversation: {
          question,
          history_length: conversationHistory.length + 1,
          can_continue: true,
        },
        
        processing_time_ms: Date.now() - startTime,
      },
    })

  } catch (error) {
    console.error('Interrogation error:', error)
    return NextResponse.json(
      { error: 'Interrogation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint for suggested questions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const documentId = searchParams.get('documentId')

  if (!documentId) {
    return NextResponse.json({
      endpoint: '/api/interrogate',
      description: 'RAG-powered document interrogation with cited answers',
      method: 'POST',
      body: {
        documentId: 'uuid - Document to interrogate (required)',
        question: 'string - Your question (required)',
        conversationHistory: 'array - Previous messages for context (optional)',
      },
      features: [
        'Answers grounded in document content',
        'Citations with exact quoted text',
        'Conversation history for follow-up questions',
        'Automatic risk flag detection',
        'Suggested follow-up questions',
      ],
    })
  }

  // Return suggested questions for a document
  try {
    const { data: document } = await supabase
      .from('documents')
      .select('name, file_type')
      .eq('id', documentId)
      .single()

    const { data: findings } = await supabase
      .from('findings')
      .select('title, severity')
      .eq('document_id', documentId)
      .limit(5)

    // Generate suggested questions based on findings
    const findingQuestions = (findings || []).map(f => 
      `What are the details of the "${f.title}" issue?`
    )

    return NextResponse.json({
      document_id: documentId,
      document_name: document?.name,
      suggested_questions: [
        'What is the total purchase price and payment structure?',
        'What are the material closing conditions?',
        'Summarize the indemnification provisions.',
        'What are the termination rights for each party?',
        'Are there any earnout or contingent payment provisions?',
        'What representations and warranties are most extensive?',
        'What is the definition of Material Adverse Change?',
        'What regulatory approvals are required?',
        ...findingQuestions,
      ].slice(0, 10),
      findings_based_questions: findingQuestions,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}
