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

interface ReportSection {
  title: string
  content: string
  findings?: Array<{
    title: string
    severity: string
    description: string
    model: string
  }>
  risk_score?: number
}

// Generate comprehensive due diligence report
async function generateReport(
  documentId: string,
  reportType: 'executive_summary' | 'full_analysis' | 'risk_assessment'
): Promise<{
  title: string
  generated_at: string
  document_name: string
  sections: ReportSection[]
  overall_risk_score: number
  recommendation: string
}> {
  // Fetch document and findings
  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (!document) {
    throw new Error('Document not found')
  }

  const { data: findings } = await supabase
    .from('findings')
    .select('*')
    .eq('document_id', documentId)
    .order('severity', { ascending: true })

  const findingsList = findings || []

  // Generate AI-powered analysis
  const systemPrompt = `You are a senior M&A due diligence analyst preparing a ${reportType.replace('_', ' ')} report.
Be professional, specific, and actionable. Structure your response as JSON.`

  const userPrompt = `Document: ${document.name}
Risk Score: ${document.risk_score || 'Not calculated'}
Findings Count: ${findingsList.length}

Key Findings:
${findingsList.slice(0, 10).map(f => `- [${f.severity?.toUpperCase()}] ${f.title}: ${f.description}`).join('\n')}

Generate a ${reportType.replace('_', ' ')} with the following JSON structure:
{
  "executive_summary": "2-3 paragraph overview of the document analysis",
  "key_risks": ["Risk 1", "Risk 2", "Risk 3"],
  "key_opportunities": ["Opportunity 1", "Opportunity 2"],
  "critical_action_items": ["Action 1", "Action 2", "Action 3"],
  "recommendation": "Clear recommendation for the deal team"
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  let aiAnalysis = {
    executive_summary: 'Analysis pending',
    key_risks: [] as string[],
    key_opportunities: [] as string[],
    critical_action_items: [] as string[],
    recommendation: 'Review required',
  }

  const content = response.content[0]
  if (content.type === 'text') {
    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiAnalysis = { ...aiAnalysis, ...JSON.parse(jsonMatch[0]) }
      }
    } catch (e) {
      console.error('Error parsing AI analysis:', e)
    }
  }

  // Build report sections
  const sections: ReportSection[] = []

  // Executive Summary
  sections.push({
    title: 'Executive Summary',
    content: aiAnalysis.executive_summary,
    risk_score: document.risk_score || 0,
  })

  // Key Findings
  if (findingsList.length > 0) {
    const criticalFindings = findingsList.filter(f => f.severity === 'critical')
    const highFindings = findingsList.filter(f => f.severity === 'high')
    const mediumFindings = findingsList.filter(f => f.severity === 'medium')

    sections.push({
      title: 'Critical Findings',
      content: criticalFindings.length > 0 
        ? `${criticalFindings.length} critical issues require immediate attention.`
        : 'No critical issues identified.',
      findings: criticalFindings.map(f => ({
        title: f.title,
        severity: f.severity,
        description: f.description,
        model: f.model,
      })),
    })

    sections.push({
      title: 'High-Priority Findings',
      content: highFindings.length > 0 
        ? `${highFindings.length} high-priority issues should be addressed before closing.`
        : 'No high-priority issues identified.',
      findings: highFindings.map(f => ({
        title: f.title,
        severity: f.severity,
        description: f.description,
        model: f.model,
      })),
    })

    sections.push({
      title: 'Additional Findings',
      content: `${mediumFindings.length} medium/low findings documented.`,
      findings: mediumFindings.slice(0, 5).map(f => ({
        title: f.title,
        severity: f.severity,
        description: f.description,
        model: f.model,
      })),
    })
  }

  // Key Risks
  sections.push({
    title: 'Key Risks',
    content: aiAnalysis.key_risks.map((r, i) => `${i + 1}. ${r}`).join('\n\n'),
  })

  // Opportunities
  if (aiAnalysis.key_opportunities.length > 0) {
    sections.push({
      title: 'Opportunities',
      content: aiAnalysis.key_opportunities.map((o, i) => `${i + 1}. ${o}`).join('\n\n'),
    })
  }

  // Action Items
  sections.push({
    title: 'Recommended Action Items',
    content: aiAnalysis.critical_action_items.map((a, i) => `${i + 1}. ${a}`).join('\n\n'),
  })

  return {
    title: `Due Diligence Report: ${document.name}`,
    generated_at: new Date().toISOString(),
    document_name: document.name,
    sections,
    overall_risk_score: document.risk_score || 0,
    recommendation: aiAnalysis.recommendation,
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { documentId, reportType = 'executive_summary', format = 'json' } = body

    if (!documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
    }

    console.log(`Generating ${reportType} report for document ${documentId}`)

    const report = await generateReport(documentId, reportType)

    // Log audit
    supabase.from('audit_logs').insert({
      event_type: 'report',
      action: 'generate_report',
      details: {
        document_id: documentId,
        report_type: reportType,
        format,
        processing_time_ms: Date.now() - startTime,
      },
    }).then(() => {}).catch(e => console.log('Audit error:', e))

    // Return based on format
    if (format === 'markdown') {
      let markdown = `# ${report.title}\n\n`
      markdown += `*Generated: ${new Date(report.generated_at).toLocaleString()}*\n\n`
      markdown += `**Overall Risk Score: ${report.overall_risk_score}/100**\n\n`
      markdown += `---\n\n`

      for (const section of report.sections) {
        markdown += `## ${section.title}\n\n`
        markdown += `${section.content}\n\n`

        if (section.findings && section.findings.length > 0) {
          for (const finding of section.findings) {
            markdown += `### ${finding.title}\n`
            markdown += `*Severity: ${finding.severity} | Detected by: ${finding.model}*\n\n`
            markdown += `${finding.description}\n\n`
          }
        }
      }

      markdown += `---\n\n`
      markdown += `## Recommendation\n\n${report.recommendation}\n`

      return NextResponse.json({
        success: true,
        format: 'markdown',
        report: {
          ...report,
          markdown,
        },
        processing_time_ms: Date.now() - startTime,
      })
    }

    return NextResponse.json({
      success: true,
      format: 'json',
      report,
      processing_time_ms: Date.now() - startTime,
    })

  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Report generation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// GET for report templates
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/reports',
    description: 'Generate AI-powered due diligence reports',
    method: 'POST',
    body: {
      documentId: 'uuid - Document to report on (required)',
      reportType: 'executive_summary | full_analysis | risk_assessment',
      format: 'json | markdown',
    },
    report_types: {
      executive_summary: 'High-level summary for leadership',
      full_analysis: 'Comprehensive analysis with all findings',
      risk_assessment: 'Focused on risks and mitigations',
    },
  })
}
