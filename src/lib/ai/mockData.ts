import type { AgentResponse, Finding, DealSummary, DealMetrics, DebateTurn, ModelType } from '@/types'
import { generateId } from '@/lib/utils'

// Simulated agent responses for demo purposes
export const MOCK_AGENT_RESPONSES: Record<string, AgentResponse[]> = {
  contract_review: [
    {
      agentId: 'contract_analyst',
      agentName: 'Contract Analyst',
      model: 'claude',
      content: `## Contract Analysis Summary

**Material Adverse Change (MAC) Clause** - Section 7.2
The MAC clause is broadly drafted with standard carve-outs for:
- General economic conditions
- Industry-wide changes
- Changes in GAAP

⚠️ **Notable Finding**: The clause includes an unusual "pandemic exception" that could limit buyer's termination rights. This deviates from market standard.

**Change of Control Provisions** - Section 12.4
- Requires 30-day prior written notice
- Board approval needed for any transfer >50% ownership
- Customer consent required for 3 key contracts

**Indemnification** - Section 9
- Cap: 15% of purchase price (below market average of 20-25%)
- Basket: $500K (1% of deal value)
- Survival: 18 months for general reps, 6 years for tax`,
      confidence: 0.92,
      reasoning: 'Analysis based on clear contract language with standard M&A terminology',
      evidence: ['Section 7.2 MAC clause', 'Section 12.4 CoC provisions', 'Section 9 Indemnification'],
      tokens: 847,
      latencyMs: 2340,
      timestamp: new Date().toISOString(),
    },
    {
      agentId: 'risk_assessor',
      agentName: 'Risk Assessor',
      model: 'claude',
      content: `## Risk Assessment

### Critical Risks (2)
1. **Customer Concentration** - High
   - Top 3 customers = 67% of revenue
   - No long-term contracts in place
   - Risk Score: 8.5/10

2. **IP Ownership Dispute** - Medium-High
   - Pending litigation on core patent
   - Settlement negotiations ongoing
   - Potential liability: $2-5M

### Moderate Risks (3)
- Employee retention post-acquisition
- Regulatory approval timeline (60-90 days)
- Integration complexity due to legacy systems

### Risk Mitigation Recommendations
1. Negotiate customer consent before closing
2. Obtain IP indemnity or escrow
3. Implement retention bonuses for key personnel`,
      confidence: 0.88,
      reasoning: 'Risk assessment based on document review and industry benchmarks',
      evidence: ['Customer revenue breakdown', 'Patent filing #US2021/0394821', 'Employee roster analysis'],
      tokens: 623,
      latencyMs: 1890,
      timestamp: new Date().toISOString(),
    },
    {
      agentId: 'financial_modeler',
      agentName: 'Financial Analyst',
      model: 'gpt-4',
      content: `## Financial Analysis

### Valuation Metrics
| Metric | Value | Industry Avg | Assessment |
|--------|-------|--------------|------------|
| EV/EBITDA | 8.2x | 7.5x | Slight Premium |
| EV/Revenue | 2.1x | 1.8x | Premium |
| P/E | 18.5x | 16.2x | Above Market |

### Quality of Earnings
- **Normalized EBITDA**: $42.3M (vs reported $45.1M)
- **Adjustments**:
  - One-time litigation costs: +$1.8M
  - Non-recurring consulting: +$0.9M
  - Below-market lease: -$0.5M (will reset)

### Working Capital Analysis
- NWC Target: $8.2M
- Current NWC: $7.1M
- **Gap**: $1.1M adjustment needed

### Recommendation
Deal is priced at a 9% premium to comparables. Justified if synergies exceed $3M annually.`,
      confidence: 0.91,
      reasoning: 'Analysis based on audited financials and comparable transactions',
      evidence: ['2023 Audited Financials', 'Management Accounts Q3 2024', 'CapIQ Comparables'],
      tokens: 712,
      latencyMs: 2150,
      timestamp: new Date().toISOString(),
    },
  ],
}

// Mock findings for the dashboard
export const MOCK_FINDINGS: Finding[] = [
  {
    id: generateId(),
    type: 'risk',
    severity: 'critical',
    title: 'Customer Concentration Risk',
    description: 'Top 3 customers represent 67% of total revenue with no long-term contracts in place.',
    evidence: 'Revenue breakdown analysis from Q3 2024 financials',
    confidence: 0.94,
    consensusScore: 0.89,
    modelsAgreed: ['claude', 'gpt-4'],
    source: {
      documentId: 'doc-001',
      documentName: 'Q3 Financial Report.pdf',
      pageNumber: 12,
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: generateId(),
    type: 'anomaly',
    severity: 'high',
    title: 'Unusual Revenue Recognition Pattern',
    description: 'Q4 revenue shows 45% spike inconsistent with historical seasonality patterns.',
    evidence: 'Revenue timing analysis suggests possible channel stuffing',
    confidence: 0.78,
    consensusScore: 0.72,
    modelsAgreed: ['claude', 'gemini'],
    source: {
      documentId: 'doc-002',
      documentName: 'Annual Financial Statements.pdf',
      pageNumber: 8,
    },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: generateId(),
    type: 'opportunity',
    severity: 'medium',
    title: 'Synergy Potential in Operations',
    description: 'Combined entity could achieve $4.2M annual savings through procurement consolidation.',
    evidence: 'Vendor overlap analysis shows 34% common suppliers',
    confidence: 0.85,
    consensusScore: 0.91,
    modelsAgreed: ['gpt-4', 'gemini', 'claude'],
    source: {
      documentId: 'doc-003',
      documentName: 'Vendor Analysis.xlsx',
    },
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: generateId(),
    type: 'contract_clause',
    severity: 'high',
    title: 'Non-Standard MAC Clause',
    description: 'Material Adverse Change clause includes pandemic exception not present in comparable deals.',
    evidence: 'Section 7.2 of Purchase Agreement',
    confidence: 0.96,
    consensusScore: 0.94,
    modelsAgreed: ['claude', 'gpt-4', 'gemini'],
    source: {
      documentId: 'doc-004',
      documentName: 'Stock Purchase Agreement.pdf',
      pageNumber: 34,
      excerpt: '...excluding any effect resulting from pandemics, epidemics, or public health emergencies...',
    },
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: generateId(),
    type: 'insight',
    severity: 'info',
    title: 'Strong IP Portfolio',
    description: 'Company holds 12 patents with average 8.3 years remaining. Core technology well-protected.',
    evidence: 'Patent analysis via USPTO and EPO databases',
    confidence: 0.92,
    modelsAgreed: ['gemini'],
    source: {
      documentId: 'doc-005',
      documentName: 'IP Schedule.pdf',
    },
    timestamp: new Date(Date.now() - 18000000).toISOString(),
  },
]

// Mock deals for dashboard
export const MOCK_DEALS: DealSummary[] = [
  {
    id: 'deal-001',
    name: 'Project Phoenix',
    companyName: 'TechFlow Solutions',
    dealType: 'Acquisition',
    status: 'in_progress',
    targetValue: 52000000,
    currency: 'USD',
    riskScore: 72,
    findingsCount: 24,
    lastActivity: new Date(Date.now() - 1800000).toISOString(),
    progress: 65,
  },
  {
    id: 'deal-002',
    name: 'Project Atlas',
    companyName: 'CloudNine Systems',
    dealType: 'Merger',
    status: 'review',
    targetValue: 128000000,
    currency: 'USD',
    riskScore: 45,
    findingsCount: 42,
    lastActivity: new Date(Date.now() - 7200000).toISOString(),
    progress: 85,
  },
  {
    id: 'deal-003',
    name: 'Project Neptune',
    companyName: 'DataStream Analytics',
    dealType: 'Investment',
    status: 'draft',
    targetValue: 15000000,
    currency: 'USD',
    riskScore: 28,
    findingsCount: 8,
    lastActivity: new Date(Date.now() - 86400000).toISOString(),
    progress: 20,
  },
]

// Mock metrics
export const MOCK_METRICS: DealMetrics = {
  totalDeals: 12,
  activeDeals: 4,
  completedDeals: 7,
  totalFindings: 156,
  criticalRisks: 8,
  avgConfidence: 0.87,
  documentsProcessed: 234,
  analysisRuns: 89,
}

// Mock debate turns
export const MOCK_DEBATE_TURNS: DebateTurn[] = [
  {
    round: 1,
    side: 'for',
    agentId: 'financial_modeler',
    agentName: 'Financial Analyst',
    model: 'gpt-4',
    argument: `The acquisition should proceed based on compelling financial fundamentals:

1. **Attractive Valuation**: At 8.2x EV/EBITDA, the deal is only marginally above sector median (7.8x), yet the target has superior growth (15% vs 8% industry avg).

2. **Synergy Potential**: Our analysis identifies $4.2M in cost synergies through vendor consolidation and $2.8M in revenue synergies from cross-selling. Combined, this represents 16% of target EBITDA.

3. **Strategic Fit**: The acquisition fills a critical gap in our cloud infrastructure offering, reducing time-to-market by 18 months vs. organic build.`,
    evidence: ['Comparable transactions analysis', 'Synergy model v3.2', 'Strategic roadmap alignment'],
    confidence: 0.85,
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    round: 1,
    side: 'against',
    agentId: 'risk_assessor',
    agentName: 'Risk Assessor',
    model: 'claude',
    argument: `The acquisition carries unacceptable risks that outweigh the potential benefits:

1. **Customer Concentration**: 67% revenue concentration in top 3 customers with no contractual commitments creates existential risk. Loss of any single customer would destroy deal economics.

2. **Integration Risk**: Target operates on legacy systems (Oracle 11g, AS/400) requiring $8-12M migration cost not reflected in synergy estimates.

3. **IP Litigation**: Pending patent dispute could result in $2-5M liability AND injunction against core product line. Settlement timeline extends past projected close date.`,
    evidence: ['Customer analysis doc', 'IT due diligence report', 'Patent litigation docket #2024-CV-0892'],
    confidence: 0.82,
    timestamp: new Date(Date.now() - 240000).toISOString(),
  },
  {
    round: 2,
    side: 'for',
    agentId: 'contract_analyst',
    agentName: 'Contract Analyst',
    model: 'claude',
    argument: `Addressing the concerns raised, the deal structure adequately mitigates key risks:

1. **Customer Risk Mitigation**: We've negotiated customer consent as a closing condition. Additionally, 15% of purchase price is held in escrow for 18 months tied to customer retention.

2. **Integration Costs**: The revised model now includes $10M integration budget, still yielding 12% IRR - above our 10% hurdle rate.

3. **IP Protection**: Seller has agreed to full indemnification for IP claims with $5M special escrow, plus we've obtained insurance coverage for excess liability.`,
    evidence: ['Escrow agreement draft', 'Updated financial model', 'R&W insurance binder'],
    confidence: 0.88,
    timestamp: new Date(Date.now() - 180000).toISOString(),
  },
  {
    round: 2,
    side: 'against',
    agentId: 'market_researcher',
    agentName: 'Market Researcher',
    model: 'gemini',
    argument: `Market conditions and competitive dynamics argue against proceeding:

1. **Market Timing**: Cloud infrastructure market is entering consolidation phase. 3 larger acquisitions announced in past 90 days at lower multiples (avg 6.8x).

2. **Alternative Paths**: Partnership discussions with AWS and Azure could achieve 70% of strategic objectives at 20% of capital commitment.

3. **Opportunity Cost**: $52M deployed here prevents participation in upcoming Project Horizon (better strategic fit, lower risk profile, management already vetted).`,
    evidence: ['Q4 2024 M&A report', 'AWS partnership term sheet', 'Project Horizon preliminary memo'],
    confidence: 0.79,
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
]

// Function to simulate streaming response
export async function* simulateStreamingResponse(
  agentId: string,
  content: string,
  delayMs = 30
): AsyncGenerator<string> {
  const words = content.split(' ')
  for (const word of words) {
    yield word + ' '
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
}
