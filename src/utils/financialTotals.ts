import type { ConnectedAccount, InvestmentHolding, NetWorthSummary, Transaction } from '../types'
import { filterByMonth, getBalance, getTotalExpenses, getTotalIncome } from './transactions'

type InvestmentSource = 'holdings' | 'accounts'

export interface FinancialTotals extends NetWorthSummary {
  investmentAccounts: number
  portfolioHoldings: number
  investmentSource: InvestmentSource
}

/**
 * Shared financial total calculations.
 *
 * Sign convention:
 * - Asset account balances are positive numbers.
 * - Credit card balances may be stored as negative balances by the account
 *   provider, but the app normalizes them into positive debt.
 * - Net worth always uses: cash + investments - creditCardDebt.
 */

function accountType(account: ConnectedAccount): string {
  return account.accountType.toLowerCase()
}

function isCashAccount(account: ConnectedAccount): boolean {
  const type = accountType(account)
  return type === 'checking' || type === 'savings'
}

function isInvestmentAccount(account: ConnectedAccount): boolean {
  const type = accountType(account)
  return type === 'brokerage' || type === 'retirement' || type === 'investment'
}

function isDebtAccount(account: ConnectedAccount): boolean {
  const type = accountType(account)
  return type === 'credit card' || type === 'loan' || type === 'debt'
}

export function calculateCashTotal(accounts: ConnectedAccount[]): number {
  return accounts
    .filter(isCashAccount)
    .reduce((sum, account) => sum + account.balance, 0)
}

export function calculateCreditDebtTotal(accounts: ConnectedAccount[]): number {
  return accounts
    .filter(isDebtAccount)
    .reduce((sum, account) => sum + Math.abs(account.balance), 0)
}

export function calculateInvestmentAccountTotal(accounts: ConnectedAccount[]): number {
  return accounts
    .filter(isInvestmentAccount)
    .reduce((sum, account) => sum + account.balance, 0)
}

export function calculatePortfolioHoldingsTotal(holdings: InvestmentHolding[]): number {
  return holdings.reduce((sum, holding) => sum + holding.marketValue, 0)
}

/**
 * Calculates the app-wide net worth summary.
 *
 * Investment source rule:
 * - If holdings exist, holdings market value is the canonical portfolio value.
 * - If holdings do not exist, fall back to investment account balances.
 *
 * This keeps Dashboard, Accounts, and Investments consistent while still
 * allowing the app to show a reasonable total before detailed holdings load.
 */
export function calculateNetWorth(
  accounts: ConnectedAccount[],
  holdings: InvestmentHolding[] = [],
): FinancialTotals {
  const cash = calculateCashTotal(accounts)
  const creditCardDebt = calculateCreditDebtTotal(accounts)
  const investmentAccounts = calculateInvestmentAccountTotal(accounts)
  const portfolioHoldings = calculatePortfolioHoldingsTotal(holdings)
  const useHoldings = holdings.length > 0
  const investments = useHoldings ? portfolioHoldings : investmentAccounts

  return {
    cash,
    investments,
    creditCardDebt,
    netWorth: cash + investments - creditCardDebt,
    investmentAccounts,
    portfolioHoldings,
    investmentSource: useHoldings ? 'holdings' : 'accounts',
  }
}

export function calculateMonthlyIncome(transactions: Transaction[], monthKey: string): number {
  return getTotalIncome(filterByMonth(transactions, monthKey))
}

export function calculateMonthlyExpenses(transactions: Transaction[], monthKey: string): number {
  return getTotalExpenses(filterByMonth(transactions, monthKey))
}

export function calculateMonthlyBalance(transactions: Transaction[], monthKey: string): number {
  return getBalance(filterByMonth(transactions, monthKey))
}

/**
 * Development-only consistency checker.
 *
 * It warns when detailed holdings and investment account balances disagree,
 * because that usually means pages could show different portfolio values if
 * they bypass the shared `calculateNetWorth` rule.
 */
export function validateFinancialTotals({
  accounts,
  holdings,
  tolerance = 0.01,
}: {
  accounts: ConnectedAccount[]
  holdings: InvestmentHolding[]
  tolerance?: number
}): void {
  if (!import.meta.env.DEV || holdings.length === 0) return

  const totals = calculateNetWorth(accounts, holdings)
  const diff = Math.abs(totals.portfolioHoldings - totals.investmentAccounts)

  if (diff > tolerance) {
    console.warn(
      '[PocketPlan] Investment totals mismatch',
      {
        investmentAccounts: totals.investmentAccounts,
        portfolioHoldings: totals.portfolioHoldings,
        canonicalInvestments: totals.investments,
        investmentSource: totals.investmentSource,
      },
    )
  }
}
