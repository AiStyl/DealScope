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

interface DealParameters {
  purchase_price: number
  equity_percentage: number
  debt_percentage: number
  earnout_amount: number
  earnout_probability: number
  synergies_year1: number
  synergies_year3: number
  integration_costs: number
  revenue_growth_rate: number
  ebitda_margin: number
  discount_rate: number
  tax_rate: number
}

interface ScenarioResult {
  name: string
  parameters: Partial<DealParameters>
  irr: number
  npv: number
  payback_years: number
  multiple_on_invested_capital: number
  break_even_year: number
}

// Calculate deal metrics
function calculateDealMetrics(params: DealParameters): {
  irr: number
  npv: number
  payback_years: number
  moic: number
  break_even_year: number
  cash_flows: number[]
} {
  const years = 7
  const cashFlows: number[] = []
  
  // Year 0: Initial investment
  const equityInvestment = params.purchase_price * (params.equity_percentage / 100)
  cashFlows.push(-equityInvestment - params.integration_costs)
  
  // Calculate yearly cash flows
  let cumulativeCashFlow = cashFlows[0]
  let paybackYear = years
  let breakEvenYear = years
  
  for (let year = 1; year <= years; year++) {
    // Revenue growth
    const revenueMultiplier = Math.pow(1 + params.revenue_growth_rate / 100, year)
    
    // EBITDA based on margin
    const baseEbitda = params.purchase_price * 0.15 // Assume 15% of purchase price as base EBITDA
    const ebitda = baseEbitda * revenueMultiplier * (params.ebitda_margin / 100)
    
    // Synergies (ramp up over 3 years)
    const synergyRamp = Math.min(year / 3, 1)
    const synergies = params.synergies_year1 + 
      (params.synergies_year3 - params.synergies_year1) * synergyRamp
    
    // Debt service (simplified - interest only on debt portion)
    const debtAmount = params.purchase_price * (params.debt_percentage / 100)
    const debtService = debtAmount * 0.06 // Assume 6% interest rate
    
    // Free cash flow
    const fcf = (ebitda + synergies - debtService) * (1 - params.tax_rate / 100)
    
    // Add earnout in year 2 if achieved
    let yearCashFlow = fcf
    if (year === 2 && params.earnout_amount > 0) {
      // Expected earnout value
      yearCashFlow += params.earnout_amount * (params.earnout_probability / 100)
    }
    
    cashFlows.push(yearCashFlow)
    cumulativeCashFlow += yearCashFlow
    
    if (cumulativeCashFlow >= 0 && paybackYear === years) {
      paybackYear = year
    }
    if (cumulativeCashFlow >= equityInvestment && breakEvenYear === years) {
      breakEvenYear = year
    }
  }
  
  // Terminal value in year 7 (5x EBITDA exit)
  const terminalEbitda = cashFlows[years] / (1 - params.tax_rate / 100) + 
    params.purchase_price * (params.debt_percentage / 100) * 0.06
  const terminalValue = terminalEbitda * 5
  const debtPayoff = params.purchase_price * (params.debt_percentage / 100)
  cashFlows[years] += terminalValue - debtPayoff
  
  // Calculate NPV
  let npv = 0
  for (let i = 0; i < cashFlows.length; i++) {
    npv += cashFlows[i] / Math.pow(1 + params.discount_rate / 100, i)
  }
  
  // Calculate IRR using Newton-Raphson method
  let irr = 0.15 // Initial guess
  for (let iter = 0; iter < 100; iter++) {
    let npvAtIrr = 0
    let derivativeNpv = 0
    for (let i = 0; i < cashFlows.length; i++) {
      npvAtIrr += cashFlows[i] / Math.pow(1 + irr, i)
      derivativeNpv -= i * cashFlows[i] / Math.pow(1 + irr, i + 1)
    }
    if (Math.abs(npvAtIrr) < 0.001) break
    irr = irr - npvAtIrr / derivativeNpv
    if (irr < -0.99) irr = -0.99
    if (irr > 10) irr = 10
  }
  
  // Calculate MOIC
  const totalDistributions = cashFlows.slice(1).reduce((a, b) => a + b, 0)
  const moic = totalDistributions / equityInvestment
  
  return {
    irr: irr * 100,
    npv,
    payback_years: paybackYear,
    moic,
    break_even_year: breakEvenYear,
    cash_flows: cashFlows,
  }
}

// Generate AI insights on deal structure
async function generateDealInsights(
  baseResult: ReturnType<typeof calculateDealMetrics>,
  scenarios: ScenarioResult[],
  params: DealParameters
): Promise<string[]> {
  const prompt = `Analyze this M&A deal structure and provide 3-5 key insights:

Deal Parameters:
- Purchase Price: $${(params.purchase_price / 1e6).toFixed(1)}M
- Equity: ${params.equity_percentage}% / Debt: ${params.debt_percentage}%
- Earnout: $${(params.earnout_amount / 1e6).toFixed(1)}M at ${params.earnout_probability}% probability
- Expected Synergies: $${(params.synergies_year3 / 1e6).toFixed(1)}M by Year 3
- Integration Costs: $${(params.integration_costs / 1e6).toFixed(1)}M

Results:
- IRR: ${baseResult.irr.toFixed(1)}%
- NPV: $${(baseResult.npv / 1e6).toFixed(1)}M
- MOIC: ${baseResult.moic.toFixed(2)}x
- Payback: ${baseResult.payback_years} years

Provide insights as a JSON array of strings:
["Insight 1", "Insight 2", "Insight 3"]`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type === 'text') {
      const match = content.text.match(/\[[\s\S]*\]/)
      if (match) {
        return JSON.parse(match[0])
      }
    }
  } catch (e) {
    console.error('AI insights error:', e)
  }

  return [
    `IRR of ${baseResult.irr.toFixed(1)}% ${baseResult.irr > 20 ? 'exceeds' : 'falls below'} typical PE hurdle rates of 20%`,
    `${baseResult.moic.toFixed(2)}x MOIC indicates ${baseResult.moic > 2 ? 'strong' : 'moderate'} return potential`,
    `${baseResult.payback_years}-year payback ${baseResult.payback_years <= 4 ? 'supports' : 'raises concerns about'} investment thesis`,
  ]
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const {
      purchase_price = 100000000,
      equity_percentage = 40,
      debt_percentage = 60,
      earnout_amount = 10000000,
      earnout_probability = 70,
      synergies_year1 = 2000000,
      synergies_year3 = 8000000,
      integration_costs = 5000000,
      revenue_growth_rate = 8,
      ebitda_margin = 18,
      discount_rate = 12,
      tax_rate = 25,
      run_scenarios = true,
    } = body

    const params: DealParameters = {
      purchase_price,
      equity_percentage,
      debt_percentage,
      earnout_amount,
      earnout_probability,
      synergies_year1,
      synergies_year3,
      integration_costs,
      revenue_growth_rate,
      ebitda_margin,
      discount_rate,
      tax_rate,
    }

    // Calculate base case
    const baseResult = calculateDealMetrics(params)

    // Run scenarios
    const scenarios: ScenarioResult[] = []
    
    if (run_scenarios) {
      // Upside scenario
      const upsideParams = {
        ...params,
        revenue_growth_rate: params.revenue_growth_rate * 1.25,
        synergies_year3: params.synergies_year3 * 1.3,
        earnout_probability: Math.min(params.earnout_probability * 1.2, 100),
      }
      const upsideResult = calculateDealMetrics(upsideParams)
      scenarios.push({
        name: 'Upside',
        parameters: {
          revenue_growth_rate: upsideParams.revenue_growth_rate,
          synergies_year3: upsideParams.synergies_year3,
        },
        irr: upsideResult.irr,
        npv: upsideResult.npv,
        payback_years: upsideResult.payback_years,
        multiple_on_invested_capital: upsideResult.moic,
        break_even_year: upsideResult.break_even_year,
      })

      // Downside scenario
      const downsideParams = {
        ...params,
        revenue_growth_rate: params.revenue_growth_rate * 0.5,
        synergies_year3: params.synergies_year3 * 0.6,
        earnout_probability: params.earnout_probability * 0.5,
        integration_costs: params.integration_costs * 1.3,
      }
      const downsideResult = calculateDealMetrics(downsideParams)
      scenarios.push({
        name: 'Downside',
        parameters: {
          revenue_growth_rate: downsideParams.revenue_growth_rate,
          synergies_year3: downsideParams.synergies_year3,
          integration_costs: downsideParams.integration_costs,
        },
        irr: downsideResult.irr,
        npv: downsideResult.npv,
        payback_years: downsideResult.payback_years,
        multiple_on_invested_capital: downsideResult.moic,
        break_even_year: downsideResult.break_even_year,
      })

      // No synergies scenario
      const noSynergiesParams = { ...params, synergies_year1: 0, synergies_year3: 0 }
      const noSynergiesResult = calculateDealMetrics(noSynergiesParams)
      scenarios.push({
        name: 'No Synergies',
        parameters: { synergies_year1: 0, synergies_year3: 0 },
        irr: noSynergiesResult.irr,
        npv: noSynergiesResult.npv,
        payback_years: noSynergiesResult.payback_years,
        multiple_on_invested_capital: noSynergiesResult.moic,
        break_even_year: noSynergiesResult.break_even_year,
      })

      // All equity scenario
      const allEquityParams = { ...params, equity_percentage: 100, debt_percentage: 0 }
      const allEquityResult = calculateDealMetrics(allEquityParams)
      scenarios.push({
        name: 'All Equity',
        parameters: { equity_percentage: 100, debt_percentage: 0 },
        irr: allEquityResult.irr,
        npv: allEquityResult.npv,
        payback_years: allEquityResult.payback_years,
        multiple_on_invested_capital: allEquityResult.moic,
        break_even_year: allEquityResult.break_even_year,
      })
    }

    // Generate AI insights
    const insights = await generateDealInsights(baseResult, scenarios, params)

    // Log audit
    try {
      await supabase.from('audit_logs').insert({
        event_type: 'simulation',
        action: 'deal_simulation',
        details: {
          purchase_price,
          irr: baseResult.irr,
          npv: baseResult.npv,
          scenarios_run: scenarios.length,
          processing_time_ms: Date.now() - startTime,
        },
      })
    } catch (e) {
      console.log('Audit error:', e)
    }

    return NextResponse.json({
      success: true,
      simulation: {
        parameters: params,
        
        base_case: {
          irr: Math.round(baseResult.irr * 10) / 10,
          npv: Math.round(baseResult.npv),
          moic: Math.round(baseResult.moic * 100) / 100,
          payback_years: baseResult.payback_years,
          break_even_year: baseResult.break_even_year,
          cash_flows: baseResult.cash_flows.map(cf => Math.round(cf)),
        },
        
        scenarios: scenarios.map(s => ({
          ...s,
          irr: Math.round(s.irr * 10) / 10,
          npv: Math.round(s.npv),
          multiple_on_invested_capital: Math.round(s.multiple_on_invested_capital * 100) / 100,
        })),
        
        insights,
        
        processing_time_ms: Date.now() - startTime,
      },
    })

  } catch (error) {
    console.error('Deal simulation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Deal simulation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/deal-simulator',
    description: 'Model M&A deal scenarios with financial projections',
    method: 'POST',
    parameters: {
      purchase_price: 'number - Total deal value (default: 100M)',
      equity_percentage: 'number - Equity portion 0-100 (default: 40)',
      debt_percentage: 'number - Debt portion 0-100 (default: 60)',
      earnout_amount: 'number - Contingent payment (default: 10M)',
      earnout_probability: 'number - Likelihood 0-100 (default: 70)',
      synergies_year1: 'number - Year 1 synergies (default: 2M)',
      synergies_year3: 'number - Year 3 synergies (default: 8M)',
      integration_costs: 'number - One-time costs (default: 5M)',
      revenue_growth_rate: 'number - Annual growth % (default: 8)',
      ebitda_margin: 'number - EBITDA margin % (default: 18)',
      discount_rate: 'number - WACC % (default: 12)',
      tax_rate: 'number - Tax rate % (default: 25)',
    },
    outputs: {
      irr: 'Internal Rate of Return',
      npv: 'Net Present Value',
      moic: 'Multiple on Invested Capital',
      payback_years: 'Years to recover investment',
      scenarios: 'Upside, Downside, No Synergies, All Equity',
      insights: 'AI-generated deal insights',
    },
  })
}
