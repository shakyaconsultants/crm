'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import { KeyRound, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const changePassword = async () => {
    setPwMsg(null)
    if (!pwCurrent) { setPwMsg({ type: 'err', text: 'Enter your current password.' }); return }
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

  const strengthScore = () => {
    let s = 0
    if (pwNew.length >= 8) s++
    if (pwNew.length >= 12) s++
    if (/[A-Z]/.test(pwNew)) s++
    if (/[0-9]/.test(pwNew)) s++
    if (/[^A-Za-z0-9]/.test(pwNew)) s++
    return s
  }
  const score = strengthScore()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][score] || ''
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-500'][score] || ''

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-15%,rgba(139,92,246,0.08),transparent_55%)]" aria-hidden />
      <Navigation />
      <main className="relative max-w-[600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-sm text-neutral-500">Manage your account preferences.</p>
        </header>

        {/* Change password card */}
        <section className="rounded-2xl border border-white/[0.06] bg-neutral-900/70 backdrop-blur-sm p-6 sm:p-7 ring-1 ring-white/[0.04] shadow-lg shadow-black/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
              <KeyRound className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Change password</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Update your workspace login password.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Current password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={pwCurrent}
                  onChange={(e) => setPwCurrent(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 pr-11 text-sm text-white placeholder-neutral-600 focus:border-violet-500/40 focus:outline-none focus:ring-2 focus:ring-violet-500/15"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">New password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 pr-11 text-sm text-white placeholder-neutral-600 focus:border-violet-500/40 focus:outline-none focus:ring-2 focus:ring-violet-500/15"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {pwNew.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i <= score ? strengthColor : 'bg-neutral-800'}`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-neutral-500">{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Confirm new password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  onKeyDown={(e) => e.key === 'Enter' && void changePassword()}
                  className={`w-full rounded-xl border bg-neutral-950/80 px-4 py-3 pr-11 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 transition-colors ${
                    pwConfirm && pwNew !== pwConfirm
                      ? 'border-red-500/40 focus:ring-red-500/15'
                      : pwConfirm && pwNew === pwConfirm
                        ? 'border-emerald-500/40 focus:ring-emerald-500/15'
                        : 'border-neutral-800 focus:border-violet-500/40 focus:ring-violet-500/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {pwConfirm && pwNew === pwConfirm && (
                  <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>
          </div>

          {pwMsg && (
            <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${pwMsg.type === 'ok' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
              {pwMsg.text}
            </div>
          )}

          <button
            type="button"
            onClick={() => void changePassword()}
            disabled={pwBusy || !pwCurrent || !pwNew || !pwConfirm || pwNew !== pwConfirm}
            className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-6 py-3 text-sm font-semibold text-white disabled:opacity-40 transition-colors"
          >
            {pwBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            Update password
          </button>
        </section>
      </main>
    </div>
  )
}
