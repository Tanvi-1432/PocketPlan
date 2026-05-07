import { useState, type FormEvent } from 'react'
import type { Transaction, TransactionType, Category, RecurringFrequency } from '../../types'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants'
import { todayISO } from '../../utils'
import { autoDetectCategory } from '../../utils/categorization'
import { Button, Input, Select } from '../ui'
import type { SelectOption } from '../ui'

interface TransactionFormProps {
  initial?: Transaction
  onSubmit: (data: Omit<Transaction, 'id'>) => void
  onCancel: () => void
}

const TYPE_OPTIONS: SelectOption[] = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
]

const FREQUENCY_OPTIONS: SelectOption[] = [
  { value: 'daily',    label: 'Daily'     },
  { value: 'weekly',   label: 'Weekly'    },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly',  label: 'Monthly'   },
  { value: 'yearly',   label: 'Yearly'    },
]

function categoryOptions(type: TransactionType): SelectOption[] {
  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  return cats.map((c) => ({ value: c, label: c }))
}

interface FormState {
  title: string
  amount: string
  type: TransactionType
  category: Category
  date: string
  note: string
  isRecurring: boolean
  recurringFrequency: RecurringFrequency
  categoryOverridden: boolean
}

function initialState(t?: Transaction): FormState {
  return {
    title: t?.title ?? '',
    amount: t?.amount.toString() ?? '',
    type: t?.type ?? 'expense',
    category: t?.category ?? 'Food',
    date: t?.date ?? todayISO(),
    note: t?.note ?? '',
    isRecurring: t?.isRecurring ?? false,
    recurringFrequency: t?.recurringFrequency ?? 'monthly',
    categoryOverridden: t?.categoryOverridden ?? false,
  }
}

export default function TransactionForm({ initial, onSubmit, onCancel }: TransactionFormProps) {
  const [form, setForm] = useState<FormState>(() => initialState(initial))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [autoCatSuggestion, setAutoCatSuggestion] = useState<Category | null>(null)

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'type') {
        const cats = value === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
        if (!cats.includes(next.category)) {
          next.category = cats[0]
          next.categoryOverridden = false
        }
      }
      return next
    })
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handleTitleBlur() {
    if (form.categoryOverridden || !form.title.trim()) return
    const { category, confident } = autoDetectCategory(form.title.trim(), form.type)
    const cats = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    if (confident && cats.includes(category) && category !== form.category) {
      setAutoCatSuggestion(category)
      setForm((prev) => ({ ...prev, category, categoryOverridden: false }))
    }
  }

  function handleCategoryChange(cat: Category) {
    setAutoCatSuggestion(null)
    setField('category', cat)
    setField('categoryOverridden', true)
  }

  function validate(): boolean {
    const next: typeof errors = {}
    if (!form.title.trim()) next.title = 'Title is required'
    const amt = parseFloat(form.amount)
    if (!form.amount || isNaN(amt) || amt <= 0) next.amount = 'Enter a valid amount greater than 0'
    if (!form.date) next.date = 'Date is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const wasAutoCat = autoCatSuggestion !== null && !form.categoryOverridden
    onSubmit({
      title: form.title.trim(),
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
      note: form.note.trim() || undefined,
      isRecurring: form.isRecurring || undefined,
      recurringFrequency: form.isRecurring ? form.recurringFrequency : undefined,
      autoCategorized: wasAutoCat || undefined,
      categoryOverridden: form.categoryOverridden || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Title"
        placeholder="e.g. Whole Foods Market"
        value={form.title}
        onChange={(e) => setField('title', e.target.value)}
        onBlur={handleTitleBlur}
        error={errors.title}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Type"
          options={TYPE_OPTIONS}
          value={form.type}
          onChange={(e) => setField('type', e.target.value as TransactionType)}
        />
        <Input
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => setField('amount', e.target.value)}
          error={errors.amount}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Select
            label="Category"
            options={categoryOptions(form.type)}
            value={form.category}
            onChange={(e) => handleCategoryChange(e.target.value as Category)}
          />
          {autoCatSuggestion && !form.categoryOverridden && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
              Auto-detected from merchant name
            </p>
          )}
        </div>
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => setField('date', e.target.value)}
          error={errors.date}
        />
      </div>

      <Input
        label="Note (optional)"
        placeholder="Any extra details…"
        value={form.note}
        onChange={(e) => setField('note', e.target.value)}
      />

      {/* Recurring */}
      <div className="flex flex-col gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.isRecurring}
            onChange={(e) => setField('isRecurring', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Recurring transaction</span>
        </label>
        {form.isRecurring && (
          <Select
            label="Frequency"
            options={FREQUENCY_OPTIONS}
            value={form.recurringFrequency}
            onChange={(e) => setField('recurringFrequency', e.target.value as RecurringFrequency)}
          />
        )}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? 'Save changes' : 'Add transaction'}</Button>
      </div>
    </form>
  )
}
