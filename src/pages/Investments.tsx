import { useMemo } from 'react'
import { useInvestmentsStore } from '../store/investments'
import { useAccountsStore } from '../store/accounts'
import {
  getTotalPortfolioValue,
  getTotalGainLoss,
  getOverallGainLossPercent,
  getAllocationChartData,
} from '../utils/investments'
import { formatCurrency } from '../utils'
import AllocationChart from '../components/investments/AllocationChart'
import HoldingsTable from '../components/investments/HoldingsTable'
import SyncButton from '../components/accounts/SyncButton'

export default function Investments() {
  const { holdings } = useInvestmentsStore()
  const { accounts } = useAccountsStore()

  const totalValue    = useMemo(() => getTotalPortfolioValue(holdings), [holdings])
  const totalGainLoss = useMemo(() => getTotalGainLoss(holdings), [holdings])
  const gainLossPct   = useMemo(() => getOverallGainLossPercent(holdings), [holdings])
  const allocation    = useMemo(() => getAllocationChartData(holdings), [holdings])

  const isPositive = totalGainLoss >= 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Investments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Portfolio overview and holdings</p>
        </div>
        {accounts.length === 0 && <SyncButton />}
      </div>

      <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2.5 text-sm text-amber-800 dark:text-amber-300">
        <span>⚠</span>
        <span><strong>Demo Mode:</strong> Simulated financial data only. No real accounts are connected.</span>
      </div>

      {holdings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l4-8 4 4 4-6 4 3" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No portfolio data</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs mb-6">
            Sync your accounts to load demo investment holdings and track your portfolio.
          </p>
          <SyncButton />
        </div>
      )}

      {holdings.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl px-5 py-4">
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Portfolio Value</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">{formatCurrency(totalValue)}</p>
            </div>
            <div className={`${isPositive ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50' : 'bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50'} rounded-xl px-5 py-4`}>
              <p className={`text-xs font-medium uppercase tracking-wide ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                Total Gain / Loss
              </p>
              <p className={`text-2xl font-bold mt-1 ${isPositive ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                {isPositive ? '+' : ''}{formatCurrency(totalGainLoss)}
              </p>
            </div>
            <div className={`${isPositive ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50' : 'bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50'} rounded-xl px-5 py-4`}>
              <p className={`text-xs font-medium uppercase tracking-wide ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                Overall Return
              </p>
              <p className={`text-2xl font-bold mt-1 ${isPositive ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                {isPositive ? '+' : ''}{gainLossPct.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AllocationChart data={allocation} totalValue={totalValue} />
            <HoldingsTable holdings={holdings} />
          </div>
        </>
      )}
    </div>
  )
}
