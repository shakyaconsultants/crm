'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Navigation from '@/components/Navigation'
import { Banknote, Loader2, RefreshCw } from 'lucide-react'

type PayrollRow = {
  employeeId: string
  name: string | null
  email: string
  employeeCode?: string | null
  baseSalaryMonthly: number | null
  approvedAttendanceUnits: number
  weekdayExpected: number
  attendanceRatio: number
  baseEarned: number | null
  verifiedSalesInMonth: number
  monthlyIncentive: number
  estimatedGross: number
}

type PayrollResponse = {
  year: number
  month: number
  incentiveTiers: Record<string, number>
  rows: PayrollRow[]
}

function monthDefaults() {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export default function AdminPayrollPage() {
  const defaults = useMemo(monthDefaults, [])
  const [year, setYear] = useState(defaults.year)
  const [month, setMonth] = useState(defaults.month)
  const [data, setData] = useState<PayrollResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [salaryDraft, setSalaryDraft] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const fetchPayroll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/payroll?year=${year}&month=${month}`)
      const j = await res.json()
      if (res.ok && j.rows) {
        setData(j)
        const d: Record<string, string> = {}
        for (const r of j.rows as PayrollRow[]) {
          d[r.employeeId] =
            r.baseSalaryMonthly != null && Number.isFinite(r.baseSalaryMonthly)
              ? String(r.baseSalaryMonthly)
              : ''
        }
        setSalaryDraft(d)
      } else setData(null)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetchPayroll()
  }, [fetchPayroll])

  const saveSalary = async (employeeId: string) => {
    const raw = salaryDraft[employeeId]?.trim()
    const body =
      raw === '' || raw === undefined ? { baseSalaryMonthly: null } : { baseSalaryMonthly: Number(raw) }
    if (body.baseSalaryMonthly != null && !Number.isFinite(body.baseSalaryMonthly)) {
      alert('Enter a valid number for base salary.')
      return
    }
    setSavingId(employeeId)
    try {
      const res = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(j.error || 'Could not save salary')
        return
      }
      await fetchPayroll()
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Banknote className="w-7 h-7 text-violet-400" />
              Payroll overview
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Base pay scales with approved attendance vs weekdays in month. Incentive uses verified-sale
              tiers for the selected calendar month (by lead update date).
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchPayroll()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-sm border border-neutral-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-center mb-6 bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
          <label className="text-sm flex items-center gap-2">
            <span className="text-neutral-500">Year</span>
            <input
              type="number"
              className="bg-neutral-950 border border-neutral-700 rounded-md px-2 py-1.5 text-white w-28"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2000}
              max={2100}
            />
          </label>
          <label className="text-sm flex items-center gap-2">
            <span className="text-neutral-500">Month</span>
            <select
              className="bg-neutral-950 border border-neutral-700 rounded-md px-2 py-1.5 text-white"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString(undefined, { month: 'long' })}
                </option>
              ))}
            </select>
          </label>
        </div>

        {data?.incentiveTiers && (
          <div className="mb-6 text-sm text-neutral-400 bg-neutral-900/50 border border-neutral-800 rounded-lg px-4 py-3">
            <span className="text-neutral-500">Verified sales → incentive:</span>{' '}
            {Object.entries(data.incentiveTiers)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([tier, amt]) =>
                tier === '5' ? `${tier}+ ₹${amt.toLocaleString()}` : `${tier} → ₹${amt.toLocaleString()}`,
              )
              .join(' · ')}
          </div>
        )}

        {loading && !data ? (
          <div className="flex justify-center py-20 text-neutral-500">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-neutral-800 text-neutral-500">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Base salary / mo</th>
                  <th className="px-4 py-3 font-medium">Attendance units</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Base earned</th>
                  <th className="px-4 py-3 font-medium">Verified sales</th>
                  <th className="px-4 py-3 font-medium">Incentive</th>
                  <th className="px-4 py-3 font-medium">Estimated gross</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {(data?.rows ?? []).map((row) => (
                  <tr key={row.employeeId} className="hover:bg-neutral-800/40">
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-white">{row.name || '—'}</div>
                      <div className="text-neutral-500 text-xs">{row.email}</div>
                      {row.employeeCode ? (
                        <div className="text-neutral-600 text-xs">ID {row.employeeCode}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500 text-xs">₹</span>
                        <input
                          className="w-28 bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-white"
                          value={salaryDraft[row.employeeId] ?? ''}
                          onChange={(e) =>
                            setSalaryDraft((prev) => ({ ...prev, [row.employeeId]: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => saveSalary(row.employeeId)}
                          disabled={savingId === row.employeeId}
                          className="text-xs px-2 py-1 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white"
                        >
                          {savingId === row.employeeId ? '…' : 'Save'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-neutral-300">
                      {row.approvedAttendanceUnits}
                      <span className="text-neutral-600"> / </span>
                      <span>{row.weekdayExpected}</span>
                      <span className="block text-neutral-500 text-xs">ratio {(row.attendanceRatio * 100).toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-3 align-top text-neutral-200">
                      {row.baseEarned != null ? `₹${row.baseEarned.toLocaleString()}` : <span className="text-neutral-600">—</span>}
                    </td>
                    <td className="px-4 py-3 align-top">{row.verifiedSalesInMonth}</td>
                    <td className="px-4 py-3 align-top text-emerald-400">₹{row.monthlyIncentive.toLocaleString()}</td>
                    <td className="px-4 py-3 align-top font-medium text-white">₹{row.estimatedGross.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
