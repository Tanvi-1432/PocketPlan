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

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'

export interface Transaction {
  id: string
  title: string
  amount: number
  type: TransactionType
  category: Category
  date: string              // ISO date string: "YYYY-MM-DD"
  note?: string
  tags?: string[]
  // Sync fields — only present on imported transactions
  accountId?: string
  institutionName?: string
  source?: TransactionSource
  importedAt?: string       // ISO datetime string
  // Auto-categorization
  autoCategorized?: boolean
  categoryOverridden?: boolean
  // Recurring
  isRecurring?: boolean
  recurringFrequency?: RecurringFrequency
  nextOccurrence?: string   // ISO date string: "YYYY-MM-DD"
  recurringSeriesId?: string
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

// ---- Subscription detection ----

export interface DetectedSubscription {
  seriesKey: string         // normalized merchant key
  title: string             // display name
  amount: number            // typical amount
  frequency: RecurringFrequency
  lastCharged: string       // ISO date
  nextExpected: string      // ISO date
  occurrences: number       // how many times detected
  category: Category
}

// ---- Financial health ----

export interface HealthFactor {
  label: string
  score: number             // 0-100
  weight: number            // relative weight
  description: string
  suggestion?: string
}

export interface FinancialHealthScore {
  total: number             // 0-100 weighted composite
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  factors: HealthFactor[]
}

// ---- Undo ----

export type UndoableAction =
  | { type: 'DELETE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_BUDGET'; payload: Budget }
  | { type: 'DELETE_GOAL'; payload: SavingsGoal }

// ---- Settings ----

export type ThemePreference = 'light' | 'dark' | 'system'
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'
export type DateFormatPreference = 'MMM D, YYYY' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'

export interface AppSettings {
  theme: ThemePreference
  currency: CurrencyCode
  dateFormat: DateFormatPreference
  showCents: boolean
  compactNumbers: boolean
}

// ---- Analytics ----

export interface CategoryTrend {
  category: Category
  months: { month: string; total: number }[]
  delta: number             // % change last month vs prev month
}

export interface SpendingComparison {
  category: Category
  thisMonth: number
  lastMonth: number
  delta: number             // % change
  deltaAmount: number
}

export interface CashFlowForecast {
  projectedBalance: number
  remainingDays: number
  projectedIncome: number
  projectedExpenses: number
  safeToSpendDaily: number
  confidence: 'high' | 'medium' | 'low'
}
