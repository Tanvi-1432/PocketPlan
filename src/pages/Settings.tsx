import { useRef } from 'react'
import { useSettingsStore } from '../store/settings'
import { useThemeStore } from '../store/theme'
import { useDemoData } from '../hooks'
import { useTransactionsStore } from '../store/transactions'
import { useBudgetsStore } from '../store/budgets'
import { useGoalsStore } from '../store/goals'
import {
  exportTransactionsCSV,
  exportBudgetsCSV,
  exportGoalsCSV,
  downloadCSV,
  parseTransactionsCSV,
} from '../utils/csv'
import { autoDetectCategory } from '../utils/categorization'
import { Button } from '../components/ui'
import type { ThemePreference, CurrencyCode, DateFormatPreference } from '../types'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
      <div className="shrink-0 ml-4">{children}</div>
    </div>
  )
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 gap-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
            value === o.value
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Settings() {
  const { settings, updateSettings, resetSettings } = useSettingsStore()
  const { preference: theme, setPreference }         = useThemeStore()
  const { loadDemoData, clearDemoData }               = useDemoData()
  const { transactions, addTransaction }              = useTransactionsStore()
  const { budgets }                                   = useBudgetsStore()
  const { goals }                                     = useGoalsStore()
  const importRef = useRef<HTMLInputElement>(null)

  function handleThemeChange(p: ThemePreference) {
    setPreference(p)
    updateSettings({ theme: p })
  }

  function handleExportTransactions() {
    downloadCSV(`pocketplan-transactions-${new Date().toISOString().slice(0, 10)}.csv`, exportTransactionsCSV(transactions))
  }

  function handleExportBudgets() {
    downloadCSV(`pocketplan-budgets-${new Date().toISOString().slice(0, 10)}.csv`, exportBudgetsCSV(budgets))
  }

  function handleExportGoals() {
    downloadCSV(`pocketplan-goals-${new Date().toISOString().slice(0, 10)}.csv`, exportGoalsCSV(goals))
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text !== 'string') return
      const rows = parseTransactionsCSV(text)
      let imported = 0
      for (const row of rows) {
        if (!row.valid) continue
        const { category: autoCat } = autoDetectCategory(row.title, row.type)
        addTransaction({
          title: row.title,
          amount: row.amount,
          type: row.type,
          category: row.category !== 'Other' ? row.category : autoCat,
          date: row.date,
          note: row.note || undefined,
          source: 'manual',
          autoCategorized: row.category === 'Other',
        })
        imported++
      }
      alert(`Imported ${imported} of ${rows.length} transactions.${rows.length - imported > 0 ? ` ${rows.length - imported} rows had errors.` : ''}`)
      if (importRef.current) importRef.current.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Preferences, data controls, and exports</p>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <Row label="Theme" sub="Controls light/dark mode across the app">
          <SegmentedControl<ThemePreference>
            options={[
              { value: 'light',  label: 'Light'  },
              { value: 'dark',   label: 'Dark'   },
              { value: 'system', label: 'System' },
            ]}
            value={theme}
            onChange={handleThemeChange}
          />
        </Row>
        <Row label="Show cents" sub="Display .00 on whole-dollar amounts">
          <button
            onClick={() => updateSettings({ showCents: !settings.showCents })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${settings.showCents ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            role="switch"
            aria-checked={settings.showCents}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${settings.showCents ? 'translate-x-4' : 'translate-x-1'}`} />
          </button>
        </Row>
        <Row label="Compact numbers" sub="Display $1.2k instead of $1,200">
          <button
            onClick={() => updateSettings({ compactNumbers: !settings.compactNumbers })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${settings.compactNumbers ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            role="switch"
            aria-checked={settings.compactNumbers}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${settings.compactNumbers ? 'translate-x-4' : 'translate-x-1'}`} />
          </button>
        </Row>
        <Row label="Currency">
          <SegmentedControl<CurrencyCode>
            options={[
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'GBP', label: 'GBP' },
            ]}
            value={settings.currency}
            onChange={(v) => updateSettings({ currency: v })}
          />
        </Row>
        <Row label="Date format">
          <select
            value={settings.dateFormat}
            onChange={(e) => updateSettings({ dateFormat: e.target.value as DateFormatPreference })}
            className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="MMM D, YYYY">Mar 5, 2026</option>
            <option value="MM/DD/YYYY">03/05/2026</option>
            <option value="DD/MM/YYYY">05/03/2026</option>
            <option value="YYYY-MM-DD">2026-03-05</option>
          </select>
        </Row>
      </Section>

      {/* Demo data */}
      <Section title="Demo Data">
        <Row label="Load demo experience" sub="Fills the app with realistic simulated data">
          <Button size="sm" variant="secondary" onClick={loadDemoData}>Load demo</Button>
        </Row>
        <Row label="Reset all data" sub="Removes all transactions, budgets, goals, and accounts">
          <Button size="sm" variant="danger" onClick={clearDemoData}>Reset</Button>
        </Row>
      </Section>

      {/* Export */}
      <Section title="Export Data">
        <Row label="Transactions CSV" sub={`${transactions.length} transactions`}>
          <Button size="sm" variant="secondary" onClick={handleExportTransactions} disabled={transactions.length === 0}>
            Export
          </Button>
        </Row>
        <Row label="Budgets CSV" sub={`${budgets.length} budgets`}>
          <Button size="sm" variant="secondary" onClick={handleExportBudgets} disabled={budgets.length === 0}>
            Export
          </Button>
        </Row>
        <Row label="Goals CSV" sub={`${goals.length} goals`}>
          <Button size="sm" variant="secondary" onClick={handleExportGoals} disabled={goals.length === 0}>
            Export
          </Button>
        </Row>
      </Section>

      {/* Import */}
      <Section title="Import Transactions">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Import a CSV file with columns: <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">date, title, amount, type, category, note</code>
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Categories are auto-detected if not provided. Amounts can be negative (treated as expenses).</p>
          <div>
            <input
              ref={importRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
              id="csv-import"
            />
            <Button size="sm" variant="secondary" onClick={() => importRef.current?.click()}>
              Choose CSV file
            </Button>
          </div>
        </div>
      </Section>

      {/* Reset settings */}
      <Section title="About">
        <Row label="PocketPlan" sub="Personal finance demo — all data is simulated locally">
          <span className="text-xs text-slate-400 dark:text-slate-500">v2.0</span>
        </Row>
        <Row label="Reset preferences" sub="Restore all settings to defaults">
          <Button size="sm" variant="ghost" onClick={resetSettings}>Reset</Button>
        </Row>
      </Section>
    </div>
  )
}
