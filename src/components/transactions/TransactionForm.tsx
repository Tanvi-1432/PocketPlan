import { useState, type FormEvent } from 'react'
import type { Transaction, TransactionType, Category } from '../../types'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants'
import { todayISO } from '../../utils'
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
}

function initialState(t?: Transaction): FormState {
  return {
    title: t?.title ?? '',
    amount: t?.amount.toString() ?? '',
    type: t?.type ?? 'expense',
    category: t?.category ?? 'Food',
    date: t?.date ?? todayISO(),
    note: t?.note ?? '',
  }
}

export default function TransactionForm({ initial, onSubmit, onCancel }: TransactionFormProps) {
  const [form, setForm] = useState<FormState>(() => initialState(initial))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // Reset category when type changes so it stays valid
      if (key === 'type') {
        const cats = value === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
        if (!cats.includes(next.category)) next.category = cats[0]
      }
      return next
    })
    setErrors((prev) => ({ ...prev, [key]: undefined }))
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
    onSubmit({
      title: form.title.trim(),
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
      note: form.note.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Title"
        placeholder="e.g. Grocery run"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        error={errors.title}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Type"
          options={TYPE_OPTIONS}
          value={form.type}
          onChange={(e) => set('type', e.target.value as TransactionType)}
        />
        <Input
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => set('amount', e.target.value)}
          error={errors.amount}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Category"
          options={categoryOptions(form.type)}
          value={form.category}
          onChange={(e) => set('category', e.target.value as Category)}
        />
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
          error={errors.date}
        />
      </div>

      <Input
        label="Note (optional)"
        placeholder="Any extra details…"
        value={form.note}
        onChange={(e) => set('note', e.target.value)}
      />

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initial ? 'Save changes' : 'Add transaction'}
        </Button>
      </div>
    </form>
  )
}
