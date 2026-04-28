import { useState, type FormEvent } from 'react'
import type { Budget, Category } from '../../types'
import { EXPENSE_CATEGORIES } from '../../constants'
import { currentMonthKey } from '../../utils'
import { Button, Input, Select } from '../ui'
import type { SelectOption } from '../ui'

interface BudgetFormProps {
  initial?: Budget
  onSubmit: (data: Omit<Budget, 'id'>) => void
  onCancel: () => void
}

const CATEGORY_OPTIONS: SelectOption[] = EXPENSE_CATEGORIES.map((c) => ({
  value: c,
  label: c,
}))

function monthOptions(): SelectOption[] {
  const options: SelectOption[] = []
  const now = new Date()
  for (let i = -1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    options.push({ value, label })
  }
  return options
}

interface FormState {
  category: Category
  limit: string
  month: string
}

function initialState(b?: Budget): FormState {
  return {
    category: b?.category ?? 'Food',
    limit: b?.limit.toString() ?? '',
    month: b?.month ?? currentMonthKey(),
  }
}

export default function BudgetForm({ initial, onSubmit, onCancel }: BudgetFormProps) {
  const [form, setForm] = useState<FormState>(() => initialState(initial))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const next: typeof errors = {}
    const limit = parseFloat(form.limit)
    if (!form.limit || isNaN(limit) || limit <= 0) next.limit = 'Enter a valid limit greater than 0'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      category: form.category,
      limit: parseFloat(form.limit),
      month: form.month,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select
        label="Category"
        options={CATEGORY_OPTIONS}
        value={form.category}
        onChange={(e) => set('category', e.target.value as Category)}
      />
      <Input
        label="Monthly limit"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="0.00"
        value={form.limit}
        onChange={(e) => set('limit', e.target.value)}
        error={errors.limit}
        hint="Maximum amount you want to spend in this category"
      />
      <Select
        label="Month"
        options={monthOptions()}
        value={form.month}
        onChange={(e) => set('month', e.target.value)}
      />
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initial ? 'Save changes' : 'Set budget'}
        </Button>
      </div>
    </form>
  )
}
