import { v4 as uuidv4 } from 'uuid'
import type { ConnectedAccount, InvestmentHolding, Transaction, Budget } from '../types'

// Stable IDs so transactions can reference accounts consistently
export const DEMO_ACCOUNT_IDS = {
  chaseChecking: 'demo-acc-chase-chk',
  chaseSavings:  'demo-acc-chase-sav',
  capitalOne:    'demo-acc-cap1-cc',
  fidelity:      'demo-acc-fid-brok',
  robinhood:     'demo-acc-rh-brok',
}

const now = new Date().toISOString()

export const DEMO_ACCOUNTS: ConnectedAccount[] = [
  {
    id: DEMO_ACCOUNT_IDS.chaseChecking,
    institutionName: 'Chase',
    accountName: 'Total Checking',
    accountType: 'Checking',
    balance: 3250.75,
    currency: 'USD',
    lastSynced: now,
    status: 'connected',
  },
  {
    id: DEMO_ACCOUNT_IDS.chaseSavings,
    institutionName: 'Chase',
    accountName: 'Savings',
    accountType: 'Savings',
    balance: 8400.00,
    currency: 'USD',
    lastSynced: now,
    status: 'connected',
  },
  {
    id: DEMO_ACCOUNT_IDS.capitalOne,
    institutionName: 'Capital One',
    accountName: 'Quicksilver',
    accountType: 'Credit Card',
    balance: -642.35,
    currency: 'USD',
    lastSynced: now,
    status: 'connected',
  },
  {
    id: DEMO_ACCOUNT_IDS.fidelity,
    institutionName: 'Fidelity',
    accountName: 'Brokerage',
    accountType: 'Brokerage',
    balance: 15680.42,
    currency: 'USD',
    lastSynced: now,
    status: 'connected',
  },
  {
    id: DEMO_ACCOUNT_IDS.robinhood,
    institutionName: 'Robinhood',
    accountName: 'Investing',
    accountType: 'Brokerage',
    balance: 4275.90,
    currency: 'USD',
    lastSynced: now,
    status: 'connected',
  },
]

// Builds a date string relative to today (negative = past days)
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export function buildDemoTransactions(): Transaction[] {
  const { chaseChecking, chaseSavings, capitalOne } = DEMO_ACCOUNT_IDS
  const meta = (accountId: string, institution: string) => ({
    accountId,
    institutionName: institution,
    source: 'synced' as const,
    importedAt: now,
  })

  return [
    // Income
    { id: uuidv4(), title: 'JPMorgan Chase Payroll', amount: 3200.00, type: 'income', category: 'Salary',     date: daysAgo(1),  ...meta(chaseChecking, 'Chase') },
    { id: uuidv4(), title: 'Interest Payment',       amount: 12.50,   type: 'income', category: 'Investment', date: daysAgo(3),  ...meta(chaseSavings,  'Chase') },
    { id: uuidv4(), title: 'Dividend — SCHD',        amount: 47.80,   type: 'income', category: 'Investment', date: daysAgo(8),  ...meta(chaseChecking, 'Chase') },

    // Housing
    { id: uuidv4(), title: 'Rent Payment',           amount: 1450.00, type: 'expense', category: 'Housing',       date: daysAgo(2),  ...meta(chaseChecking, 'Chase') },

    // Food
    { id: uuidv4(), title: 'Whole Foods Market',     amount: 94.30,   type: 'expense', category: 'Food',          date: daysAgo(2),  ...meta(capitalOne,    'Capital One') },
    { id: uuidv4(), title: 'Trader Joe\'s',          amount: 61.45,   type: 'expense', category: 'Food',          date: daysAgo(7),  ...meta(capitalOne,    'Capital One') },
    { id: uuidv4(), title: 'Chipotle',               amount: 14.75,   type: 'expense', category: 'Food',          date: daysAgo(4),  ...meta(capitalOne,    'Capital One') },
    { id: uuidv4(), title: 'Starbucks',              amount: 6.85,    type: 'expense', category: 'Food',          date: daysAgo(1),  ...meta(capitalOne,    'Capital One') },

    // Transport
    { id: uuidv4(), title: 'Shell Gas Station',      amount: 52.40,   type: 'expense', category: 'Transport',     date: daysAgo(5),  ...meta(capitalOne,    'Capital One') },

    // Entertainment
    { id: uuidv4(), title: 'Spotify Premium',        amount: 10.99,   type: 'expense', category: 'Entertainment', date: daysAgo(10), ...meta(capitalOne,    'Capital One') },
    { id: uuidv4(), title: 'Netflix',                amount: 15.49,   type: 'expense', category: 'Entertainment', date: daysAgo(12), ...meta(capitalOne,    'Capital One') },

    // Shopping
    { id: uuidv4(), title: 'Amazon Order',           amount: 38.99,   type: 'expense', category: 'Shopping',      date: daysAgo(3),  ...meta(capitalOne,    'Capital One') },
    { id: uuidv4(), title: 'H&M Clothing',           amount: 72.00,   type: 'expense', category: 'Shopping',      date: daysAgo(9),  ...meta(capitalOne,    'Capital One') },

    // Healthcare
    { id: uuidv4(), title: 'Planet Fitness',         amount: 24.99,   type: 'expense', category: 'Healthcare',    date: daysAgo(15), ...meta(capitalOne,    'Capital One') },

    // Other
    { id: uuidv4(), title: 'Verizon Phone Bill',     amount: 85.00,   type: 'expense', category: 'Other',         date: daysAgo(6),  ...meta(capitalOne,    'Capital One') },
    { id: uuidv4(), title: 'GEICO Car Insurance',    amount: 132.00,  type: 'expense', category: 'Transport',     date: daysAgo(14), ...meta(chaseChecking, 'Chase') },
  ]
}

export function buildDemoHoldings(): InvestmentHolding[] {
  function holding(
    accountId: string,
    symbol: string,
    name: string,
    quantity: number,
    averageCost: number,
    currentPrice: number,
  ): InvestmentHolding {
    const marketValue = quantity * currentPrice
    const costBasis = quantity * averageCost
    const gainLoss = marketValue - costBasis
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0
    return { id: uuidv4(), accountId, symbol, name, quantity, averageCost, currentPrice, marketValue, gainLoss, gainLossPercent }
  }

  return [
    holding(DEMO_ACCOUNT_IDS.fidelity,   'FXAIX', 'Fidelity 500 Index Fund',        42.5,  210.30, 248.76),
    holding(DEMO_ACCOUNT_IDS.fidelity,   'MSFT',  'Microsoft Corporation',           18,    310.00, 378.92),
    holding(DEMO_ACCOUNT_IDS.fidelity,   'SCHD',  'Schwab US Dividend Equity ETF',   60,     72.50,  82.14),
    holding(DEMO_ACCOUNT_IDS.robinhood,  'VOO',   'Vanguard S&P 500 ETF',            12,    410.00, 452.33),
    holding(DEMO_ACCOUNT_IDS.robinhood,  'AAPL',  'Apple Inc.',                      20,    165.00, 185.42),
    holding(DEMO_ACCOUNT_IDS.robinhood,  'NVDA',  'NVIDIA Corporation',               8,    480.00, 875.60),
  ]
}

export function buildDemoBudgets(): Budget[] {
  const d = new Date()
  const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

  return [
    { id: uuidv4(), category: 'Housing',       limit: 1500, month },
    { id: uuidv4(), category: 'Food',          limit: 400,  month },
    { id: uuidv4(), category: 'Transport',     limit: 200,  month },
    { id: uuidv4(), category: 'Entertainment', limit: 60,   month },
    { id: uuidv4(), category: 'Shopping',      limit: 150,  month },
    { id: uuidv4(), category: 'Healthcare',    limit: 50,   month },
  ]
}
