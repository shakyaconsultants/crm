'use client'

import { useCallback, useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { ChevronLeft, ChevronRight, Loader2, ClipboardList } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, getDay, getDaysInMonth } from 'date-fns'

type AttRow = { id: string; dayKey: string; kind: string; status: string }

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function buildCalendarWeeks(year: number, month: number): (number | null)[][] {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1, 1))
  const firstDow = (getDay(startOfMonth(new Date(year, month - 1, 1))) + 6) % 7
  const weeks: (number | null)[][] = []
  let week: (number | null)[] = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

function dayKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function AttendancePage() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [attRows, setAttRows] = useState<AttRow[]>([])
  const [loading, setLoading] = useState(true)

  const [attDay, setAttDay] = useState(() => format(today, 'yyyy-MM-dd'))
  const [attKind, setAttKind] = useState<'FULL_DAY' | 'HALF_DAY'>('FULL_DAY')
  const [attBusy, setAttBusy] = useState(false)
  const [attMsg, setAttMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth() + 1
  const monthKey = `${year}-${String(month).padStart(2, '0')}`
  const weeks = buildCalendarWeeks(year, month)
  const todayKey = format(today, 'yyyy-MM-dd')
  const attMap = new Map(attRows.map((r) => [r.dayKey, r]))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/employee/attendance?month=${monthKey}`)
      if (res.ok) { const j = await res.json(); if (Array.isArray(j.attendance)) setAttRows(j.attendance) }
    } finally {
      setLoading(false)
    }
  }, [monthKey])

  useEffect(() => { void load() }, [load])

  const submitAtt = async () => {
    setAttMsg(null)
    setAttBusy(true)
    try {
      const res = await fetch('/api/employee/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayKey: attDay, kind: attKind }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setAttMsg({ type: 'err', text: data.error || 'Could not submit.' }); return }
      setAttMsg({ type: 'ok', text: 'Attendance submitted.' })
      void load()
    } finally {
      setAttBusy(false)
    }
  }

  function getDayStyle(day: number) {
    const key = dayKey(year, month, day)
    const entry = attMap.get(key)
    const isFuture = key > todayKey
    const isToday = key === todayKey

    if (isFuture && !isToday) return { bg: 'bg-neutral-800/50', text: 'text-neutral-400', ring: '' }
    if (entry) {
      const approved = entry.status === 'APPROVED'
      if (approved && entry.kind === 'FULL_DAY')  return { bg: 'bg-emerald-500/20', text: 'text-emerald-300 font-semibold', ring: 'ring-1 ring-emerald-500/40' }
      if (approved && entry.kind === 'HALF_DAY')  return { bg: 'bg-violet-500/20', text: 'text-violet-300 font-semibold', ring: 'ring-1 ring-violet-500/40' }
      // submitted but pending approval → cream
      return { bg: 'bg-amber-100/10', text: 'text-amber-100 font-semibold', ring: 'ring-1 ring-amber-200/30' }
    }
    if (isToday) return { bg: 'bg-neutral-700/70', text: 'text-white font-semibold', ring: 'ring-1 ring-neutral-400/60' }
    return { bg: 'bg-red-500/10', text: 'text-red-400', ring: 'ring-1 ring-red-500/20' }
  }

  function getDayDot(day: number) {
    const key = dayKey(year, month, day)
    const entry = attMap.get(key)
    if (!entry) return null
    if (entry.status === 'APPROVED') {
      if (entry.kind === 'FULL_DAY') return <span className="block w-1.5 h-1.5 rounded-full bg-emerald-400 mx-auto mt-0.5" />
      return <span className="block w-1.5 h-1.5 rounded-full bg-violet-400 mx-auto mt-0.5" />
    }
    return <span className="block w-1.5 h-1.5 rounded-full bg-amber-200/60 mx-auto mt-0.5" />
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-15%,rgba(59,130,246,0.08),transparent_55%)]" aria-hidden />
      <Navigation />
      <main className="relative max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Attendance</h1>
          <p className="text-sm text-neutral-500">Your monthly attendance calendar.</p>
        </header>

        {/* Two-column layout: calendar left, mark attendance right */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* Calendar */}
          <section className="flex-1 min-w-0 rounded-2xl border border-white/[0.06] bg-neutral-900/70 backdrop-blur-sm p-5 ring-1 ring-white/[0.04] shadow-lg shadow-black/20">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setViewDate(subMonths(viewDate, 1))}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-semibold text-white">{format(viewDate, 'MMMM yyyy')}</h2>
              <button
                onClick={() => setViewDate(addMonths(viewDate, 1))}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                disabled={viewDate >= startOfMonth(today)}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4 text-xs">
              {[
                { color: 'bg-emerald-500', label: 'Approved (full)' },
                { color: 'bg-violet-500', label: 'Approved (half)' },
                { color: 'bg-amber-100/60', label: 'Submitted' },
                { color: 'bg-red-500', label: 'Absent' },
                { color: 'bg-neutral-500', label: 'Today' },
                { color: 'bg-neutral-600', label: 'Future' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-neutral-400">
                  <span className={`w-2 h-2 rounded-full ${color} opacity-80`} />
                  {label}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAY_HEADERS.map((d) => (
                    <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-500 py-1">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7 gap-1">
                      {week.map((day, di) => {
                        if (day === null) return <div key={di} />
                        const { bg, text, ring } = getDayStyle(day)
                        const isToday = dayKey(year, month, day) === todayKey
                        return (
                          <div
                            key={di}
                            className={`rounded-lg py-1.5 px-1 text-center ${bg} ${ring}`}
                          >
                            <span className={`text-xs ${text}`}>{day}</span>
                            {getDayDot(day)}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Mark attendance — right panel */}
          <section className="w-full lg:w-[280px] shrink-0 rounded-2xl border border-white/[0.06] bg-neutral-900/75 backdrop-blur-sm p-5 ring-1 ring-white/[0.04] shadow-lg shadow-black/15">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 ring-1 ring-sky-500/25">
                <ClipboardList className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Mark attendance</h2>
                <p className="text-[11px] text-neutral-500">Awaits admin approval.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Date</label>
                <input
                  type="date"
                  value={attDay}
                  onChange={(e) => setAttDay(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2.5 text-white text-sm focus:border-sky-500/35 focus:outline-none focus:ring-2 focus:ring-sky-500/15"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Type</label>
                <select
                  value={attKind}
                  onChange={(e) => setAttKind(e.target.value as 'FULL_DAY' | 'HALF_DAY')}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2.5 text-white text-sm focus:border-sky-500/35 focus:outline-none focus:ring-2 focus:ring-sky-500/15"
                >
                  <option value="FULL_DAY">Full day</option>
                  <option value="HALF_DAY">Half day</option>
                </select>
              </div>

              {attMsg && (
                <p className={`text-xs ${attMsg.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{attMsg.text}</p>
              )}

              <button
                type="button"
                onClick={() => void submitAtt()}
                disabled={attBusy}
                className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-colors"
              >
                {attBusy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Submit'}
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
