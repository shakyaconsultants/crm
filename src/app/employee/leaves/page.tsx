'use client'

import { useCallback, useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { Loader2, Calendar, Clock, PlusCircle } from 'lucide-react'

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

  const [leaveStart, setLeaveStart] = useState('')
  const [leaveEnd, setLeaveEnd] = useState('')
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveBusy, setLeaveBusy] = useState(false)
  const [leaveMsg, setLeaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

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

  const submitLeave = async () => {
    setLeaveMsg(null)
    if (!leaveStart || !leaveEnd) { setLeaveMsg({ type: 'err', text: 'Select start and end dates.' }); return }
    setLeaveBusy(true)
    try {
      const res = await fetch('/api/employee/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: leaveStart, endDate: leaveEnd, reason: leaveReason || undefined }),
      })
      if (!res.ok) { setLeaveMsg({ type: 'err', text: 'Could not submit leave.' }); return }
      setLeaveMsg({ type: 'ok', text: 'Leave request submitted.' })
      setLeaveStart(''); setLeaveEnd(''); setLeaveReason('')
      void load()
    } finally {
      setLeaveBusy(false)
    }
  }

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

        {/* Apply leave */}
        <section className="rounded-2xl border border-white/[0.06] bg-neutral-900/75 backdrop-blur-sm p-5 sm:p-6 ring-1 ring-white/[0.04] shadow-lg shadow-black/15">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/25">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Apply for leave</h2>
              <p className="text-xs text-neutral-500">Submit in advance — admin approval required.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Start date</label>
              <input
                type="date"
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-white text-sm focus:border-emerald-500/35 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">End date</label>
              <input
                type="date"
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-white text-sm focus:border-emerald-500/35 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Reason (optional)</label>
              <input
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Short note for admin"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-emerald-500/35 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>
          </div>
          {leaveMsg && (
            <p className={`mt-2 text-xs ${leaveMsg.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{leaveMsg.text}</p>
          )}
          <button
            type="button"
            onClick={() => void submitLeave()}
            disabled={leaveBusy || !leaveStart || !leaveEnd}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 transition-colors"
          >
            {leaveBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Submit leave request
          </button>
        </section>

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
              No leave requests yet. Use the form above to apply.
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
