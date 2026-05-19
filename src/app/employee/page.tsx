'use client'

import Link from 'next/link'
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import {
  Crown,
  Loader2,
  Trophy,
  Shield,
  Users,
  Calendar,
  ClipboardList,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

type LeaderRow = {
  rank: number
  id: string
  name: string
  profileImageUrl: string | null
  verifiedCount: number
}

type LeaveRow = {
  id: string
  startDate: string
  endDate: string
  reason: string | null
  status: string
}

type AttRow = {
  id: string
  dayKey: string
  kind: string
  status: string
}

function statusPillClass(status: string) {
  const base =
    'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1'
  if (status === 'APPROVED')
    return `${base} bg-emerald-500/10 text-emerald-400 ring-emerald-500/20`
  if (status === 'REJECTED') return `${base} bg-red-500/10 text-red-400 ring-red-500/20`
  return `${base} bg-amber-500/10 text-amber-300 ring-amber-500/25`
}

function HubContent() {
  const searchParams = useSearchParams()
  const crmLocked = searchParams.get('crm_locked') === '1'

  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([])

  const [leaves, setLeaves] = useState<LeaveRow[]>([])
  const [attMonth, setAttMonth] = useState(() => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
  })
  const [attRows, setAttRows] = useState<AttRow[]>([])

  const [leaveStart, setLeaveStart] = useState('')
  const [leaveEnd, setLeaveEnd] = useState('')
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveBusy, setLeaveBusy] = useState(false)

  const [attDay, setAttDay] = useState(() => new Date().toISOString().slice(0, 10))
  const [attKind, setAttKind] = useState<'FULL_DAY' | 'HALF_DAY'>('FULL_DAY')
  const [attBusy, setAttBusy] = useState(false)

  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pwShowCurrent, setPwShowCurrent] = useState(false)
  const [pwShowNew, setPwShowNew] = useState(false)

  const load = useCallback(async () => {
    const [boardRes, userRes, leavesRes, attRes] = await Promise.all([
      fetch('/api/employee/leaderboard'),
      fetch('/api/user'),
      fetch('/api/employee/leave-requests'),
      fetch(`/api/employee/attendance?month=${encodeURIComponent(attMonth)}`),
    ])
    if (boardRes.ok) {
      const j = await boardRes.json()
      if (Array.isArray(j.leaderboard)) setLeaderboard(j.leaderboard)
    }
    if (!userRes.ok) {
      // user fetch is optional for workspace display
    }

    if (leavesRes.ok) {
      const j = await leavesRes.json()
      if (Array.isArray(j.leaveRequests)) setLeaves(j.leaveRequests)
    }
    if (attRes.ok) {
      const j = await attRes.json()
      if (Array.isArray(j.attendance)) setAttRows(j.attendance)
    }
  }, [attMonth])

  useEffect(() => {
    void load()
    const t = setInterval(() => void load(), 30000)
    return () => clearInterval(t)
  }, [load])

  const changePassword = async () => {
    setPwMsg(null)
    if (!pwCurrent || !pwNew) { setPwMsg({ type: 'err', text: 'Fill in all fields.' }); return }
    if (pwNew.length < 8) { setPwMsg({ type: 'err', text: 'New password must be at least 8 characters.' }); return }
    if (pwNew !== pwConfirm) { setPwMsg({ type: 'err', text: 'New passwords do not match.' }); return }
    setPwBusy(true)
    try {
      const res = await fetch('/api/employee/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setPwMsg({ type: 'err', text: data.error || 'Could not update password.' }); return }
      setPwMsg({ type: 'ok', text: 'Password updated successfully.' })
      setPwCurrent(''); setPwNew(''); setPwConfirm('')
    } finally {
      setPwBusy(false)
    }
  }

  const submitLeave = async () => {
    setLeaveBusy(true)
    try {
      const res = await fetch('/api/employee/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: leaveStart,
          endDate: leaveEnd,
          reason: leaveReason || undefined,
        }),
      })
      if (res.ok) {
        setLeaveStart('')
        setLeaveEnd('')
        setLeaveReason('')
        void load()
      }
    } finally {
      setLeaveBusy(false)
    }
  }

  const submitAtt = async () => {
    setAttBusy(true)
    try {
      const res = await fetch('/api/employee/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayKey: attDay, kind: attKind }),
      })
      if (res.ok) void load()
    } finally {
      setAttBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-15%,rgba(59,130,246,0.11),transparent_55%),radial-gradient(ellipse_80%_40%_at_100%_50%,rgba(16,185,129,0.05),transparent)]"
        aria-hidden
      />
      <Navigation />
      <main className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Your workspace</h1>
          <p className="text-sm text-neutral-500 max-w-2xl">
            Profile and leaderboard stay here. Open CRM only when you need leads and calling—extra email verification may
            apply.
          </p>
        </header>

        {crmLocked ? (
          <div
            role="alert"
            className="rounded-xl border border-amber-500/35 bg-gradient-to-r from-amber-500/[0.07] to-transparent px-4 py-3 flex gap-3 items-start"
          >
            <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden />
            <p className="text-sm text-amber-100/90 leading-relaxed">
              CRM access requires a separate login.{' '}
              <a href="/crm-access" className="underline font-semibold text-amber-300 hover:text-amber-200">
                Use CRM Access here
              </a>
              .
            </p>
          </div>
        ) : null}

        <section>
          <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/70 backdrop-blur-sm p-6 sm:p-7 shadow-lg shadow-black/20 ring-1 ring-white/[0.04]">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
                <Trophy className="w-5 h-5 text-amber-400" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Leaderboard</h2>
                <p className="text-xs text-neutral-500">Rankings by verified sales this period.</p>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-b from-neutral-950/50 to-transparent border border-neutral-800/80 px-4 py-6 mb-6">
              <div className="flex justify-center items-end gap-4 sm:gap-10 min-h-[200px]">
                {[leaderboard[1], leaderboard[0], leaderboard[2]].map((row, idx) => {
                  if (!row) {
                    return (
                      <div key={`ph-${idx}`} className="w-[28%] max-w-[132px] opacity-30 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-neutral-800/80 border border-dashed border-neutral-700" />
                        <span className="text-[10px] text-neutral-600 block mt-2">Open</span>
                      </div>
                    )
                  }
                  const podium = idx === 1
                  return (
                    <motion.div
                      key={row.id}
                      className="flex flex-col items-center w-[30%] max-w-[150px]"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div
                        className={`rounded-full overflow-hidden bg-neutral-800 ring-2 shadow-lg ${
                          row.rank === 1
                            ? 'ring-amber-400/60 shadow-amber-900/20'
                            : row.rank === 2
                              ? 'ring-slate-300/40'
                              : 'ring-orange-900/60'
                        } ${podium ? 'w-[4.75rem] h-[4.75rem]' : 'w-14 h-14'}`}
                      >
                        {row.profileImageUrl ? (
                          <img src={row.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600">
                            <Users className={podium ? 'w-9 h-9' : 'w-6 h-6'} aria-hidden />
                          </div>
                        )}
                      </div>
                      {row.rank === 1 ? <Crown className="w-5 h-5 text-amber-400 mt-1.5" /> : null}
                      <p
                        className={`mt-2 text-center font-medium text-white ${podium ? 'text-sm max-w-[9rem]' : 'text-xs max-w-[7rem]'}`}
                      >
                        {row.name}
                      </p>
                      <span className="mt-1 text-[11px] font-mono tabular-nums text-emerald-400/90">
                        {row.verifiedCount} verified
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">Other ranks</p>
              <ol className="space-y-2">
                {leaderboard.slice(3, 10).length === 0 ? (
                  <li className="text-sm text-neutral-600 py-6 text-center rounded-xl bg-neutral-950/40 border border-neutral-800/60">
                    No one else ranked yet—keep closing verified sales.
                  </li>
                ) : (
                  leaderboard.slice(3, 10).map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center gap-3 rounded-xl bg-neutral-950/55 px-3.5 py-2 text-sm border border-neutral-800/70"
                    >
                      <span className="tabular-nums text-neutral-600 w-9 text-xs font-medium">#{row.rank}</span>
                      <span className="truncate flex-1 text-neutral-100">{row.name}</span>
                      <span className="text-emerald-400/90 font-mono text-xs tabular-nums">{row.verifiedCount}</span>
                    </li>
                  ))
                )}
              </ol>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-neutral-900/75 backdrop-blur-sm p-6 sm:p-7 ring-1 ring-white/[0.04] shadow-lg shadow-black/15">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-4 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                <Shield className="w-5 h-5 text-blue-400" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">CRM &amp; calling</h2>
                <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
                  Access your leads and calling panel. Use your CRM credentials to log in separately.
                </p>
              </div>
            </div>
            <a
              href="/crm-access"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition-colors"
            >
              Open CRM
            </a>
          </div>
        </section>

        {/* Change Password */}
        <section className="rounded-2xl border border-white/[0.06] bg-neutral-900/75 backdrop-blur-sm p-6 sm:p-7 ring-1 ring-white/[0.04] shadow-lg shadow-black/15">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
              <KeyRound className="w-5 h-5 text-violet-400" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Change password</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Update your workspace login password.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Current password</label>
              <input
                type={pwShowCurrent ? 'text' : 'password'}
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2.5 pr-9 text-sm text-white focus:border-violet-500/35 focus:outline-none focus:ring-2 focus:ring-violet-500/15"
              />
              <button
                type="button"
                onClick={() => setPwShowCurrent((v) => !v)}
                className="absolute right-2.5 top-[2.1rem] text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {pwShowCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">New password</label>
              <input
                type={pwShowNew ? 'text' : 'password'}
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2.5 pr-9 text-sm text-white focus:border-violet-500/35 focus:outline-none focus:ring-2 focus:ring-violet-500/15"
              />
              <button
                type="button"
                onClick={() => setPwShowNew((v) => !v)}
                className="absolute right-2.5 top-[2.1rem] text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {pwShowNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Confirm new password</label>
              <input
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                placeholder="Repeat new password"
                onKeyDown={(e) => e.key === 'Enter' && void changePassword()}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2.5 text-sm text-white focus:border-violet-500/35 focus:outline-none focus:ring-2 focus:ring-violet-500/15"
              />
            </div>
          </div>
          {pwMsg && (
            <p className={`mt-3 text-xs ${pwMsg.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
              {pwMsg.text}
            </p>
          )}
          <button
            type="button"
            onClick={() => void changePassword()}
            disabled={pwBusy || !pwCurrent || !pwNew || !pwConfirm}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 transition-colors"
          >
            {pwBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Update password
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-white/[0.06] bg-neutral-900/75 backdrop-blur-sm p-6 ring-1 ring-white/[0.04] shadow-lg shadow-black/15 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/25">
                <Calendar className="w-5 h-5 text-emerald-400" aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Leave requests</h2>
                <p className="text-xs text-neutral-500">Apply ahead; admin approves.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Start</label>
                <input
                  type="date"
                  value={leaveStart}
                  onChange={(e) => setLeaveStart(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-white focus:border-emerald-500/35 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">End</label>
                <input
                  type="date"
                  value={leaveEnd}
                  onChange={(e) => setLeaveEnd(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-white focus:border-emerald-500/35 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Reason (optional)</label>
                <input
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-sm text-white focus:border-emerald-500/35 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                  placeholder="Short note for admin"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => void submitLeave()}
              disabled={leaveBusy || !leaveStart || !leaveEnd}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 transition-colors w-full sm:w-auto"
            >
              {leaveBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Submit request
            </button>
            <div className="mt-6 flex-1 min-h-0 border-t border-neutral-800 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">Your submissions</p>
              <div className="rounded-xl border border-neutral-800/70 bg-neutral-950/40 overflow-hidden max-h-[220px] overflow-y-auto">
                {leaves.length === 0 ? (
                  <p className="text-sm text-neutral-600 px-4 py-8 text-center">No leave requests yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-neutral-900/95 text-left text-[10px] uppercase tracking-wide text-neutral-500 border-b border-neutral-800">
                      <tr>
                        <th className="px-3 py-2 font-medium">Dates</th>
                        <th className="px-3 py-2 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80">
                      {leaves.map((lv) => (
                        <tr key={lv.id} className="hover:bg-neutral-900/80">
                          <td className="px-3 py-2.5 text-neutral-300">
                            <span className="whitespace-nowrap">
                              {format(new Date(lv.startDate), 'd MMM')}
                            </span>
                            {' — '}
                            <span className="whitespace-nowrap">{format(new Date(lv.endDate), 'd MMM yyyy')}</span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className={statusPillClass(lv.status)}>{lv.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.06] bg-neutral-900/75 backdrop-blur-sm p-6 ring-1 ring-white/[0.04] shadow-lg shadow-black/15 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 ring-1 ring-sky-500/25">
                <ClipboardList className="w-5 h-5 text-sky-400" aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Daily attendance</h2>
                <p className="text-xs text-neutral-500">Mark full or half day; awaits admin approval.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[140px]">
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">View month</label>
                <input
                  type="month"
                  value={attMonth}
                  onChange={(e) => setAttMonth(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-white text-sm focus:border-sky-500/35 focus:outline-none focus:ring-2 focus:ring-sky-500/15"
                />
              </div>
              <div className="min-w-[140px]">
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Working day</label>
                <input
                  type="date"
                  value={attDay}
                  onChange={(e) => setAttDay(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-white text-sm focus:border-sky-500/35 focus:outline-none focus:ring-2 focus:ring-sky-500/15"
                />
              </div>
              <div className="min-w-[132px]">
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Kind</label>
                <select
                  value={attKind}
                  onChange={(e) => setAttKind(e.target.value as 'FULL_DAY' | 'HALF_DAY')}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-white text-sm focus:border-sky-500/35 focus:outline-none focus:ring-2 focus:ring-sky-500/15"
                >
                  <option value="FULL_DAY">Full day</option>
                  <option value="HALF_DAY">Half day</option>
                </select>
              </div>
              <button
                type="button"
                disabled={attBusy}
                onClick={() => void submitAtt()}
                className="rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 transition-colors h-[42px] self-end"
              >
                {attBusy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Submit'}
              </button>
            </div>
            <div className="mt-6 flex-1 min-h-0 border-t border-neutral-800 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">This month</p>
              <div className="rounded-xl border border-neutral-800/70 bg-neutral-950/40 overflow-hidden max-h-[220px] overflow-y-auto">
                {attRows.length === 0 ? (
                  <p className="text-sm text-neutral-600 px-4 py-8 text-center">No entries for this month.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-neutral-900/95 text-left text-[10px] uppercase tracking-wide text-neutral-500 border-b border-neutral-800">
                      <tr>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Type</th>
                        <th className="px-3 py-2 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80">
                      {attRows.map((r) => (
                        <tr key={r.id} className="hover:bg-neutral-900/80">
                          <td className="px-3 py-2.5 font-mono text-xs text-neutral-300">{r.dayKey}</td>
                          <td className="px-3 py-2.5 text-neutral-300 capitalize">
                            {r.kind.replace(/_/g, ' ').toLowerCase()}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className={statusPillClass(r.status)}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        </div>

        <footer className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 px-4 py-3 text-center text-xs text-neutral-500 leading-relaxed">
          Monthly incentive (verified count): 1 → ₹3,000 · 2 → ₹7,000 · 3 → ₹11,000 · 4 → ₹16,000 · 5+ → ₹25,000.
        </footer>
      </main>
    </div>
  )
}

export default function EmployeeHubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <HubContent />
    </Suspense>
  )
}
