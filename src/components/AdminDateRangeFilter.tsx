'use client'

import { CalendarRange } from 'lucide-react'
import { subDays, format } from 'date-fns'

type Props = {
  dateFrom: string
  dateTo: string
  onDateFromChange: (v: string) => void
  onDateToChange: (v: string) => void
  onAllTime: () => void
  className?: string
}

/**
 * from/to: YYYY-MM-DD, or both empty for all-time.
 */
export default function AdminDateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onAllTime,
  className = '',
}: Props) {
  const setPreset = (days: number) => {
    const to = new Date()
    const from = subDays(to, days)
    onDateFromChange(format(from, 'yyyy-MM-dd'))
    onDateToChange(format(to, 'yyyy-MM-dd'))
  }

  return (
    <div
      className={`flex flex-wrap items-end gap-3 p-3 rounded-xl border border-neutral-800 bg-neutral-900/50 ${className}`}
    >
      <div className="flex items-center gap-2 text-amber-500/90 mr-1">
        <CalendarRange className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Period</span>
      </div>
      <div>
        <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-1.5 pl-1 border-l border-neutral-800">
        {[
          { label: '7d', d: 7 },
          { label: '30d', d: 30 },
          { label: '90d', d: 90 },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setPreset(p.d)}
            className="px-2.5 py-1.5 text-[10px] font-bold uppercase bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md border border-neutral-700"
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onAllTime}
          className="px-2.5 py-1.5 text-[10px] font-bold uppercase bg-neutral-800 hover:bg-neutral-700 text-amber-500/80 rounded-md border border-amber-500/20"
        >
          All time
        </button>
      </div>
    </div>
  )
}
