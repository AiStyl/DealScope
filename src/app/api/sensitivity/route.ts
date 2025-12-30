import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SensitivityInput {
  name: string
  base_value: number
  min_value: number
  max_value: number
  unit: string
}

interface SensitivityResult {
  variable: string
  unit: string
  base_value: number
  low_value: number
  high_value: number
  base_irr: number
  low_irr: number
  high_irr: number
  irr_swing: number // Total swing from low to high
  sensitivity_rank: number
}

// Simplified IRR calculation for sensitivity
function calculateSimpleIRR(params: {
  purchasePrice: number
  equityPct: number
  synergies: number
  integrationCosts: number
  revenueGrowth: number
  ebitdaMargin: number
  discountRate: number
  exitMultiple: number
}): number {
  const years = 5
  const equityInvestment = params.purchasePrice * (params.equityPct / 100)
  const cashFlows: number[] = [-equityInvestment - params.integrationCosts]

  for (let year = 1; year <= years; year++) {
    const revenueMultiplier = Math.pow(1 + params.revenueGrowth / 100, year)
    const baseEbitda = params.purchasePrice * 0.12
    const ebitda = baseEbitda * revenueMultiplier * (params.ebitdaMargin / 100)
    const synergyRamp = Math.min(year / 3, 1)
    const synergies = params.synergies * synergyRamp
    const debtService = params.purchasePrice * ((100 - params.equityPct) / 100) * 0.06
    const fcf = (ebitda + synergies - debtService) * 0.75
    
    if (year === years) {
      const terminalValue = (ebitda + synergies) * params.exitMultiple
      const debtPayoff = params.purchasePrice * ((100 - params.equityPct) / 100)
      cashFlows.push(fcf + terminalValue - debtPayoff)
    } else {
      cashFlows.push(fcf)
    }
  }

  // Newton-Raphson IRR
  let irr = 0.15
  for (let iter = 0; iter < 50; iter++) {
    let npv = 0
    let derivative = 0
    for (let i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(1 + irr, i)
      derivative -= i * cashFlows[i] / Math.pow(1 + irr, i + 1)
    }
    if (Math.abs(npv) < 0.01) break
    irr = irr - npv / derivative
    irr = Math.max(-0.99, Math.min(5, irr))
  }

  return irr * 100
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const {
      purchase_price = 100000000,
      equity_percentage = 40,
      synergies = 8000000,
      integration_costs = 5000000,
      revenue_growth = 8,
      ebitda_margin = 18,
      discount_rate = 12,
      exit_multiple = 6,
    } = body

    // Define variables to analyze
    const variables: SensitivityInput[] = [
      { name: 'Purchase Price', base_value: purchase_price, min_value: purchase_price * 0.8, max_value: purchase_price * 1.2, unit: '$' },
      { name: 'Equity %', base_value: equity_percentage, min_value: 20, max_value: 80, unit: '%' },
      { name: 'Synergies', base_value: synergies, min_value: synergies * 0.3, max_value: synergies * 1.5, unit: '$' },
      { name: 'Integration Costs', base_value: integration_costs, min_value: integration_costs * 0.5, max_value: integration_costs * 2, unit: '$' },
      { name: 'Revenue Growth', base_value: revenue_growth, min_value: 0, max_value: 15, unit: '%' },
      { name: 'EBITDA Margin', base_value: ebitda_margin, min_value: 10, max_value: 30, unit: '%' },
      { name: 'Exit Multiple', base_value: exit_multiple, min_value: 4, max_value: 8, unit: 'x' },
    ]

    // Base case parameters
    const baseParams = {
      purchasePrice: purchase_price,
      equityPct: equity_percentage,
      synergies,
      integrationCosts: integration_costs,
      revenueGrowth: revenue_growth,
      ebitdaMargin: ebitda_margin,
      discountRate: discount_rate,
      exitMultiple: exit_multiple,
    }

    // Calculate base IRR
    const baseIRR = calculateSimpleIRR(baseParams)

    // Calculate sensitivity for each variable
    const results: SensitivityResult[] = variables.map(variable => {
      // Low case
      const lowParams = { ...baseParams }
      switch (variable.name) {
        case 'Purchase Price': lowParams.purchasePrice = variable.min_value; break
        case 'Equity %': lowParams.equityPct = variable.min_value; break
        case 'Synergies': lowParams.synergies = variable.min_value; break
        case 'Integration Costs': lowParams.integrationCosts = variable.min_value; break
        case 'Revenue Growth': lowParams.revenueGrowth = variable.min_value; break
        case 'EBITDA Margin': lowParams.ebitdaMargin = variable.min_value; break
        case 'Exit Multiple': lowParams.exitMultiple = variable.min_value; break
      }
      const lowIRR = calculateSimpleIRR(lowParams)

      // High case
      const highParams = { ...baseParams }
      switch (variable.name) {
        case 'Purchase Price': highParams.purchasePrice = variable.max_value; break
        case 'Equity %': highParams.equityPct = variable.max_value; break
        case 'Synergies': highParams.synergies = variable.max_value; break
        case 'Integration Costs': highParams.integrationCosts = variable.max_value; break
        case 'Revenue Growth': highParams.revenueGrowth = variable.max_value; break
        case 'EBITDA Margin': highParams.ebitdaMargin = variable.max_value; break
        case 'Exit Multiple': highParams.exitMultiple = variable.max_value; break
      }
      const highIRR = calculateSimpleIRR(highParams)

      return {
        variable: variable.name,
        unit: variable.unit,
        base_value: variable.base_value,
        low_value: variable.min_value,
        high_value: variable.max_value,
        base_irr: Math.round(baseIRR * 10) / 10,
        low_irr: Math.round(lowIRR * 10) / 10,
        high_irr: Math.round(highIRR * 10) / 10,
        irr_swing: Math.round(Math.abs(highIRR - lowIRR) * 10) / 10,
        sensitivity_rank: 0,
      }
    })

    // Rank by sensitivity (IRR swing)
    results.sort((a, b) => b.irr_swing - a.irr_swing)
    results.forEach((r, i) => r.sensitivity_rank = i + 1)

    // Generate breakeven analysis
    const breakevenAnalysis = {
      synergies_required_for_20pct_irr: calculateBreakeven('synergies', 20, baseParams),
      max_purchase_price_for_20pct_irr: calculateBreakeven('purchasePrice', 20, baseParams),
      min_exit_multiple_for_15pct_irr: calculateBreakeven('exitMultiple', 15, baseParams),
    }

    // Log audit
    try {
      await supabase.from('audit_logs').insert({
        event_type: 'analysis',
        action: 'sensitivity_analysis',
        details: {
          variables_analyzed: variables.length,
          base_irr: baseIRR,
          most_sensitive: results[0]?.variable,
          processing_time_ms: Date.now() - startTime,
        },
      })
    } catch (e) {
      console.log('Audit error:', e)
    }

    return NextResponse.json({
      success: true,
      analysis: {
        base_case: {
          irr: Math.round(baseIRR * 10) / 10,
          parameters: baseParams,
        },
        sensitivity_results: results,
        tornado_chart_data: results.map(r => ({
          variable: r.variable,
          low_irr: r.low_irr,
          base_irr: r.base_irr,
          high_irr: r.high_irr,
          downside: Math.round((r.low_irr - r.base_irr) * 10) / 10,
          upside: Math.round((r.high_irr - r.base_irr) * 10) / 10,
        })),
        breakeven_analysis: breakevenAnalysis,
        key_findings: [
          `${results[0]?.variable} is the most sensitive variable with ${results[0]?.irr_swing}% IRR swing`,
          `${results[1]?.variable} ranks second in sensitivity`,
          baseIRR >= 20 
            ? `Base case IRR of ${baseIRR.toFixed(1)}% exceeds typical 20% hurdle rate`
            : `Base case IRR of ${baseIRR.toFixed(1)}% falls below typical 20% hurdle rate`,
        ],
        processing_time_ms: Date.now() - startTime,
      },
    })

  } catch (error) {
    console.error('Sensitivity analysis error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Sensitivity analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Binary search for breakeven value
function calculateBreakeven(
  variable: string,
  targetIRR: number,
  baseParams: any
): number {
  let low = 0
  let high = variable === 'purchasePrice' ? baseParams.purchasePrice * 2 : 
             variable === 'exitMultiple' ? 12 : baseParams.synergies * 3
  
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2
    const testParams = { ...baseParams, [variable]: mid }
    const irr = calculateSimpleIRR(testParams)
    
    if (Math.abs(irr - targetIRR) < 0.1) {
      return Math.round(mid)
    }
    
    if ((variable === 'purchasePrice' && irr > targetIRR) ||
        (variable !== 'purchasePrice' && irr < targetIRR)) {
      if (variable === 'purchasePrice') low = mid
      else high = mid
    } else {
      if (variable === 'purchasePrice') high = mid
      else low = mid
    }
  }
  
  return Math.round((low + high) / 2)
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/sensitivity',
    description: 'Sensitivity analysis showing variable impact on IRR',
    method: 'POST',
    parameters: {
      purchase_price: 'number - Total deal value',
      equity_percentage: 'number - Equity portion',
      synergies: 'number - Expected synergies',
      integration_costs: 'number - One-time costs',
      revenue_growth: 'number - Annual growth %',
      ebitda_margin: 'number - EBITDA margin %',
      exit_multiple: 'number - Exit EV/EBITDA',
    },
    outputs: {
      sensitivity_results: 'IRR impact for each variable',
      tornado_chart_data: 'Data for tornado visualization',
      breakeven_analysis: 'Values needed to hit target IRRs',
      key_findings: 'AI-generated insights',
    },
  })
}
