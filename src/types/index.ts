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

export interface Transaction {
  id: string
  title: string
  amount: number
  type: TransactionType
  category: Category
  date: string        // ISO date string: "YYYY-MM-DD"
  note?: string
}

export interface Budget {
  id: string
  category: Category
  limit: number
  month: string       // "YYYY-MM"
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string    // ISO date string: "YYYY-MM-DD"
}

// ---- Summary / derived types ----

export interface MonthlySummary {
  month: string       // "YYYY-MM"
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
