'use client'

import { useCallback, useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { Loader2, Calendar, Clock } from 'lucide-react'

type LeaveRow = {
  id: string
  startDate: string
  endDate: string
  reason: string | null
  status: string
  createdAt?: string
}

function statusPill(status: string) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1'
  if (status === 'APPROVED') return `${base} bg-emerald-500/10 text-emerald-400 ring-emerald-500/20`
  if (status === 'REJECTED') return `${base} bg-red-500/10 text-red-400 ring-red-500/20`
  return `${base} bg-amber-500/10 text-amber-300 ring-amber-500/25`
}

function daysBetween(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return diff
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/employee/leave-requests')
      if (res.ok) {
        const j = await res.json()
        if (Array.isArray(j.leaveRequests)) setLeaves(j.leaveRequests)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const approved = leaves.filter((l) => l.status === 'APPROVED')
  const pending = leaves.filter((l) => l.status === 'PENDING')
  const rejected = leaves.filter((l) => l.status === 'REJECTED')

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-15%,rgba(16,185,129,0.07),transparent_55%)]" aria-hidden />
      <Navigation />
      <main className="relative max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Leave history</h1>
          <p className="text-sm text-neutral-500">All your leave requests and their approval status.</p>
        </header>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Approved', count: approved.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 ring-emerald-500/20' },
            { label: 'Pending', count: pending.length, color: 'text-amber-300', bg: 'bg-amber-500/10 ring-amber-500/20' },
            { label: 'Rejected', count: rejected.length, color: 'text-red-400', bg: 'bg-red-500/10 ring-red-500/20' },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`rounded-xl p-4 text-center ring-1 ${bg}`}>
              <div className={`text-3xl font-bold ${color}`}>{count}</div>
              <div className="text-xs text-neutral-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Full list */}
        <section className="rounded-2xl border border-white/[0.06] bg-neutral-900/70 backdrop-blur-sm p-5 sm:p-6 ring-1 ring-white/[0.04] shadow-lg shadow-black/20">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/25">
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-white">All requests</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-12 text-neutral-600 text-sm">
              No leave requests yet. Apply on the{' '}
              <a href="/employee/attendance" className="text-emerald-500 hover:underline">Attendance page</a>.
            </div>
          ) : (
            <div className="space-y-3">
              {leaves.map((lv) => {
                const days = daysBetween(lv.startDate, lv.endDate)
                return (
                  <div
                    key={lv.id}
                    className="rounded-xl border border-neutral-800/80 bg-neutral-950/40 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">
                          {lv.startDate.slice(0, 10)}
                          {lv.startDate.slice(0, 10) !== lv.endDate.slice(0, 10) && (
                            <> → {lv.endDate.slice(0, 10)}</>
                          )}
                        </span>
                        <span className="text-xs text-neutral-500">
                          ({days} day{days !== 1 ? 's' : ''})
                        </span>
                      </div>
                      {lv.reason && (
                        <p className="text-xs text-neutral-500 mt-1 truncate">{lv.reason}</p>
                      )}
                      {lv.createdAt && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-600">
                          <Clock className="w-3 h-3" />
                          Applied {lv.createdAt.slice(0, 10)}
                        </div>
                      )}
                    </div>
                    <span className={statusPill(lv.status)}>{lv.status}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
