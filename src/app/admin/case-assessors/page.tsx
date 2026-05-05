'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { Plus, ClipboardList, UserPlus, Loader2, Copy, Check, Trash2, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

type Assessor = {
  id: string
  employeeId?: string
  name: string
  email: string
  createdAt: string
}

export default function AdminCaseAssessorsPage() {
  const [assessors, setAssessors] = useState<Assessor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ name: string; email: string; pass: string } | null>(null)

  const fetchAssessors = async () => {
    try {
      const res = await fetch('/api/admin/case-assessors')
      const data = await res.json()
      if (data.assessors) setAssessors(data.assessors)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssessors()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccessData(null)

    try {
      const res = await fetch('/api/admin/case-assessors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, email: formEmail, password: formPassword }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setSuccessData({ name: formName, email: formEmail, pass: formPassword })
        setFormName('')
        setFormEmail('')
        setFormPassword('')
        fetchAssessors()
      } else {
        setError(data.error || 'Failed to create case assessor')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setFormLoading(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Delete ${name}? Leads assigned to this case assessor will be unassigned.`
      )
    )
      return

    try {
      const res = await fetch('/api/admin/case-assessors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        fetchAssessors()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete')
      }
    } catch {
      alert('Error deleting case assessor')
    }
  }

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$'
    let pass = ''
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormPassword(pass)
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-cyan-500" />
              Manage Case Assessors
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Create accounts that advisors can assign to leads.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {showForm ? 'Cancel' : (
              <>
                <UserPlus className="w-4 h-4" /> Create Profile
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-8 shadow-xl max-w-2xl">
                <h2 className="text-lg font-semibold text-white mb-4 border-b border-neutral-800 pb-2">
                  New Case Assessor
                </h2>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Initial Password</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono text-white"
                      />
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-lg text-sm border border-neutral-700"
                      >
                        Auto-Generate
                      </button>
                    </div>
                  </div>

                  {successData && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-sm"
                    >
                      <p className="font-bold text-emerald-400 mb-2">Profile created</p>
                      <div className="space-y-1 font-mono text-xs">
                        <p>
                          <span className="text-neutral-500">Email:</span>{' '}
                          <span className="text-white">{successData.email}</span>
                        </p>
                        <p>
                          <span className="text-neutral-500">Pass:</span>{' '}
                          <span className="text-emerald-400 font-bold">{successData.pass}</span>
                        </p>
                      </div>
                      <p className="text-[10px] text-amber-500 mt-3 flex items-center gap-1">
                        <Save className="w-3 h-3" /> Copy now; it will not be shown again.
                      </p>
                    </motion.div>
                  )}

                  {error && (
                    <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Create Account
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/80 text-xs uppercase tracking-wider text-neutral-400">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">System ID</th>
                  <th className="p-4 font-medium">Created</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : assessors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-500">
                      No case assessors yet.
                    </td>
                  </tr>
                ) : (
                  assessors.map((a) => (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-neutral-800/30"
                    >
                      <td className="p-4 font-medium text-white">{a.name}</td>
                      <td className="p-4 text-cyan-400">{a.email}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-neutral-500 bg-neutral-950 border border-neutral-800 px-2 py-1 rounded">
                            {a.employeeId || '—'}
                          </span>
                          {a.employeeId && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(a.employeeId!, a.id)}
                              className="text-neutral-500 hover:text-white"
                            >
                              {copiedId === a.id ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-neutral-400">
                        {a.createdAt ? format(new Date(a.createdAt), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id, a.name)}
                          className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
