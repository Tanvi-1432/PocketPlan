import type { Category, TransactionType } from '../types'

export const EXPENSE_CATEGORIES: Category[] = [
  'Housing',
  'Food',
  'Transport',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Savings',
  'Other',
]

export const INCOME_CATEGORIES: Category[] = [
  'Salary',
  'Freelance',
  'Investment',
  'Other',
]

export const ALL_CATEGORIES: Category[] = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
]

export const TRANSACTION_TYPES: TransactionType[] = ['income', 'expense']

export const CATEGORY_COLORS: Record<Category, string> = {
  Housing: '#6366f1',
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Healthcare: '#10b981',
  Entertainment: '#ec4899',
  Shopping: '#f97316',
  Education: '#8b5cf6',
  Savings: '#14b8a6',
  Salary: '#22c55e',
  Freelance: '#84cc16',
  Investment: '#06b6d4',
  Other: '#94a3b8',
}
