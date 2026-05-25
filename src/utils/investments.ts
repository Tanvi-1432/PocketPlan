import type { InvestmentHolding, ChartDataPoint } from '../types'

/**
 * Investment and net-worth calculations.
 *
 * Holdings supply portfolio math. App-wide net worth lives in
 * `financialTotals.ts` so every page uses the same source-of-truth formula.
 */

export function getTotalPortfolioValue(holdings: InvestmentHolding[]): number {
  return holdings.reduce((sum, h) => sum + h.marketValue, 0)
}

export function getTotalGainLoss(holdings: InvestmentHolding[]): number {
  return holdings.reduce((sum, h) => sum + h.gainLoss, 0)
}

export function getTotalCostBasis(holdings: InvestmentHolding[]): number {
  return holdings.reduce((sum, h) => sum + h.quantity * h.averageCost, 0)
}

export function getOverallGainLossPercent(holdings: InvestmentHolding[]): number {
  const costBasis = getTotalCostBasis(holdings)
  if (costBasis === 0) return 0
  // Overall return is gain/loss divided by the amount originally invested.
  return (getTotalGainLoss(holdings) / costBasis) * 100
}

export function getAllocationChartData(holdings: InvestmentHolding[]): ChartDataPoint[] {
  const total = getTotalPortfolioValue(holdings)
  if (total === 0) return []
  return holdings
    // Convert each holding's market value into a portfolio percentage.
    .map((h) => ({ name: h.symbol, value: parseFloat(((h.marketValue / total) * 100).toFixed(2)) }))
    .sort((a, b) => b.value - a.value)
}

export function getHoldingsByAccount(
  holdings: InvestmentHolding[],
  accountId: string
): InvestmentHolding[] {
  return holdings.filter((h) => h.accountId === accountId)
}
