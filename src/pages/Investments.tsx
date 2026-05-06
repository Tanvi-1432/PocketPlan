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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Portfolio overview and holdings</p>
        </div>
        {accounts.length === 0 && <SyncButton />}
      </div>

      {/* Demo mode banner */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800">
        <span>⚠</span>
        <span><strong>Demo Mode:</strong> Simulated financial data only. No real accounts are connected.</span>
      </div>

      {/* Empty state */}
      {holdings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l4-8 4 4 4-6 4 3" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-700">No portfolio data</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs mb-6">
            Sync your accounts to load demo investment holdings and track your portfolio.
          </p>
          <SyncButton />
        </div>
      )}

      {/* Summary row */}
      {holdings.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-indigo-50 rounded-xl px-5 py-4">
              <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Portfolio Value</p>
              <p className="text-2xl font-bold text-indigo-700 mt-1">{formatCurrency(totalValue)}</p>
            </div>
            <div className={`${isPositive ? 'bg-emerald-50' : 'bg-red-50'} rounded-xl px-5 py-4`}>
              <p className={`text-xs font-medium uppercase tracking-wide ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                Total Gain / Loss
              </p>
              <p className={`text-2xl font-bold mt-1 ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                {isPositive ? '+' : ''}{formatCurrency(totalGainLoss)}
              </p>
            </div>
            <div className={`${isPositive ? 'bg-emerald-50' : 'bg-red-50'} rounded-xl px-5 py-4`}>
              <p className={`text-xs font-medium uppercase tracking-wide ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                Overall Return
              </p>
              <p className={`text-2xl font-bold mt-1 ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
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
