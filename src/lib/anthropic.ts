import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface AnalysisResult {
  findings: {
    type: 'risk' | 'clause' | 'financial' | 'entity' | 'recommendation'
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
    title: string
    description: string
    page_number?: number
    confidence: number
  }[]
  summary: string
  risk_score: number
}

// System prompt for M&A document analysis
const MA_ANALYSIS_SYSTEM_PROMPT = `You are an expert M&A due diligence analyst with deep expertise in:
- Merger and acquisition agreements
- Legal contract analysis
- Financial statement review
- Risk identification and assessment
- Regulatory compliance

Your task is to analyze documents related to M&A transactions and identify:
1. Key contractual clauses (MAC clauses, termination rights, indemnification, etc.)
2. Financial terms and conditions
3. Legal risks and red flags
4. Regulatory requirements
5. Material information that could impact deal value

For each finding, provide:
- Type (risk, clause, financial, entity, recommendation)
- Severity (critical, high, medium, low, info)
- Clear title
- Detailed description
- Confidence score (0.0 to 1.0)
- Page number if identifiable

Focus on actionable insights that would matter to an investment committee.`

export async function analyzeDocumentWithClaude(
  documentText: string,
  documentName: string,
  analysisType: 'contract' | 'financial' | 'general' = 'general'
): Promise<AnalysisResult> {
  const typePrompts = {
    contract: `Analyze this contract document focusing on:
- Material Adverse Change (MAC) clauses
- Termination rights and triggers
- Indemnification provisions and caps
- Representations and warranties
- Change of control provisions
- Non-compete and non-solicitation clauses
- Closing conditions
- Breakup fees`,
    financial: `Analyze this financial document focusing on:
- Revenue and EBITDA trends
- Working capital requirements
- Debt obligations and covenants
- Off-balance sheet items
- Related party transactions
- Accounting policy changes
- Contingent liabilities`,
    general: `Analyze this document and identify all material findings relevant to M&A due diligence.`,
  }

  const userPrompt = `Document: "${documentName}"

${typePrompts[analysisType]}

Document Content:
---
${documentText.slice(0, 100000)} 
---

Respond in JSON format:
{
  "findings": [
    {
      "type": "risk" | "clause" | "financial" | "entity" | "recommendation",
      "severity": "critical" | "high" | "medium" | "low" | "info",
      "title": "Brief title",
      "description": "Detailed description of the finding",
      "page_number": null or number,
      "confidence": 0.0-1.0
    }
  ],
  "summary": "Executive summary of key findings",
  "risk_score": 0-100
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: MA_ANALYSIS_SYSTEM_PROMPT,
    })

    // Extract text from response
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonText = textContent.text
    const jsonMatch = jsonText.match(/```json\n?([\s\S]*?)\n?```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }

    const result = JSON.parse(jsonText) as AnalysisResult

    // Validate and sanitize
    return {
      findings: result.findings.map((f) => ({
        type: f.type || 'risk',
        severity: f.severity || 'medium',
        title: f.title || 'Untitled Finding',
        description: f.description || '',
        page_number: f.page_number,
        confidence: Math.min(1, Math.max(0, f.confidence || 0.5)),
      })),
      summary: result.summary || 'Analysis complete.',
      risk_score: Math.min(100, Math.max(0, result.risk_score || 50)),
    }
  } catch (error) {
    console.error('Claude analysis error:', error)
    throw error
  }
}

// Streaming version for real-time UI updates
export async function* analyzeDocumentWithClaudeStream(
  documentText: string,
  documentName: string,
  analysisType: 'contract' | 'financial' | 'general' = 'general'
): AsyncGenerator<{ type: 'token' | 'complete'; content: string }> {
  const typePrompts = {
    contract: `Focus on contract terms, MAC clauses, termination rights, indemnification.`,
    financial: `Focus on revenue, EBITDA, debt, working capital, contingencies.`,
    general: `Identify all material M&A findings.`,
  }

  const userPrompt = `Analyze "${documentName}" for M&A due diligence. ${typePrompts[analysisType]}

Document excerpt:
${documentText.slice(0, 50000)}

List your findings one by one, explaining each clearly.`

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: userPrompt }],
      system: MA_ANALYSIS_SYSTEM_PROMPT,
    })

    let fullContent = ''

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullContent += event.delta.text
        yield { type: 'token', content: event.delta.text }
      }
    }

    yield { type: 'complete', content: fullContent }
  } catch (error) {
    console.error('Claude streaming error:', error)
    throw error
  }
}

// Agent debate function - Claude takes a position
export async function debateWithClaude(
  topic: string,
  position: 'for' | 'against',
  context: string,
  previousArguments?: string
): Promise<string> {
  const positionPrompt =
    position === 'for'
      ? `You are arguing IN FAVOR of the following position. Make your strongest case.`
      : `You are arguing AGAINST the following position. Present compelling counterarguments.`

  const userPrompt = `${positionPrompt}

Topic: ${topic}

Context:
${context}

${previousArguments ? `Previous arguments to respond to:\n${previousArguments}\n\n` : ''}

Provide a clear, well-reasoned argument in 2-3 paragraphs. Be specific and cite relevant details from the context.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: userPrompt }],
      system:
        'You are participating in a structured debate about M&A deal findings. Present clear, professional arguments.',
    })

    const textContent = response.content.find((block) => block.type === 'text')
    return textContent?.type === 'text' ? textContent.text : 'Unable to generate argument.'
  } catch (error) {
    console.error('Claude debate error:', error)
    throw error
  }
}

// Generate report section
export async function generateReportSection(
  sectionType: 'executive_summary' | 'risk_analysis' | 'financial_overview' | 'recommendations',
  findings: AnalysisResult['findings'][],
  context: string
): Promise<string> {
  const sectionPrompts = {
    executive_summary: `Write a concise executive summary (2-3 paragraphs) of the key findings for an Investment Committee.`,
    risk_analysis: `Provide a detailed risk analysis section highlighting all identified risks, their potential impact, and suggested mitigations.`,
    financial_overview: `Summarize the financial findings, including any concerns about valuations, projections, or financial health.`,
    recommendations: `Based on the analysis, provide clear recommendations for the deal team on next steps and areas requiring further due diligence.`,
  }

  const userPrompt = `${sectionPrompts[sectionType]}

Context:
${context}

Key Findings:
${JSON.stringify(findings, null, 2)}

Write professionally for a sophisticated financial audience.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: userPrompt }],
      system:
        'You are a senior M&A advisor writing sections of an Investment Committee memo. Be precise, professional, and actionable.',
    })

    const textContent = response.content.find((block) => block.type === 'text')
    return textContent?.type === 'text' ? textContent.text : ''
  } catch (error) {
    console.error('Claude report generation error:', error)
    throw error
  }
}
