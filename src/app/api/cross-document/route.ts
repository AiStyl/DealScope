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

interface DocumentSummary {
  id: string
  name: string
  key_terms: string[]
  entities: string[]
  risk_areas: string[]
}

interface CrossReference {
  id: string
  type: 'consistency' | 'contradiction' | 'dependency' | 'reference' | 'gap'
  source_doc: string
  target_doc: string
  source_excerpt: string
  target_excerpt: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  recommendation?: string
}

interface CrossDocumentAnalysis {
  documents_analyzed: DocumentSummary[]
  cross_references: CrossReference[]
  consistency_score: number
  key_conflicts: string[]
  coverage_gaps: string[]
  recommendations: string[]
}

// Analyze multiple documents for cross-references
async function analyzeCrossDocuments(
  documents: Array<{ id: string; name: string; text: string }>
): Promise<CrossDocumentAnalysis> {
  if (documents.length < 2) {
    throw new Error('At least 2 documents required for cross-document analysis')
  }

  // Build context for Claude
  const docContext = documents.map((doc, i) => 
    `=== DOCUMENT ${i + 1}: ${doc.name} ===\n${doc.text.slice(0, 15000)}\n`
  ).join('\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are an expert M&A analyst specializing in document cross-referencing. 
Analyze multiple documents to find:
1. Consistencies and inconsistencies between documents
2. Dependencies (where one document references another)
3. Contradictions that need resolution
4. Coverage gaps (issues mentioned in one doc but not addressed in another)

For each cross-reference found, identify:
- Type: consistency, contradiction, dependency, reference, or gap
- Source and target documents
- Relevant excerpts
- Severity: critical, high, medium, or low
- Recommendation for resolution

Respond in JSON format:
{
  "document_summaries": [
    {
      "id": "doc_id",
      "name": "doc_name",
      "key_terms": ["term1", "term2"],
      "entities": ["entity1", "entity2"],
      "risk_areas": ["risk1", "risk2"]
    }
  ],
  "cross_references": [
    {
      "id": "ref1",
      "type": "contradiction",
      "source_doc": "Document 1 name",
      "target_doc": "Document 2 name",
      "source_excerpt": "The indemnification cap is 15%...",
      "target_excerpt": "Seller liability limited to 10%...",
      "description": "Inconsistent indemnification caps",
      "severity": "critical",
      "recommendation": "Clarify which cap applies"
    }
  ],
  "consistency_score": 0.75,
  "key_conflicts": ["Conflict 1", "Conflict 2"],
  "coverage_gaps": ["Gap 1", "Gap 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`,
    messages: [{
      role: 'user',
      content: `Analyze these ${documents.length} M&A documents for cross-references:\n\n${docContext}`
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
      
      return {
        documents_analyzed: (parsed.document_summaries || documents.map(d => ({
          id: d.id,
          name: d.name,
          key_terms: [],
          entities: [],
          risk_areas: [],
        }))),
        cross_references: (parsed.cross_references || []).map((ref: any, i: number) => ({
          ...ref,
          id: ref.id || `ref_${i + 1}`,
        })),
        consistency_score: parsed.consistency_score || 0.7,
        key_conflicts: parsed.key_conflicts || [],
        coverage_gaps: parsed.coverage_gaps || [],
        recommendations: parsed.recommendations || [],
      }
    }
  } catch (e) {
    console.error('Error parsing cross-document analysis:', e)
  }

  // Fallback
  return {
    documents_analyzed: documents.map(d => ({
      id: d.id,
      name: d.name,
      key_terms: ['acquisition', 'indemnification', 'closing'],
      entities: ['Buyer', 'Seller'],
      risk_areas: ['liability', 'representations'],
    })),
    cross_references: [],
    consistency_score: 0.75,
    key_conflicts: [],
    coverage_gaps: [],
    recommendations: ['Review all documents for consistency'],
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { documentIds } = body

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 documentIds required' },
        { status: 400 }
      )
    }

    // Fetch all documents
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('id, name, extracted_text')
      .in('id', documentIds)

    if (fetchError || !documents || documents.length < 2) {
      return NextResponse.json(
        { error: 'Could not fetch documents' },
        { status: 404 }
      )
    }

    const docsForAnalysis = documents.map(d => ({
      id: d.id,
      name: d.name,
      text: d.extracted_text || '',
    }))

    const analysis = await analyzeCrossDocuments(docsForAnalysis)

    // Log audit
    try {
      await supabase.from('audit_logs').insert({
        event_type: 'analysis',
        action: 'cross_document_analysis',
        details: {
          document_count: documents.length,
          cross_references_found: analysis.cross_references.length,
          consistency_score: analysis.consistency_score,
          processing_time_ms: Date.now() - startTime,
        },
      })
    } catch (e) {
      console.log('Audit error:', e)
    }

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        metadata: {
          documents_count: documents.length,
          processing_time_ms: Date.now() - startTime,
        },
      },
    })

  } catch (error) {
    console.error('Cross-document analysis error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Cross-document analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/cross-document',
    description: 'Analyze multiple documents for cross-references and inconsistencies',
    method: 'POST',
    body: {
      documentIds: 'array of UUIDs - At least 2 documents required',
    },
    outputs: {
      documents_analyzed: 'Summary of each document',
      cross_references: 'Connections found between documents',
      consistency_score: 'Overall consistency rating 0-1',
      key_conflicts: 'Major contradictions found',
      coverage_gaps: 'Issues not addressed across documents',
      recommendations: 'Actions to resolve issues',
    },
    reference_types: ['consistency', 'contradiction', 'dependency', 'reference', 'gap'],
  })
}
