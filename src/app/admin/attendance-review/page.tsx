'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Navigation from '@/components/Navigation'
import { ClipboardCheck, Loader2 } from 'lucide-react'

type AttUser = {
  name: string | null
  email: string
  employeeId?: string | null
}

type AttRow = {
  id: string
  userId: string
  user: AttUser
  dayKey: string
  kind: string
  status: string
  note?: string | null
}

function defaultMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function kindLabel(kind: string) {
  if (kind === 'FULL_DAY') return 'Full day'
  if (kind === 'HALF_DAY') return 'Half day'
  return kind
}

export default function AdminAttendanceReviewPage() {
  const init = useMemo(defaultMonth, [])
  const [month, setMonth] = useState(init)
  const [rows, setRows] = useState<AttRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/attendance?month=${encodeURIComponent(month)}`)
      const data = await res.json()
      if (Array.isArray(data.attendance)) setRows(data.attendance)
      else setRows([])
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  const act = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/attendance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        alert(j.error || 'Could not update')
        return
      }
      await fetchRows()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ClipboardCheck className="w-7 h-7 text-sky-400" />
              Attendance review
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Approve or reject daily attendance entries before they count toward payroll.
            </p>
          </div>
          <label className="text-sm flex items-center gap-2">
            <span className="text-neutral-500">Month</span>
            <input
              type="month"
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-neutral-500">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-neutral-800 text-neutral-500">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Kind</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                  <th className="px-4 py-3 font-medium w-44" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">
                      No attendance for this month.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-800/40 align-top">
                      <td className="px-4 py-3 text-neutral-300 whitespace-nowrap font-mono text-xs">{r.dayKey}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{r.user.name || '—'}</div>
                        <div className="text-xs text-neutral-500">{r.user.email}</div>
                      </td>
                      <td className="px-4 py-3 text-neutral-200">{kindLabel(r.kind)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs uppercase font-medium ${
                            r.status === 'APPROVED'
                              ? 'text-emerald-400'
                              : r.status === 'REJECTED'
                                ? 'text-red-400'
                                : 'text-amber-400'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 max-w-xs truncate" title={r.note || ''}>
                        {r.note || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {r.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={busyId === r.id}
                              className="text-xs px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white disabled:opacity-50"
                              onClick={() => act(r.id, 'APPROVED')}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={busyId === r.id}
                              className="text-xs px-2 py-1 rounded bg-neutral-700 hover:bg-red-900/70 disabled:opacity-50"
                              onClick={() => act(r.id, 'REJECTED')}
                            >
                              Reject
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
