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
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">📈</p>
          <p className="text-base font-medium text-gray-500">No investment data</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Go to Accounts and click "Simulate Account Sync" to load demo holdings
          </p>
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
