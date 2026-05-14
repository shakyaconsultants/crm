'use client'

import { useEffect, useMemo, useState } from 'react'
import Navigation from '@/components/Navigation'
import { ClipboardCheck, Loader2 } from 'lucide-react'
import { parseCaseChecklist } from '@/lib/lead-workflow'

type CaseRow = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  addressLine1: string | null
  addressLine2: string | null
  addressLine3: string | null
  addressLine4: string | null
  phone: string
  caseStatus: string
  preSipAt: string | null
  caseChecklist?: unknown
  assignedTo: { name: string } | null
  assignedAdvisor: { name: string } | null
  assignedCaseAssessor: { name: string } | null
  updatedAt: string
}

export default function AdminCasesPage() {
  const [rows, setRows] = useState<CaseRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/cases')
        const data = await res.json()
        if (Array.isArray(data.cases)) setRows(data.cases)
      } finally {
        setLoading(false)
      }
    }
    void load()
    const id = setInterval(() => void load(), 30000)
    return () => clearInterval(id)
  }, [])

  const checklistUsed = useMemo(
    () => (input: unknown) => {
      const c = parseCaseChecklist(input)
      return Boolean(
        c.incomeMonthly ||
          c.employmentStatus ||
          c.kidsDob.length ||
          c.carRegistration ||
          c.idProofType ||
          c.debtLevel ||
          c.debtPlan ||
          c.notes ||
          c.incomeEligible ||
          c.payslipVerified ||
          c.universalCreditStatementUploaded ||
          c.universalCreditVisible ||
          c.hasKids ||
          c.hasCar ||
          c.nonEnglish ||
          c.rightToRemainUploaded ||
          c.amlCheckRequired ||
          c.threeWayCallCompleted
      )
    },
    []
  )

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <Navigation />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-cyan-500" /> Case Assessor Tracking
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            All cases assigned to case assessors across the team.
          </p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-neutral-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading cases...
            </div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-neutral-500">No cases assigned yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[980px]">
                <thead>
                  <tr className="border-b border-neutral-800 text-xs uppercase tracking-wider text-neutral-400">
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Phone</th>
                    <th className="p-4 font-medium">Employee</th>
                    <th className="p-4 font-medium">Advisor</th>
                    <th className="p-4 font-medium">Assessor</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Checklist used</th>
                    <th className="p-4 font-medium">SIP timing</th>
                    <th className="p-4 font-medium">Last updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-800/20">
                      <td className="p-4 text-white">{[r.firstName, r.lastName].filter(Boolean).join(' ') || '—'}</td>
                      <td className="p-4 text-neutral-300 font-mono">{r.phone}</td>
                      <td className="p-4 text-neutral-400">{r.assignedTo?.name || '—'}</td>
                      <td className="p-4 text-neutral-400">{r.assignedAdvisor?.name || '—'}</td>
                      <td className="p-4 text-neutral-300">{r.assignedCaseAssessor?.name || '—'}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/25">
                          {r.caseStatus || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          checklistUsed(r.caseChecklist)
                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25'
                            : 'bg-neutral-800 text-neutral-400 ring-1 ring-neutral-700'
                        }`}>
                          {checklistUsed(r.caseChecklist) ? 'Used' : 'Not used'}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-300">{r.preSipAt ? new Date(r.preSipAt).toLocaleString() : '—'}</td>
                      <td className="p-4 text-neutral-500">{new Date(r.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

