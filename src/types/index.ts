export type TransactionType = 'income' | 'expense'

export type Category =
  | 'Housing'
  | 'Food'
  | 'Transport'
  | 'Healthcare'
  | 'Entertainment'
  | 'Shopping'
  | 'Education'
  | 'Savings'
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Other'

export type TransactionSource = 'manual' | 'synced'

export interface Transaction {
  id: string
  title: string
  amount: number
  type: TransactionType
  category: Category
  date: string              // ISO date string: "YYYY-MM-DD"
  note?: string
  // Sync fields — only present on imported transactions
  accountId?: string
  institutionName?: string
  source?: TransactionSource
  importedAt?: string       // ISO datetime string
}

export interface Budget {
  id: string
  category: Category
  limit: number
  month: string             // "YYYY-MM"
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string          // ISO date string: "YYYY-MM-DD"
}

// ---- Connected accounts ----

export type AccountType = 'Checking' | 'Savings' | 'Credit Card' | 'Brokerage' | 'Retirement'
export type AccountStatus = 'connected' | 'syncing' | 'error'

export interface ConnectedAccount {
  id: string
  institutionName: string
  accountName: string
  accountType: AccountType
  balance: number
  currency: string          // e.g. "USD"
  lastSynced: string | null // ISO datetime string
  status: AccountStatus
}

// ---- Investment holdings ----

export interface InvestmentHolding {
  id: string
  accountId: string
  symbol: string
  name: string
  quantity: number
  averageCost: number
  currentPrice: number
  marketValue: number
  gainLoss: number
  gainLossPercent: number
}

// ---- Summary / derived types ----

export interface MonthlySummary {
  month: string             // "YYYY-MM"
  totalIncome: number
  totalExpenses: number
  balance: number
}

export interface CategorySummary {
  category: Category
  total: number
}

export interface BudgetProgress {
  budget: Budget
  spent: number
  remaining: number
  isOverBudget: boolean
  percentUsed: number
}

export interface ChartDataPoint {
  name: string
  value: number
}

export interface MonthlyChartPoint {
  month: string
  income: number
  expenses: number
}

export interface NetWorthSummary {
  cash: number
  investments: number
  creditCardDebt: number
  netWorth: number
}
