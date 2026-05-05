'use client'

import { useCallback, useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { CalendarDays, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

type LeaveUser = {
  name: string | null
  email: string
  employeeId?: string | null
}

type LeaveReq = {
  id: string
  userId: string
  user: LeaveUser
  startDate: string
  endDate: string
  reason?: string | null
  status: string
  createdAt: string
}

const STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED']

export default function AdminLeaveRequestsPage() {
  const [filter, setFilter] = useState('')
  const [list, setList] = useState<LeaveReq[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const q = filter ? `?status=${encodeURIComponent(filter)}` : ''
      const res = await fetch(`/api/admin/leave-requests${q}`)
      const data = await res.json()
      if (data.leaveRequests) setList(data.leaveRequests)
      else setList([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const act = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/leave-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        alert(j.error || 'Could not update request')
        return
      }
      await fetchList()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-7 h-7 text-rose-400" />
              Leave requests
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Approve or reject advance leave submissions from employees.
            </p>
          </div>
          <select
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.slice(1).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-neutral-500">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        ) : (
          <ul className="space-y-4">
            {list.length === 0 ? (
              <p className="text-neutral-500 text-center py-12">No leave requests.</p>
            ) : (
              list.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                >
                  <div>
                    <div className="font-medium text-white">{r.user.name || '—'}</div>
                    <div className="text-sm text-neutral-500">{r.user.email}</div>
                    {r.user.employeeId ? (
                      <div className="text-xs text-neutral-600 mt-0.5">ID {r.user.employeeId}</div>
                    ) : null}
                    <div className="mt-3 text-neutral-300 text-sm">
                      {format(new Date(r.startDate), 'dd MMM yyyy')} →{' '}
                      {format(new Date(r.endDate), 'dd MMM yyyy')}
                    </div>
                    {r.reason ? (
                      <p className="text-neutral-400 text-sm mt-2 border-l-2 border-neutral-700 pl-3">{r.reason}</p>
                    ) : null}
                    <span
                      className={`inline-block mt-3 text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded ${
                        r.status === 'APPROVED'
                          ? 'bg-emerald-950 text-emerald-400'
                          : r.status === 'REJECTED'
                            ? 'bg-red-950 text-red-400'
                            : 'bg-amber-950 text-amber-400'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  {r.status === 'PENDING' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm disabled:opacity-50"
                        onClick={() => act(r.id, 'APPROVED')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        className="px-3 py-1.5 rounded-lg bg-neutral-700 hover:bg-red-900/70 text-neutral-100 text-sm disabled:opacity-50"
                        onClick={() => act(r.id, 'REJECTED')}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </main>
    </div>
  )
}
