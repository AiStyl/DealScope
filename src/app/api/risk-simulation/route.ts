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

interface RiskFactor {
  name: string
  category: string
  probability: number // 0-1
  impact_low: number // percentage
  impact_high: number // percentage
  description: string
  mitigation?: string
}

interface SimulationResult {
  scenario_id: number
  base_value: number
  final_value: number
  total_impact_percent: number
  triggered_risks: string[]
}

interface SimulationSummary {
  simulations_run: number
  base_deal_value: number
  
  // Value distribution
  mean_value: number
  median_value: number
  std_dev: number
  min_value: number
  max_value: number
  
  // Risk metrics
  value_at_risk_95: number // 95th percentile worst case
  value_at_risk_99: number // 99th percentile worst case
  expected_shortfall: number // avg of worst 5%
  
  // Probability analysis
  prob_value_below_80: number // P(value < 80% of base)
  prob_value_below_90: number // P(value < 90% of base)
  prob_value_above_110: number // P(value > 110% of base)
  
  // Distribution buckets
  distribution: {
    bucket: string
    count: number
    percentage: number
  }[]
  
  // Top risk contributors
  top_risks: {
    name: string
    frequency: number
    avg_impact: number
  }[]
}

// Extract risk factors from document using Claude
async function extractRiskFactors(documentText: string): Promise<RiskFactor[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are an M&A risk analyst. Extract all risk factors from this document that could affect deal value.
For each risk, estimate:
- probability (0-1): likelihood of occurring
- impact_low: minimum impact on deal value (as percentage, can be negative)
- impact_high: maximum impact on deal value (as percentage, can be negative)

Categories: Legal, Financial, Operational, Regulatory, Market, Integration, Reputation

Respond in JSON format:
{
  "risk_factors": [
    {
      "name": "Risk name",
      "category": "Category",
      "probability": 0.3,
      "impact_low": -5,
      "impact_high": -15,
      "description": "Brief description",
      "mitigation": "Possible mitigation"
    }
  ]
}`,
    messages: [{
      role: 'user',
      content: `Extract risk factors from this M&A document:\n\n${documentText.slice(0, 50000)}`
    }],
  })

  const content = response.content[0]
  if (content.type !== 'text') return getDefaultRiskFactors()

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return parsed.risk_factors || getDefaultRiskFactors()
    }
  } catch (e) {
    console.error('Error parsing risk factors:', e)
  }

  return getDefaultRiskFactors()
}

function getDefaultRiskFactors(): RiskFactor[] {
  return [
    {
      name: 'MAC Clause Trigger',
      category: 'Legal',
      probability: 0.08,
      impact_low: -100,
      impact_high: -100,
      description: 'Material Adverse Change clause triggered, deal terminates',
    },
    {
      name: 'Regulatory Delay',
      category: 'Regulatory',
      probability: 0.25,
      impact_low: -2,
      impact_high: -8,
      description: 'Extended regulatory review increases costs',
    },
    {
      name: 'Key Employee Departure',
      category: 'Integration',
      probability: 0.35,
      impact_low: -3,
      impact_high: -12,
      description: 'Loss of critical talent during transition',
    },
    {
      name: 'Revenue Shortfall',
      category: 'Financial',
      probability: 0.30,
      impact_low: -5,
      impact_high: -20,
      description: 'Target misses revenue projections',
    },
    {
      name: 'Integration Cost Overrun',
      category: 'Operational',
      probability: 0.40,
      impact_low: -3,
      impact_high: -10,
      description: 'Integration costs exceed budget',
    },
    {
      name: 'Customer Churn',
      category: 'Market',
      probability: 0.25,
      impact_low: -2,
      impact_high: -15,
      description: 'Customers leave due to uncertainty',
    },
    {
      name: 'Hidden Liabilities',
      category: 'Legal',
      probability: 0.15,
      impact_low: -5,
      impact_high: -25,
      description: 'Undisclosed liabilities discovered',
    },
    {
      name: 'Synergy Realization Delay',
      category: 'Integration',
      probability: 0.45,
      impact_low: -2,
      impact_high: -8,
      description: 'Synergies take longer to materialize',
    },
  ]
}

// Monte Carlo simulation engine
function runMonteCarloSimulation(
  baseDealValue: number,
  riskFactors: RiskFactor[],
  numSimulations: number = 10000
): { results: SimulationResult[]; summary: SimulationSummary } {
  const results: SimulationResult[] = []
  const riskTriggerCounts: Map<string, { count: number; totalImpact: number }> = new Map()

  // Initialize risk counters
  riskFactors.forEach(r => riskTriggerCounts.set(r.name, { count: 0, totalImpact: 0 }))

  // Run simulations
  for (let i = 0; i < numSimulations; i++) {
    let currentValue = baseDealValue
    let totalImpactPercent = 0
    const triggeredRisks: string[] = []

    for (const risk of riskFactors) {
      // Determine if risk triggers
      if (Math.random() < risk.probability) {
        // Calculate impact (uniform distribution between low and high)
        const impactPercent = risk.impact_low + Math.random() * (risk.impact_high - risk.impact_low)
        totalImpactPercent += impactPercent
        triggeredRisks.push(risk.name)

        // Track risk statistics
        const riskStats = riskTriggerCounts.get(risk.name)!
        riskStats.count++
        riskStats.totalImpact += Math.abs(impactPercent)
      }
    }

    // Apply total impact
    currentValue = baseDealValue * (1 + totalImpactPercent / 100)
    
    results.push({
      scenario_id: i + 1,
      base_value: baseDealValue,
      final_value: Math.max(0, currentValue), // Can't go negative
      total_impact_percent: totalImpactPercent,
      triggered_risks: triggeredRisks,
    })
  }

  // Calculate summary statistics
  const finalValues = results.map(r => r.final_value).sort((a, b) => a - b)
  const mean = finalValues.reduce((a, b) => a + b, 0) / numSimulations
  const median = finalValues[Math.floor(numSimulations / 2)]
  const variance = finalValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / numSimulations
  const stdDev = Math.sqrt(variance)

  // Value at Risk calculations
  const var95Index = Math.floor(numSimulations * 0.05)
  const var99Index = Math.floor(numSimulations * 0.01)
  const var95 = finalValues[var95Index]
  const var99 = finalValues[var99Index]
  
  // Expected Shortfall (average of worst 5%)
  const worstValues = finalValues.slice(0, var95Index)
  const expectedShortfall = worstValues.reduce((a, b) => a + b, 0) / worstValues.length

  // Probability calculations
  const threshold80 = baseDealValue * 0.8
  const threshold90 = baseDealValue * 0.9
  const threshold110 = baseDealValue * 1.1

  const probBelow80 = finalValues.filter(v => v < threshold80).length / numSimulations
  const probBelow90 = finalValues.filter(v => v < threshold90).length / numSimulations
  const probAbove110 = finalValues.filter(v => v > threshold110).length / numSimulations

  // Distribution buckets
  const buckets = [
    { label: '< 70%', min: 0, max: baseDealValue * 0.7 },
    { label: '70-80%', min: baseDealValue * 0.7, max: baseDealValue * 0.8 },
    { label: '80-90%', min: baseDealValue * 0.8, max: baseDealValue * 0.9 },
    { label: '90-95%', min: baseDealValue * 0.9, max: baseDealValue * 0.95 },
    { label: '95-100%', min: baseDealValue * 0.95, max: baseDealValue },
    { label: '100-105%', min: baseDealValue, max: baseDealValue * 1.05 },
    { label: '> 105%', min: baseDealValue * 1.05, max: Infinity },
  ]

  const distribution = buckets.map(bucket => {
    const count = finalValues.filter(v => v >= bucket.min && v < bucket.max).length
    return {
      bucket: bucket.label,
      count,
      percentage: Math.round((count / numSimulations) * 100 * 10) / 10,
    }
  })

  // Top risk contributors
  const topRisks = Array.from(riskTriggerCounts.entries())
    .map(([name, stats]) => ({
      name,
      frequency: Math.round((stats.count / numSimulations) * 100 * 10) / 10,
      avg_impact: stats.count > 0 ? Math.round((stats.totalImpact / stats.count) * 10) / 10 : 0,
    }))
    .sort((a, b) => (b.frequency * b.avg_impact) - (a.frequency * a.avg_impact))
    .slice(0, 5)

  const summary: SimulationSummary = {
    simulations_run: numSimulations,
    base_deal_value: baseDealValue,
    mean_value: Math.round(mean),
    median_value: Math.round(median),
    std_dev: Math.round(stdDev),
    min_value: Math.round(finalValues[0]),
    max_value: Math.round(finalValues[finalValues.length - 1]),
    value_at_risk_95: Math.round(var95),
    value_at_risk_99: Math.round(var99),
    expected_shortfall: Math.round(expectedShortfall),
    prob_value_below_80: Math.round(probBelow80 * 100 * 10) / 10,
    prob_value_below_90: Math.round(probBelow90 * 100 * 10) / 10,
    prob_value_above_110: Math.round(probAbove110 * 100 * 10) / 10,
    distribution,
    top_risks: topRisks,
  }

  return { results, summary }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { 
      documentId, 
      baseDealValue = 100000000, // Default $100M 
      simulations = 10000,
      customRisks 
    } = body

    console.log('Starting Monte Carlo simulation...')

    // Get risk factors
    let riskFactors: RiskFactor[]

    if (customRisks && customRisks.length > 0) {
      riskFactors = customRisks
    } else if (documentId) {
      // Extract from document
      const { data: document } = await supabase
        .from('documents')
        .select('extracted_text')
        .eq('id', documentId)
        .single()

      if (document?.extracted_text) {
        riskFactors = await extractRiskFactors(document.extracted_text)
      } else {
        riskFactors = getDefaultRiskFactors()
      }
    } else {
      riskFactors = getDefaultRiskFactors()
    }

    console.log(`Using ${riskFactors.length} risk factors`)

    // Run simulation
    const { results, summary } = runMonteCarloSimulation(
      baseDealValue,
      riskFactors,
      Math.min(simulations, 50000) // Cap at 50k
    )

    // Log audit
    try {
      supabase.from('audit_logs').insert({
        event_type: 'simulation',
        action: 'monte_carlo_risk',
        details: {
          document_id: documentId,
          base_value: baseDealValue,
          simulations: summary.simulations_run,
          var_95: summary.value_at_risk_95,
          processing_time_ms: Date.now() - startTime,
        },
      })
    } catch (e) {
      console.log('Audit error:', e)
    }

    return NextResponse.json({
      success: true,
      simulation: {
        // Configuration
        config: {
          base_deal_value: baseDealValue,
          simulations_run: summary.simulations_run,
          risk_factors_count: riskFactors.length,
        },

        // Risk factors used
        risk_factors: riskFactors,

        // Summary statistics
        summary: {
          expected_value: summary.mean_value,
          median_value: summary.median_value,
          standard_deviation: summary.std_dev,
          min_scenario: summary.min_value,
          max_scenario: summary.max_value,
        },

        // Risk metrics
        risk_metrics: {
          value_at_risk_95: summary.value_at_risk_95,
          value_at_risk_99: summary.value_at_risk_99,
          expected_shortfall: summary.expected_shortfall,
          var_95_percent_of_base: Math.round((summary.value_at_risk_95 / baseDealValue) * 100),
          var_99_percent_of_base: Math.round((summary.value_at_risk_99 / baseDealValue) * 100),
        },

        // Probability analysis
        probabilities: {
          below_80_percent: summary.prob_value_below_80,
          below_90_percent: summary.prob_value_below_90,
          above_110_percent: summary.prob_value_above_110,
        },

        // Distribution
        distribution: summary.distribution,

        // Top risks
        top_risk_contributors: summary.top_risks,

        // Sample scenarios (worst 5)
        worst_scenarios: results
          .sort((a, b) => a.final_value - b.final_value)
          .slice(0, 5)
          .map(r => ({
            value: Math.round(r.final_value),
            impact_percent: Math.round(r.total_impact_percent * 10) / 10,
            risks_triggered: r.triggered_risks,
          })),

        processing_time_ms: Date.now() - startTime,
      },
    })

  } catch (error) {
    console.error('Simulation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Simulation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/risk-simulation',
    description: 'Monte Carlo risk simulation for M&A deal value',
    method: 'POST',
    body: {
      documentId: 'uuid - Document to extract risks from (optional)',
      baseDealValue: 'number - Base deal value in dollars (default: 100000000)',
      simulations: 'number - Number of simulations to run (default: 10000, max: 50000)',
      customRisks: 'array - Custom risk factors (optional)',
    },
    outputs: {
      summary: 'Expected value, median, standard deviation',
      risk_metrics: 'VaR 95%, VaR 99%, Expected Shortfall',
      probabilities: 'Probability of various value outcomes',
      distribution: 'Value distribution histogram',
      top_risks: 'Highest impact risk factors',
      worst_scenarios: 'Sample worst-case scenarios',
    },
  })
}
