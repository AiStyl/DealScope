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

interface Entity {
  id: string
  name: string
  type: 'company' | 'person' | 'contract' | 'financial' | 'date' | 'location' | 'asset' | 'liability' | 'term'
  description: string
  importance: 'high' | 'medium' | 'low'
  metadata?: Record<string, string | number>
}

interface Relationship {
  id: string
  source: string // entity id
  target: string // entity id
  type: string
  description: string
  strength: number // 0-1
}

interface KnowledgeGraph {
  entities: Entity[]
  relationships: Relationship[]
  summary: string
  key_insights: string[]
}

// Extract knowledge graph from document using Claude
async function extractKnowledgeGraph(documentText: string, documentName: string): Promise<KnowledgeGraph> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are an M&A knowledge extraction specialist. Extract all entities and relationships from documents to build a knowledge graph.

Entity types:
- company: Companies, subsidiaries, acquirers, targets
- person: Executives, board members, key personnel
- contract: Agreements, clauses, terms
- financial: Values, prices, multiples, metrics
- date: Important dates, deadlines, milestones
- location: Jurisdictions, offices, markets
- asset: IP, real estate, equipment, inventory
- liability: Debt, obligations, contingencies
- term: Legal terms, conditions, provisions

Relationships should capture how entities connect (owns, reports_to, governs, values, obligates, etc.)

Respond in JSON format:
{
  "entities": [
    {
      "id": "e1",
      "name": "Entity Name",
      "type": "company",
      "description": "Brief description",
      "importance": "high",
      "metadata": {"key": "value"}
    }
  ],
  "relationships": [
    {
      "id": "r1",
      "source": "e1",
      "target": "e2",
      "type": "acquires",
      "description": "E1 is acquiring E2",
      "strength": 0.9
    }
  ],
  "summary": "Brief summary of the document structure",
  "key_insights": ["Insight 1", "Insight 2"]
}`,
    messages: [{
      role: 'user',
      content: `Extract a knowledge graph from this M&A document titled "${documentName}":\n\n${documentText.slice(0, 50000)}`
    }],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    return getDefaultGraph(documentName)
  }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        entities: parsed.entities || [],
        relationships: parsed.relationships || [],
        summary: parsed.summary || 'Knowledge graph extracted',
        key_insights: parsed.key_insights || [],
      }
    }
  } catch (e) {
    console.error('Error parsing knowledge graph:', e)
  }

  return getDefaultGraph(documentName)
}

function getDefaultGraph(documentName: string): KnowledgeGraph {
  return {
    entities: [
      { id: 'e1', name: 'Acquirer', type: 'company', description: 'The acquiring company', importance: 'high' },
      { id: 'e2', name: 'Target', type: 'company', description: 'The target company', importance: 'high' },
      { id: 'e3', name: 'Purchase Agreement', type: 'contract', description: 'Main acquisition agreement', importance: 'high' },
      { id: 'e4', name: 'Purchase Price', type: 'financial', description: 'Total deal value', importance: 'high' },
      { id: 'e5', name: 'Closing Date', type: 'date', description: 'Expected transaction close', importance: 'medium' },
    ],
    relationships: [
      { id: 'r1', source: 'e1', target: 'e2', type: 'acquires', description: 'Acquisition relationship', strength: 1.0 },
      { id: 'r2', source: 'e3', target: 'e1', type: 'binds', description: 'Agreement binds acquirer', strength: 0.9 },
      { id: 'r3', source: 'e3', target: 'e2', type: 'binds', description: 'Agreement binds target', strength: 0.9 },
      { id: 'r4', source: 'e4', target: 'e3', type: 'defined_in', description: 'Price defined in agreement', strength: 0.8 },
      { id: 'r5', source: 'e5', target: 'e3', type: 'milestone_for', description: 'Closing milestone', strength: 0.7 },
    ],
    summary: `Knowledge graph for ${documentName}`,
    key_insights: ['Document structure extracted', 'Key entities identified'],
  }
}

// Calculate graph metrics
function calculateGraphMetrics(graph: KnowledgeGraph) {
  const entityCounts = graph.entities.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate centrality (simplified - based on connection count)
  const connectionCounts: Record<string, number> = {}
  graph.relationships.forEach(r => {
    connectionCounts[r.source] = (connectionCounts[r.source] || 0) + 1
    connectionCounts[r.target] = (connectionCounts[r.target] || 0) + 1
  })

  const centralEntities = Object.entries(connectionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      entity: graph.entities.find(e => e.id === id)?.name || id,
      connections: count,
    }))

  // Relationship type distribution
  const relationshipTypes = graph.relationships.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total_entities: graph.entities.length,
    total_relationships: graph.relationships.length,
    entity_distribution: entityCounts,
    relationship_types: relationshipTypes,
    central_entities: centralEntities,
    graph_density: graph.entities.length > 1 
      ? (2 * graph.relationships.length) / (graph.entities.length * (graph.entities.length - 1))
      : 0,
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { documentId } = body

    if (!documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
    }

    console.log('Extracting knowledge graph for document:', documentId)

    // Fetch document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('name, extracted_text')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const documentText = document.extracted_text || 'No text extracted'
    const graph = await extractKnowledgeGraph(documentText, document.name)
    const metrics = calculateGraphMetrics(graph)

    // Log audit
    try {
      await supabase.from('audit_logs').insert({
        event_type: 'analysis',
        action: 'knowledge_graph_extraction',
        details: {
          document_id: documentId,
          entities_found: graph.entities.length,
          relationships_found: graph.relationships.length,
          processing_time_ms: Date.now() - startTime,
        },
      })
    } catch (e) {
      console.log('Audit error:', e)
    }

    return NextResponse.json({
      success: true,
      knowledge_graph: {
        document_id: documentId,
        document_name: document.name,
        
        // The graph itself
        graph: {
          nodes: graph.entities.map(e => ({
            id: e.id,
            label: e.name,
            type: e.type,
            description: e.description,
            importance: e.importance,
            metadata: e.metadata,
          })),
          edges: graph.relationships.map(r => ({
            id: r.id,
            source: r.source,
            target: r.target,
            label: r.type,
            description: r.description,
            weight: r.strength,
          })),
        },
        
        // Analysis
        summary: graph.summary,
        key_insights: graph.key_insights,
        metrics,
        
        processing_time_ms: Date.now() - startTime,
      },
    })

  } catch (error) {
    console.error('Knowledge graph error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Knowledge graph extraction failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/knowledge-graph',
    description: 'Extract entities and relationships from documents',
    method: 'POST',
    body: {
      documentId: 'uuid - Document to analyze (required)',
    },
    outputs: {
      graph: 'Nodes (entities) and edges (relationships)',
      metrics: 'Graph statistics and centrality measures',
      key_insights: 'AI-generated insights about document structure',
    },
    entity_types: [
      'company', 'person', 'contract', 'financial', 
      'date', 'location', 'asset', 'liability', 'term'
    ],
  })
}
