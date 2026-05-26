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
import { formatCurrency, formatDate, todayISO } from '../utils'
import { autoDetectCategory } from '../utils/categorization'
import { Button } from '../components/ui'
import type { ThemePreference, CurrencyCode, DateFormatPreference } from '../types'

/**
 * Settings page.
 *
 * Responsibilities:
 * - Update persisted theme/formatting preferences.
 * - Load/reset demo data.
 * - Export local data to CSV and import transaction CSV files.
 */

// ── Small reusable primitives ──────────────────────────────────────────────

function GlassSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="glass-card p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.20), rgba(129,140,248,0.20))' }}>
          <svg className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
        </div>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
      </div>
      <div className="flex flex-col divide-y divide-slate-100/80 dark:divide-white/5">
        {children}
      </div>
    </section>
  )
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
      <div className="shrink-0 ml-6">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
        checked
          ? 'bg-violet-500'
          : 'bg-slate-200 dark:bg-slate-700'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? 'translate-x-4' : 'translate-x-1'
      }`} />
    </button>
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
    <div className="inline-flex rounded-xl p-0.5 gap-0.5"
      style={{ background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.15)' }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-150 ${
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

// ── Live preview card ──────────────────────────────────────────────────────

function LivePreview() {
  const { settings } = useSettingsStore()
  const sampleAmount = 3421.89
  const sampleDate   = todayISO()

  // This component subscribes to settings so users see formatting changes
  // immediately before leaving the page.
  return (
    <div className="rounded-2xl p-4 mt-5"
      style={{
        background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(129,140,248,0.10))',
        border: '1px solid rgba(167,139,250,0.20)',
      }}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-3">Live preview</p>
      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">Amount</p>
          <p className="text-sm font-bold number-display text-slate-800 dark:text-slate-200">
            {formatCurrency(sampleAmount)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">Large amount</p>
          <p className="text-sm font-bold number-display text-slate-800 dark:text-slate-200">
            {formatCurrency(12450)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">Date</p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {formatDate(sampleDate)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">Currency</p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{settings.currency}</p>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function Settings() {
  const { settings, updateSettings, resetSettings } = useSettingsStore()
  const { preference: theme, setPreference }         = useThemeStore()
  const { loadDemoData, clearDemoData }               = useDemoData()
  const { transactions, addTransaction }              = useTransactionsStore()
  const { budgets }                                   = useBudgetsStore()
  const { goals }                                     = useGoalsStore()
  const importRef = useRef<HTMLInputElement>(null)

  function handleThemeChange(p: ThemePreference) {
    // Theme lives in two places: the theme store controls the DOM class, while
    // settings records the preference alongside other display options.
    setPreference(p)
    updateSettings({ theme: p })
  }

  function handleExportTransactions() {
    downloadCSV(`pocketplan-transactions-${todayISO()}.csv`, exportTransactionsCSV(transactions))
  }
  function handleExportBudgets() {
    downloadCSV(`pocketplan-budgets-${todayISO()}.csv`, exportBudgetsCSV(budgets))
  }
  function handleExportGoals() {
    downloadCSV(`pocketplan-goals-${todayISO()}.csv`, exportGoalsCSV(goals))
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
        // CSV rows with missing/Other categories get a best-effort category
        // from the same merchant rules used by the transaction form.
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
      // Reset the input so selecting the same file again still fires onChange.
      alert(`Imported ${imported} of ${rows.length} transactions.${rows.length - imported > 0 ? ` ${rows.length - imported} rows had errors.` : ''}`)
      if (importRef.current) importRef.current.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Preferences, formatting, and data controls</p>
      </div>

      {/* ── Appearance ────────────────────────────────────────────────── */}
      <GlassSection title="Appearance" icon="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z">
        <Row label="Theme" sub="Controls light/dark mode across the app">
          <SegmentedControl<ThemePreference>
            options={[
              { value: 'light',  label: 'Light'  },
              { value: 'dark',   label: 'Dark'   },
              { value: 'system', label: 'Auto'   },
            ]}
            value={theme}
            onChange={handleThemeChange}
          />
        </Row>
      </GlassSection>

      {/* ── Formatting ────────────────────────────────────────────────── */}
      <GlassSection title="Formatting" icon="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4">
        <Row label="Show cents" sub="Display decimal places on currency amounts">
          <Toggle
            checked={settings.showCents}
            onChange={() => updateSettings({ showCents: !settings.showCents })}
          />
        </Row>
        <Row label="Compact numbers" sub="Display $1.2k instead of $1,200">
          <Toggle
            checked={settings.compactNumbers}
            onChange={() => updateSettings({ compactNumbers: !settings.compactNumbers })}
          />
        </Row>
        <Row label="Currency">
          <SegmentedControl<CurrencyCode>
            options={[
              { value: 'USD', label: 'USD $' },
              { value: 'EUR', label: 'EUR €' },
              { value: 'GBP', label: 'GBP £' },
              { value: 'CAD', label: 'CAD $' },
            ]}
            value={settings.currency}
            onChange={(v) => updateSettings({ currency: v })}
          />
        </Row>
        <Row label="Date format">
          <div className="inline-flex rounded-xl p-0.5 gap-0.5"
            style={{ background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.15)' }}>
            {(
              [
                { value: 'MMM D, YYYY', label: 'May 7' },
                { value: 'MM/DD/YYYY',  label: 'MM/DD' },
                { value: 'DD/MM/YYYY',  label: 'DD/MM' },
                { value: 'YYYY-MM-DD',  label: 'ISO'   },
              ] as { value: DateFormatPreference; label: string }[]
            ).map((o) => (
              <button
                key={o.value}
                onClick={() => updateSettings({ dateFormat: o.value })}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-150 ${
                  settings.dateFormat === o.value
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Row>

        {/* Live preview */}
        <div className="pt-1 pb-0">
          <LivePreview />
        </div>
      </GlassSection>

      {/* ── Demo data ─────────────────────────────────────────────────── */}
      <GlassSection title="Sample Data" icon="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7l8-4 8 4M4 7h16">
        <Row label="Load sample experience" sub="12 months of realistic financial data">
          <Button size="sm" variant="secondary" onClick={loadDemoData}>Load data</Button>
        </Row>
        <Row label="Reset all data" sub="Removes all transactions, budgets, goals, and accounts">
          <Button size="sm" variant="danger" onClick={clearDemoData}>Reset</Button>
        </Row>
      </GlassSection>

      {/* ── Export ────────────────────────────────────────────────────── */}
      <GlassSection title="Export Data" icon="M12 16l-4-4h3V4h2v8h3l-4 4zM4 20h16">
        <Row label="Transactions CSV" sub={`${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`}>
          <Button size="sm" variant="secondary" onClick={handleExportTransactions} disabled={transactions.length === 0}>
            Export
          </Button>
        </Row>
        <Row label="Budgets CSV" sub={`${budgets.length} budget${budgets.length !== 1 ? 's' : ''}`}>
          <Button size="sm" variant="secondary" onClick={handleExportBudgets} disabled={budgets.length === 0}>
            Export
          </Button>
        </Row>
        <Row label="Goals CSV" sub={`${goals.length} goal${goals.length !== 1 ? 's' : ''}`}>
          <Button size="sm" variant="secondary" onClick={handleExportGoals} disabled={goals.length === 0}>
            Export
          </Button>
        </Row>
      </GlassSection>

      {/* ── Import ────────────────────────────────────────────────────── */}
      <GlassSection title="Import Transactions" icon="M12 8l4 4h-3v8h-2v-8H8l4-4zM4 4h16">
        <div className="py-2 flex flex-col gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Import a CSV with columns:{' '}
            <code className="text-xs bg-slate-100 dark:bg-white/8 px-1.5 py-0.5 rounded font-mono text-violet-600 dark:text-violet-400">
              date, title, amount, type, category, note
            </code>
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Categories are auto-detected if missing. Negative amounts are treated as expenses.
          </p>
          <div>
            <input ref={importRef} type="file" accept=".csv" onChange={handleImport} className="hidden" id="csv-import" />
            <Button size="sm" variant="secondary" onClick={() => importRef.current?.click()}>
              Choose CSV file
            </Button>
          </div>
        </div>
      </GlassSection>

      {/* ── About ─────────────────────────────────────────────────────── */}
      <GlassSection title="About" icon="M12 22a10 10 0 100-20 10 10 0 000 20zm0-14v4m0 4h.01">
        <Row label="PocketPlan" sub="All data is stored locally in your browser">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">v2.1</span>
        </Row>
        <Row label="Reset preferences" sub="Restore all formatting settings to defaults">
          <Button size="sm" variant="ghost" onClick={resetSettings}>Reset</Button>
        </Row>
      </GlassSection>
    </div>
  )
}
