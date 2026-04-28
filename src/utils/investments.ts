import type { InvestmentHolding, ConnectedAccount, NetWorthSummary, ChartDataPoint } from '../types'

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
  return (getTotalGainLoss(holdings) / costBasis) * 100
}

export function getAllocationChartData(holdings: InvestmentHolding[]): ChartDataPoint[] {
  const total = getTotalPortfolioValue(holdings)
  if (total === 0) return []
  return holdings
    .map((h) => ({ name: h.symbol, value: parseFloat(((h.marketValue / total) * 100).toFixed(2)) }))
    .sort((a, b) => b.value - a.value)
}

export function getHoldingsByAccount(
  holdings: InvestmentHolding[],
  accountId: string
): InvestmentHolding[] {
  return holdings.filter((h) => h.accountId === accountId)
}

export function getNetWorth(accounts: ConnectedAccount[]): NetWorthSummary {
  let cash = 0
  let investments = 0
  let creditCardDebt = 0

  for (const acc of accounts) {
    if (acc.accountType === 'Checking' || acc.accountType === 'Savings') {
      cash += acc.balance
    } else if (acc.accountType === 'Brokerage' || acc.accountType === 'Retirement') {
      investments += acc.balance
    } else if (acc.accountType === 'Credit Card') {
      creditCardDebt += Math.abs(acc.balance)
    }
  }

  return { cash, investments, creditCardDebt, netWorth: cash + investments - creditCardDebt }
}
