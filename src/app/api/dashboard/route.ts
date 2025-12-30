import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get document counts by status
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id, status, risk_score, created_at')

    if (docsError) throw docsError

    // Get findings counts by severity
    const { data: findings, error: findingsError } = await supabase
      .from('findings')
      .select('id, severity, model, created_at')

    if (findingsError) throw findingsError

    // Get recent audit logs
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    // Calculate stats
    const totalDocuments = documents?.length || 0
    const analyzedDocuments = documents?.filter(d => d.status === 'analyzed').length || 0
    const pendingDocuments = documents?.filter(d => d.status === 'pending').length || 0
    const processingDocuments = documents?.filter(d => d.status === 'processing').length || 0

    const totalFindings = findings?.length || 0
    const criticalFindings = findings?.filter(f => f.severity === 'critical').length || 0
    const highFindings = findings?.filter(f => f.severity === 'high').length || 0
    const mediumFindings = findings?.filter(f => f.severity === 'medium').length || 0
    const lowFindings = findings?.filter(f => f.severity === 'low').length || 0

    // Model attribution stats
    const claudeFindings = findings?.filter(f => f.model === 'Claude' || f.model === 'claude').length || 0
    const gpt4Findings = findings?.filter(f => f.model === 'GPT-4' || f.model === 'gpt-4').length || 0
    const geminiFindings = findings?.filter(f => f.model === 'Gemini' || f.model === 'gemini').length || 0

    // Average risk score
    const analyzedDocs = documents?.filter(d => d.risk_score !== null) || []
    const avgRiskScore = analyzedDocs.length > 0
      ? Math.round(analyzedDocs.reduce((sum, d) => sum + (d.risk_score || 0), 0) / analyzedDocs.length)
      : 0

    // Risk distribution
    const highRiskDocs = analyzedDocs.filter(d => (d.risk_score || 0) >= 70).length
    const mediumRiskDocs = analyzedDocs.filter(d => (d.risk_score || 0) >= 40 && (d.risk_score || 0) < 70).length
    const lowRiskDocs = analyzedDocs.filter(d => (d.risk_score || 0) < 40).length

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentDocuments = documents?.filter(d => new Date(d.created_at) >= sevenDaysAgo).length || 0
    const recentFindings = findings?.filter(f => new Date(f.created_at) >= sevenDaysAgo).length || 0

    return NextResponse.json({
      success: true,
      stats: {
        // Document stats
        documents: {
          total: totalDocuments,
          analyzed: analyzedDocuments,
          pending: pendingDocuments,
          processing: processingDocuments,
        },
        
        // Findings stats
        findings: {
          total: totalFindings,
          critical: criticalFindings,
          high: highFindings,
          medium: mediumFindings,
          low: lowFindings,
        },
        
        // Model attribution
        models: {
          claude: claudeFindings,
          gpt4: gpt4Findings,
          gemini: geminiFindings,
        },
        
        // Risk analysis
        risk: {
          average: avgRiskScore,
          high_risk_docs: highRiskDocs,
          medium_risk_docs: mediumRiskDocs,
          low_risk_docs: lowRiskDocs,
        },
        
        // Activity
        activity: {
          recent_documents: recentDocuments,
          recent_findings: recentFindings,
          last_updated: new Date().toISOString(),
        },
        
        // Recent audit logs
        recent_activity: auditLogs || [],
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
