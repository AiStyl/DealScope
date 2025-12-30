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

interface ChecklistItem {
  id: string
  category: string
  item: string
  description: string
  status: 'not_started' | 'in_progress' | 'complete' | 'flagged'
  priority: 'critical' | 'high' | 'medium' | 'low'
  ai_assessment?: string
  documents_needed: string[]
  responsible_party?: string
}

interface DealChecklist {
  deal_type: string
  items: ChecklistItem[]
  completion_percentage: number
  critical_items_remaining: number
  ai_recommendations: string[]
}

// Standard M&A due diligence categories
const DD_CATEGORIES = {
  legal: [
    { item: 'Corporate Structure Review', description: 'Verify legal entity structure, subsidiaries, and ownership' },
    { item: 'Material Contracts Analysis', description: 'Review all contracts >$100K and change of control provisions' },
    { item: 'Litigation Assessment', description: 'Pending, threatened, or potential litigation review' },
    { item: 'IP Rights Verification', description: 'Patents, trademarks, copyrights ownership and validity' },
    { item: 'Regulatory Compliance', description: 'Industry-specific regulatory requirements and licenses' },
  ],
  financial: [
    { item: 'Historical Financials (3yr)', description: 'Audited financial statements analysis' },
    { item: 'Working Capital Analysis', description: 'Current assets, liabilities, and normalized working capital' },
    { item: 'Revenue Quality Assessment', description: 'Revenue recognition, customer concentration, recurring revenue' },
    { item: 'Debt & Liabilities Review', description: 'All debt instruments, off-balance sheet items, contingencies' },
    { item: 'Tax Compliance Review', description: 'Federal, state, local tax filings and exposures' },
  ],
  operational: [
    { item: 'Customer Analysis', description: 'Top customers, contracts, churn rates, satisfaction' },
    { item: 'Supplier Dependencies', description: 'Key suppliers, single-source risks, contract terms' },
    { item: 'Technology Assessment', description: 'Systems, infrastructure, technical debt, scalability' },
    { item: 'HR & Key Personnel', description: 'Organization structure, key employees, retention risks' },
    { item: 'Real Estate & Facilities', description: 'Owned/leased properties, lease terms, condition' },
  ],
  commercial: [
    { item: 'Market Position Analysis', description: 'Competitive landscape, market share, trends' },
    { item: 'Growth Strategy Review', description: 'Pipeline, expansion plans, new products' },
    { item: 'Synergy Identification', description: 'Cost and revenue synergy opportunities' },
    { item: 'Integration Planning', description: 'Day 1 readiness, 100-day plan, risks' },
  ],
}

// Generate AI assessment for checklist items based on documents
async function generateAIAssessment(
  documentText: string,
  items: ChecklistItem[]
): Promise<ChecklistItem[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are an M&A due diligence expert. Based on the provided document, assess the status of due diligence checklist items.

For each item that can be assessed from the document, provide:
1. Status: complete (if fully addressed), in_progress (if partially addressed), flagged (if issues found), not_started (if not mentioned)
2. A brief assessment (1-2 sentences)

Respond in JSON format:
{
  "assessments": [
    {
      "item": "Item name",
      "status": "complete|in_progress|flagged|not_started",
      "assessment": "Brief assessment..."
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`,
    messages: [{
      role: 'user',
      content: `Document:\n${documentText.slice(0, 30000)}\n\nChecklist items to assess:\n${items.map(i => `- ${i.item}: ${i.description}`).join('\n')}`
    }],
  })

  const content = response.content[0]
  if (content.type !== 'text') return items

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      const assessments = parsed.assessments || []
      
      return items.map(item => {
        const assessment = assessments.find((a: any) => 
          a.item.toLowerCase().includes(item.item.toLowerCase().slice(0, 20)) ||
          item.item.toLowerCase().includes(a.item.toLowerCase().slice(0, 20))
        )
        
        if (assessment) {
          return {
            ...item,
            status: assessment.status || item.status,
            ai_assessment: assessment.assessment,
          }
        }
        return item
      })
    }
  } catch (e) {
    console.error('Error parsing AI assessment:', e)
  }

  return items
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { documentId, deal_type = 'acquisition', custom_items } = body

    // Build checklist items
    let items: ChecklistItem[] = []
    let itemId = 1

    for (const [category, categoryItems] of Object.entries(DD_CATEGORIES)) {
      for (const item of categoryItems) {
        items.push({
          id: `item_${itemId++}`,
          category,
          item: item.item,
          description: item.description,
          status: 'not_started',
          priority: category === 'legal' || category === 'financial' ? 'critical' : 'high',
          documents_needed: [],
        })
      }
    }

    // Add custom items if provided
    if (custom_items && Array.isArray(custom_items)) {
      for (const customItem of custom_items) {
        items.push({
          id: `item_${itemId++}`,
          category: customItem.category || 'custom',
          item: customItem.item,
          description: customItem.description || '',
          status: 'not_started',
          priority: customItem.priority || 'medium',
          documents_needed: customItem.documents_needed || [],
        })
      }
    }

    // If document provided, get AI assessment
    if (documentId) {
      const { data: document } = await supabase
        .from('documents')
        .select('extracted_text')
        .eq('id', documentId)
        .single()

      if (document?.extracted_text) {
        items = await generateAIAssessment(document.extracted_text, items)
      }
    }

    // Calculate metrics
    const completedItems = items.filter(i => i.status === 'complete').length
    const criticalRemaining = items.filter(i => i.priority === 'critical' && i.status !== 'complete').length
    const flaggedItems = items.filter(i => i.status === 'flagged')

    // Generate recommendations
    const recommendations: string[] = []
    if (criticalRemaining > 0) {
      recommendations.push(`${criticalRemaining} critical items require attention before closing`)
    }
    if (flaggedItems.length > 0) {
      recommendations.push(`${flaggedItems.length} items flagged for review: ${flaggedItems.map(i => i.item).slice(0, 3).join(', ')}`)
    }
    const notStarted = items.filter(i => i.status === 'not_started')
    if (notStarted.length > items.length * 0.5) {
      recommendations.push('More than 50% of checklist items not yet started - accelerate document collection')
    }

    // Log audit
    try {
      await supabase.from('audit_logs').insert({
        event_type: 'analysis',
        action: 'deal_checklist_generation',
        details: {
          document_id: documentId,
          total_items: items.length,
          completed: completedItems,
          flagged: flaggedItems.length,
          processing_time_ms: Date.now() - startTime,
        },
      })
    } catch (e) {
      console.log('Audit error:', e)
    }

    return NextResponse.json({
      success: true,
      checklist: {
        deal_type,
        items,
        completion_percentage: Math.round((completedItems / items.length) * 100),
        critical_items_remaining: criticalRemaining,
        flagged_items: flaggedItems.length,
        ai_recommendations: recommendations,
        categories: Object.keys(DD_CATEGORIES),
        processing_time_ms: Date.now() - startTime,
      },
    })

  } catch (error) {
    console.error('Checklist error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Checklist generation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/deal-checklist',
    description: 'Generate AI-powered due diligence checklist',
    method: 'POST',
    body: {
      documentId: 'uuid - Document to analyze (optional)',
      deal_type: 'string - Type of deal (default: acquisition)',
      custom_items: 'array - Additional checklist items (optional)',
    },
    outputs: {
      items: 'Complete due diligence checklist with AI assessments',
      completion_percentage: 'Overall progress',
      critical_items_remaining: 'Count of critical items not complete',
      ai_recommendations: 'Priority actions suggested by AI',
    },
    categories: Object.keys(DD_CATEGORIES),
  })
}
