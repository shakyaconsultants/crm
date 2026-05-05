'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, User, Menu, X } from 'lucide-react'
import Link from 'next/link'

const ADMIN_NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/employees', label: 'Team' },
  { href: '/admin/payroll', label: 'Payroll' },
  { href: '/admin/leave-requests', label: 'Leave' },
  { href: '/admin/attendance-review', label: 'Attendance' },
  { href: '/admin/advisors', label: 'Advisors' },
  { href: '/admin/case-assessors', label: 'Assessors' },
] as const

function adminLinkActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function BeeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse cx="7.8" cy="11.5" rx="2.8" ry="4" fill="white" fillOpacity="0.45" />
      <ellipse cx="16.2" cy="11.5" rx="2.8" ry="4" fill="white" fillOpacity="0.45" />
      <ellipse cx="12" cy="13.5" rx="4.2" ry="5.5" fill="#FBBF24" stroke="white" strokeWidth="0.9" />
      <path
        d="M8.2 11.5h7.6M8.5 14.2h7M9 16.8h6"
        stroke="#1c1917"
        strokeOpacity="0.35"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="12" cy="6.8" r="3.2" fill="#FBBF24" stroke="white" strokeWidth="0.9" />
      <circle cx="10.2" cy="6.2" r="0.65" fill="#1c1917" />
      <circle cx="13.8" cy="6.2" r="0.65" fill="#1c1917" />
      <path d="M14.8 4.6l2-1.2M15.6 6.4l2.1-0.8" stroke="#1c1917" strokeWidth="0.85" strokeLinecap="round" strokeOpacity="0.6" />
    </svg>
  )
}

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{
    name: string
    role: string
    profileImageUrl?: string | null
    crmAccess?: boolean
  } | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const load = () => {
      fetch('/api/user')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setUser(data.user)
        })
        .catch(() => {})
    }
    load()
    window.addEventListener('bee-crm:user-updated', load)
    return () => window.removeEventListener('bee-crm:user-updated', load)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <nav className="bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between min-h-16 py-2 md:py-0 md:h-16 md:items-center">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 min-w-0 flex-1">
            <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Bee CRM home">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-900/30">
                <BeeMark className="w-[18px] h-[18px]" />
              </div>
              <span className="text-white font-bold text-xl hidden sm:block">Bee CRM</span>
            </Link>
            {user?.role === 'ADMIN' && (
              <div className="hidden md:flex flex-wrap items-center gap-x-0.5 gap-y-1 ml-0 md:ml-4 pl-0 md:pl-4 md:border-l border-neutral-800 min-w-0">
                {ADMIN_NAV_LINKS.map((item) => {
                  const active = adminLinkActive(pathname, item.href, 'exact' in item ? item.exact : false)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-2.5 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-neutral-800 text-white font-medium'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            )}
            {user?.role === 'CASE_ASSESSOR' && (
              <div className="hidden md:flex items-center space-x-4 ml-6 pl-6 border-l border-neutral-800 text-sm">
                <Link href="/case-assessor" className="text-cyan-500 hover:text-cyan-400 transition-colors">My cases</Link>
              </div>
            )}
            {user?.role === 'ADVISOR' && (
              <div className="hidden md:flex items-center space-x-4 ml-6 pl-6 border-l border-neutral-800 text-sm">
                <span className="text-amber-500 font-medium">Advisor Workspace</span>
              </div>
            )}
            {user?.role === 'EMPLOYEE' && (
              <div className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-neutral-800 text-sm">
                <Link
                  href="/employee"
                  className={`px-2.5 py-1.5 rounded-md transition-colors ${
                    pathname === '/employee'
                      ? 'bg-neutral-800 text-white font-medium'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  Workspace
                </Link>
                <Link
                  href="/employee/crm"
                  className={`px-2.5 py-1.5 rounded-md transition-colors ${
                    user.crmAccess === false
                      ? 'text-neutral-600 pointer-events-none cursor-not-allowed'
                      : pathname.startsWith('/employee/crm')
                        ? 'bg-neutral-800 text-white font-medium'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  CRM
                </Link>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center border-l border-neutral-800 pl-6 ml-6">
            <div className="flex items-center gap-3 mr-6">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-800 shrink-0 flex items-center justify-center ring-1 ring-neutral-700">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-neutral-400" aria-hidden />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white leading-none">{user?.name || 'Loading...'}</p>
                <p className="text-xs text-neutral-500 mt-1">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-neutral-400 hover:text-red-400 transition-colors p-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-neutral-400 hover:text-white p-2"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950 pb-4">
          <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{user?.name || 'Loading...'}</p>
              <p className="text-xs text-neutral-500">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-neutral-400 hover:text-red-400 text-sm flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
          {user?.role === 'ADMIN' && (
            <div className="px-2 pt-2 pb-3 space-y-0.5">
              <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Admin</p>
              {ADMIN_NAV_LINKS.map((item) => {
                const active = adminLinkActive(pathname, item.href, 'exact' in item ? item.exact : false)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 text-sm font-medium rounded-md ${
                      active ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )}
          {user?.role === 'EMPLOYEE' && (
            <div className="px-2 pt-2 pb-3 space-y-0.5 border-t border-neutral-800">
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Employee</p>
              <Link
                href="/employee"
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 text-sm font-medium rounded-md ${
                  pathname === '/employee' ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                }`}
              >
                Workspace
              </Link>
              <Link
                href="/employee/crm"
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 text-sm font-medium rounded-md ${
                  user.crmAccess === false
                    ? 'text-neutral-600 pointer-events-none'
                    : pathname.startsWith('/employee/crm')
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
                }`}
              >
                CRM
              </Link>
            </div>
          )}
          {user?.role === 'CASE_ASSESSOR' && (
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/case-assessor" className="block px-3 py-2 text-base font-medium text-cyan-500 hover:text-cyan-400 hover:bg-neutral-800 rounded-md">My cases</Link>
            </div>
          )}
          {user?.role === 'ADVISOR' && (
            <div className="px-2 pt-2 pb-3 space-y-1">
              <span className="block px-3 py-2 text-base font-medium text-amber-500">Advisor Workspace</span>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
