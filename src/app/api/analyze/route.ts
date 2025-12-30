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

// M&A Analysis system prompt
const ANALYSIS_SYSTEM_PROMPT = `You are an expert M&A due diligence analyst. Analyze documents and identify:

1. **Risks**: MAC clauses, termination triggers, regulatory issues, legal red flags
2. **Key Clauses**: Indemnification, representations & warranties, change of control, non-compete
3. **Financial Terms**: Purchase price, earnouts, escrows, working capital adjustments
4. **Entities**: Companies, individuals, advisors mentioned
5. **Recommendations**: Areas needing further review

For each finding, assess:
- Severity: critical (deal-breaker potential), high (material), medium (notable), low (minor), info (FYI)
- Confidence: Your certainty level (0.0 to 1.0)

Be specific and cite relevant text. Focus on actionable insights for an Investment Committee.`

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { documentId, analysisType = 'general' } = body

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    // Fetch document from database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Update status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId)

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        document_id: documentId,
        models_used: ['claude'],
        status: 'running',
      })
      .select()
      .single()

    if (analysisError) {
      console.error('Analysis record error:', analysisError)
    }

    // Get document text - for now use extracted_text or fetch from storage
    let documentText = document.extracted_text

    if (!documentText && document.file_path) {
      // Download and extract text from PDF
      // For Phase 1, we'll use a simplified approach
      // In production, use pdf-parse or similar library
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .download(document.file_path)

      if (!fileError && fileData) {
        // For text files, read directly
        if (document.file_type === 'text/plain') {
          documentText = await fileData.text()
        } else {
          // For PDFs, we'd need pdf-parse - for now, use placeholder
          documentText = `[Document: ${document.name}]\n\nThis is a ${document.file_type} document. Full text extraction requires PDF parsing library.\n\nFile size: ${document.file_size} bytes`
        }
      }
    }

    if (!documentText) {
      documentText = `Document: ${document.name}\n\n[No text content available for analysis]`
    }

    // Build analysis prompt based on type
    const typeInstructions = {
      contract: 'Focus on: MAC clauses, termination rights, indemnification caps, reps & warranties, closing conditions.',
      financial: 'Focus on: Revenue trends, EBITDA, debt covenants, working capital, contingent liabilities.',
      general: 'Perform comprehensive M&A due diligence analysis.',
    }

    const userPrompt = `Analyze this document for M&A due diligence.

Document: "${document.name}"
Type: ${document.file_type}
Instructions: ${typeInstructions[analysisType as keyof typeof typeInstructions] || typeInstructions.general}

--- DOCUMENT CONTENT ---
${documentText.slice(0, 100000)}
--- END DOCUMENT ---

Respond in this exact JSON format:
{
  "findings": [
    {
      "type": "risk|clause|financial|entity|recommendation",
      "severity": "critical|high|medium|low|info",
      "title": "Brief descriptive title",
      "description": "Detailed explanation with specific references to the document",
      "page_number": null,
      "confidence": 0.85
    }
  ],
  "summary": "2-3 sentence executive summary of key findings",
  "risk_score": 65
}

Provide at least 3-5 meaningful findings. Be specific and actionable.`

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    // Extract response text
    const textBlock = response.content.find(block => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Parse JSON response
    let analysisResult
    try {
      let jsonText = textBlock.text
      // Handle markdown code blocks
      const jsonMatch = jsonText.match(/```json\n?([\s\S]*?)\n?```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1]
      }
      // Also try without json tag
      const codeMatch = jsonText.match(/```\n?([\s\S]*?)\n?```/)
      if (!jsonMatch && codeMatch) {
        jsonText = codeMatch[1]
      }
      analysisResult = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.log('Raw response:', textBlock.text)
      // Create fallback result
      analysisResult = {
        findings: [{
          type: 'info',
          severity: 'medium',
          title: 'Analysis Complete',
          description: textBlock.text.slice(0, 500),
          confidence: 0.7,
        }],
        summary: 'Analysis completed but structured parsing failed.',
        risk_score: 50,
      }
    }

    const processingTime = Date.now() - startTime

    // Save findings to database
    const findingsToSave = analysisResult.findings.map((f: any) => ({
      document_id: documentId,
      analysis_id: analysis?.id,
      type: f.type || 'risk',
      severity: f.severity || 'medium',
      title: f.title || 'Untitled',
      description: f.description || '',
      page_number: f.page_number,
      confidence: Math.min(1, Math.max(0, f.confidence || 0.5)),
      model: 'claude',
    }))

    const { data: savedFindings, error: findingsError } = await supabase
      .from('findings')
      .insert(findingsToSave)
      .select()

    if (findingsError) {
      console.error('Save findings error:', findingsError)
    }

    // Update document with results
    await supabase
      .from('documents')
      .update({
        status: 'analyzed',
        risk_score: analysisResult.risk_score,
        extracted_text: documentText.slice(0, 50000), // Store for future use
      })
      .eq('id', documentId)

    // Update analysis record
    if (analysis) {
      await supabase
        .from('analyses')
        .update({
          status: 'completed',
          consensus_score: analysisResult.risk_score / 100,
          processing_time_ms: processingTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', analysis.id)
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      event_type: 'analysis',
      action: 'complete',
      details: {
        document_id: documentId,
        analysis_id: analysis?.id,
        model: 'claude',
        findings_count: analysisResult.findings.length,
        risk_score: analysisResult.risk_score,
        processing_time_ms: processingTime,
      },
    })

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis?.id,
        document_id: documentId,
        summary: analysisResult.summary,
        risk_score: analysisResult.risk_score,
        findings_count: analysisResult.findings.length,
        processing_time_ms: processingTime,
        model: 'claude',
      },
      findings: savedFindings || findingsToSave,
    })

  } catch (error: any) {
    console.error('Analysis error:', error)
    
    // Update document status on error
    const body = await request.clone().json().catch(() => ({}))
    if (body.documentId) {
      await supabase
        .from('documents')
        .update({ status: 'error' })
        .eq('id', body.documentId)
    }

    return NextResponse.json({ 
      error: 'Analysis failed', 
      details: error.message 
    }, { status: 500 })
  }
}

// GET endpoint to fetch analysis results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    // Fetch findings for document
    const { data: findings, error } = await supabase
      .from('findings')
      .select('*')
      .eq('document_id', documentId)
      .order('severity', { ascending: true })

    if (error) {
      console.error('Fetch findings error:', error)
      return NextResponse.json({ error: 'Failed to fetch findings' }, { status: 500 })
    }

    // Fetch document details
    const { data: document } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    return NextResponse.json({
      document,
      findings,
      summary: {
        total: findings.length,
        critical: findings.filter((f: any) => f.severity === 'critical').length,
        high: findings.filter((f: any) => f.severity === 'high').length,
        medium: findings.filter((f: any) => f.severity === 'medium').length,
        low: findings.filter((f: any) => f.severity === 'low').length,
      },
    })

  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
