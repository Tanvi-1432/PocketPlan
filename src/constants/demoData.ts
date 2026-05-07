import type { ConnectedAccount, InvestmentHolding, Transaction, Budget, SavingsGoal } from '../types'

// ---------------------------------------------------------------------------
// Stable account IDs — used as foreign keys in transactions and holdings
// ---------------------------------------------------------------------------
export const DEMO_ACCOUNT_IDS = {
  chaseChecking: 'demo-acc-chase-chk',
  chaseSavings:  'demo-acc-chase-sav',
  capitalOne:    'demo-acc-cap1-cc',
  fidelity:      'demo-acc-fid-brok',
  robinhood:     'demo-acc-rh-brok',
}

// ---------------------------------------------------------------------------
// Accounts — stable IDs, lastSynced populated at runtime
// ---------------------------------------------------------------------------
export function buildDemoAccounts(lastSynced: string = new Date().toISOString()): ConnectedAccount[] {
  return [
    { id: DEMO_ACCOUNT_IDS.chaseChecking, institutionName: 'Chase',       accountName: 'Total Checking', accountType: 'Checking',   balance: 3250.75,  currency: 'USD', lastSynced, status: 'connected' },
    { id: DEMO_ACCOUNT_IDS.chaseSavings,  institutionName: 'Chase',       accountName: 'Savings',        accountType: 'Savings',    balance: 8400.00,  currency: 'USD', lastSynced, status: 'connected' },
    { id: DEMO_ACCOUNT_IDS.capitalOne,    institutionName: 'Capital One', accountName: 'Quicksilver',    accountType: 'Credit Card', balance: -642.35, currency: 'USD', lastSynced, status: 'connected' },
    { id: DEMO_ACCOUNT_IDS.fidelity,      institutionName: 'Fidelity',    accountName: 'Brokerage',      accountType: 'Brokerage',  balance: 15680.42, currency: 'USD', lastSynced, status: 'connected' },
    { id: DEMO_ACCOUNT_IDS.robinhood,     institutionName: 'Robinhood',   accountName: 'Investing',      accountType: 'Brokerage',  balance: 4275.90,  currency: 'USD', lastSynced, status: 'connected' },
  ]
}

// Keep legacy export for backward compat with syncAccounts
export const DEMO_ACCOUNTS = buildDemoAccounts()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Synced transactions — STABLE IDs so upsert never duplicates
// ---------------------------------------------------------------------------
export function buildDemoTransactions(): Transaction[] {
  const { chaseChecking, chaseSavings, capitalOne } = DEMO_ACCOUNT_IDS
  const now = new Date().toISOString()

  function synced(accountId: string, institution: string) {
    return { accountId, institutionName: institution, source: 'synced' as const, importedAt: now }
  }

  return [
    { id: 'demo-tx-payroll',       title: 'JPMorgan Chase Payroll', amount: 3200.00, type: 'income',  category: 'Salary',        date: daysAgo(1),  ...synced(chaseChecking, 'Chase') },
    { id: 'demo-tx-interest',      title: 'Interest Payment',       amount: 12.50,   type: 'income',  category: 'Investment',    date: daysAgo(3),  ...synced(chaseSavings,  'Chase') },
    { id: 'demo-tx-dividend-schd', title: 'Dividend — SCHD',        amount: 47.80,   type: 'income',  category: 'Investment',    date: daysAgo(8),  ...synced(chaseChecking, 'Chase') },
    { id: 'demo-tx-rent',          title: 'Rent Payment',           amount: 1450.00, type: 'expense', category: 'Housing',       date: daysAgo(2),  ...synced(chaseChecking, 'Chase') },
    { id: 'demo-tx-wholefoods',    title: 'Whole Foods Market',     amount: 94.30,   type: 'expense', category: 'Food',          date: daysAgo(2),  ...synced(capitalOne,    'Capital One') },
    { id: 'demo-tx-traderjoes',    title: "Trader Joe's",           amount: 61.45,   type: 'expense', category: 'Food',          date: daysAgo(7),  ...synced(capitalOne,    'Capital One') },
    { id: 'demo-tx-chipotle',      title: 'Chipotle',               amount: 14.75,   type: 'expense', category: 'Food',          date: daysAgo(4),  ...synced(capitalOne,    'Capital One') },
    { id: 'demo-tx-starbucks',     title: 'Starbucks',              amount: 6.85,    type: 'expense', category: 'Food',          date: daysAgo(1),  ...synced(capitalOne,    'Capital One') },
    { id: 'demo-tx-shell',         title: 'Shell Gas Station',      amount: 52.40,   type: 'expense', category: 'Transport',     date: daysAgo(5),  ...synced(capitalOne,    'Capital One') },
    { id: 'demo-tx-spotify',       title: 'Spotify Premium',        amount: 10.99,   type: 'expense', category: 'Entertainment', date: daysAgo(10), ...synced(capitalOne,    'Capital One') },
    { id: 'demo-tx-netflix',       title: 'Netflix',                amount: 15.49,   type: 'expense', category: 'Entertainment', date: daysAgo(12), ...synced(capitalOne,    'Capital One') },
    { id: 'demo-tx-amazon',        title: 'Amazon Order',           amount: 38.99,   type: 'expense', category: 'Shopping',      date: daysAgo(3),  ...synced(capitalOne,    'Capital One') },
    { id: 'demo-tx-hm',            title: 'H&M Clothing',           amount: 72.00,   type: 'expense', category: 'Shopping',      date: daysAgo(9),  ...synced(capitalOne,    'Capital One') },
    { id: 'demo-tx-gym',           title: 'Planet Fitness',         amount: 24.99,   type: 'expense', category: 'Healthcare',    date: daysAgo(15), ...synced(capitalOne,    'Capital One') },
    { id: 'demo-tx-verizon',       title: 'Verizon Phone Bill',     amount: 85.00,   type: 'expense', category: 'Other',         date: daysAgo(6),  ...synced(capitalOne,    'Capital One') },
    { id: 'demo-tx-geico',         title: 'GEICO Car Insurance',    amount: 132.00,  type: 'expense', category: 'Transport',     date: daysAgo(14), ...synced(chaseChecking, 'Chase') },
  ]
}

// ---------------------------------------------------------------------------
// Manual demo transactions — STABLE IDs
// ---------------------------------------------------------------------------
export function buildManualDemoTransactions(): Transaction[] {
  return [
    { id: 'demo-manual-salary',    title: 'Monthly Salary',    amount: 4500.00, type: 'income',  category: 'Salary',        date: daysAgo(1),  source: 'manual' },
    { id: 'demo-manual-freelance', title: 'Freelance Project', amount: 850.00,  type: 'income',  category: 'Freelance',     date: daysAgo(5),  source: 'manual' },
    { id: 'demo-manual-dividend',  title: 'Dividend Income',   amount: 42.50,   type: 'income',  category: 'Investment',    date: daysAgo(10), source: 'manual' },
    { id: 'demo-manual-rent',      title: 'Rent',              amount: 1400.00, type: 'expense', category: 'Housing',       date: daysAgo(2),  source: 'manual' },
    { id: 'demo-manual-groceries', title: 'Grocery Shopping',  amount: 112.40,  type: 'expense', category: 'Food',          date: daysAgo(3),  source: 'manual' },
    { id: 'demo-manual-dinner',    title: 'Restaurant Dinner', amount: 58.00,   type: 'expense', category: 'Food',          date: daysAgo(6),  source: 'manual' },
    { id: 'demo-manual-gas',       title: 'Gas',               amount: 48.00,   type: 'expense', category: 'Transport',     date: daysAgo(4),  source: 'manual' },
    { id: 'demo-manual-spotify',   title: 'Spotify',           amount: 10.99,   type: 'expense', category: 'Entertainment', date: daysAgo(7),  source: 'manual' },
    { id: 'demo-manual-netflix',   title: 'Netflix',           amount: 15.49,   type: 'expense', category: 'Entertainment', date: daysAgo(8),  source: 'manual' },
    { id: 'demo-manual-amazon',    title: 'Amazon Order',      amount: 34.99,   type: 'expense', category: 'Shopping',      date: daysAgo(5),  source: 'manual' },
    { id: 'demo-manual-gym',       title: 'Gym Membership',    amount: 29.99,   type: 'expense', category: 'Healthcare',    date: daysAgo(12), source: 'manual' },
    { id: 'demo-manual-phone',     title: 'Phone Bill',        amount: 80.00,   type: 'expense', category: 'Other',         date: daysAgo(9),  source: 'manual' },
    { id: 'demo-manual-coffee',    title: 'Coffee Shop',       amount: 18.50,   type: 'expense', category: 'Food',          date: daysAgo(1),  source: 'manual' },
    { id: 'demo-manual-course',    title: 'Online Course',     amount: 49.00,   type: 'expense', category: 'Education',     date: daysAgo(14), source: 'manual' },
  ]
}

// ---------------------------------------------------------------------------
// Budgets — STABLE IDs keyed by category+month
// ---------------------------------------------------------------------------
export function buildDemoBudgets(): Budget[] {
  const month = currentMonth()
  return [
    { id: `demo-budget-housing-${month}`,       category: 'Housing',       limit: 1500, month },
    { id: `demo-budget-food-${month}`,          category: 'Food',          limit: 400,  month },
    { id: `demo-budget-transport-${month}`,     category: 'Transport',     limit: 200,  month },
    { id: `demo-budget-entertainment-${month}`, category: 'Entertainment', limit: 60,   month },
    { id: `demo-budget-shopping-${month}`,      category: 'Shopping',      limit: 150,  month },
    { id: `demo-budget-healthcare-${month}`,    category: 'Healthcare',    limit: 50,   month },
  ]
}

// ---------------------------------------------------------------------------
// Goals — STABLE IDs
// ---------------------------------------------------------------------------
export function buildDemoGoals(): SavingsGoal[] {
  function futureDate(months: number): string {
    const d = new Date()
    d.setMonth(d.getMonth() + months)
    return d.toISOString().slice(0, 10)
  }
  return [
    { id: 'demo-goal-emergency', name: 'Emergency Fund',  targetAmount: 10000, currentAmount: 3200, deadline: futureDate(8) },
    { id: 'demo-goal-vacation',  name: 'Vacation — Japan', targetAmount: 3500,  currentAmount: 1100, deadline: futureDate(5) },
    { id: 'demo-goal-laptop',    name: 'New Laptop',       targetAmount: 1800,  currentAmount: 900,  deadline: futureDate(3) },
  ]
}

// Keep legacy export name
export const buildManualDemoGoals = () =>
  buildDemoGoals().map((g) => ({ name: g.name, targetAmount: g.targetAmount, currentAmount: g.currentAmount, deadline: g.deadline }))

// ---------------------------------------------------------------------------
// Holdings — STABLE IDs
// ---------------------------------------------------------------------------
export function buildDemoHoldings(): InvestmentHolding[] {
  function h(
    id: string, accountId: string, symbol: string, name: string,
    quantity: number, averageCost: number, currentPrice: number,
  ): InvestmentHolding {
    const marketValue = quantity * currentPrice
    const costBasis   = quantity * averageCost
    const gainLoss    = marketValue - costBasis
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0
    return { id, accountId, symbol, name, quantity, averageCost, currentPrice, marketValue, gainLoss, gainLossPercent }
  }
  return [
    h('demo-holding-fxaix', DEMO_ACCOUNT_IDS.fidelity,  'FXAIX', 'Fidelity 500 Index Fund',        42.5,  210.30, 248.76),
    h('demo-holding-msft',  DEMO_ACCOUNT_IDS.fidelity,  'MSFT',  'Microsoft Corporation',           18,    310.00, 378.92),
    h('demo-holding-schd',  DEMO_ACCOUNT_IDS.fidelity,  'SCHD',  'Schwab US Dividend Equity ETF',   60,     72.50,  82.14),
    h('demo-holding-voo',   DEMO_ACCOUNT_IDS.robinhood, 'VOO',   'Vanguard S&P 500 ETF',            12,    410.00, 452.33),
    h('demo-holding-aapl',  DEMO_ACCOUNT_IDS.robinhood, 'AAPL',  'Apple Inc.',                      20,    165.00, 185.42),
    h('demo-holding-nvda',  DEMO_ACCOUNT_IDS.robinhood, 'NVDA',  'NVIDIA Corporation',               8,    480.00, 875.60),
  ]
}
