'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  PhoneCall,
  Users,
  TrendingUp,
  CheckCircle,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Target,
  Headphones,
  BarChart3,
  Shield,
  Mail,
  MapPin,
  Globe,
} from 'lucide-react'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Contact', href: '#contact' },
]

const SERVICES = [
  {
    icon: PhoneCall,
    title: 'Outbound Sales Calling',
    desc: 'Dedicated teams making high-volume outbound calls to your prospects, converting cold leads into warm opportunities.',
  },
  {
    icon: Target,
    title: 'Lead Generation',
    desc: 'We source, qualify, and deliver sales-ready leads so your closers can focus on what they do best.',
  },
  {
    icon: Headphones,
    title: 'Customer Follow-Up',
    desc: 'Structured callback systems and follow-up cadences to ensure no lead falls through the cracks.',
  },
  {
    icon: BarChart3,
    title: 'Sales Reporting',
    desc: 'Real-time dashboards and weekly reports giving you full visibility into pipeline, performance, and KPIs.',
  },
  {
    icon: Users,
    title: 'Dedicated Sales Teams',
    desc: 'Fully managed sales representatives working exclusively for your business under your brand.',
  },
  {
    icon: Shield,
    title: 'Compliance & Quality',
    desc: 'All calls conducted to FCA and ICO standards with full call recording and quality assurance processes.',
  },
]

const STATS = [
  { value: '500+', label: 'Leads Processed Monthly' },
  { value: '92%', label: 'Client Retention Rate' },
  { value: '3x', label: 'Average ROI for Clients' },
  { value: '5+', label: 'Years of Experience' },
]

const STEPS = [
  {
    num: '01',
    title: 'Onboarding & Discovery',
    desc: 'We learn your product, target market, and sales goals to build a tailored outreach strategy.',
  },
  {
    num: '02',
    title: 'Team Setup & Training',
    desc: 'Our sales representatives are trained on your script, objections, and CRM workflow before day one.',
  },
  {
    num: '03',
    title: 'Live & Reporting',
    desc: 'Campaigns go live with full tracking. You get weekly reporting and direct access to your account manager.',
  },
]

function smoothScroll(href: string) {
  const el = document.querySelector(href)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      const ids = NAV_LINKS.map((n) => n.href.replace('#', ''))
      const current = ids.find((id) => {
        const el = document.getElementById(id)
        if (!el) return false
        const rect = el.getBoundingClientRect()
        return rect.top <= 120 && rect.bottom >= 120
      })
      if (current) setActiveSection(`#${current}`)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <div style={{ backgroundColor: '#05080f', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(5,8,15,0.95)' : 'rgba(5,8,15,0.7)',
          backdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid rgba(245,194,107,0.15)' : 'none',
          height: '68px',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8 flex items-center justify-between h-full">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="flex items-center gap-2 font-bold text-lg"
            style={{ color: '#F5C26B' }}
          >
            <Globe size={22} style={{ color: '#F5C26B' }} />
            GDF Internationals
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); smoothScroll(item.href) }}
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: activeSection === item.href ? '#F5C26B' : 'rgba(255,255,255,0.78)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#F5C26B' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = activeSection === item.href ? '#F5C26B' : 'rgba(255,255,255,0.78)' }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Login CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
              style={{ border: '1.5px solid rgba(245,194,107,0.5)', color: '#F5C26B', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245,194,107,0.1)'; e.currentTarget.style.borderColor = '#F5C26B' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(245,194,107,0.5)' }}
            >
              Team Login <ArrowRight size={14} />
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ backgroundColor: 'rgba(245,194,107,0.12)', color: '#F5C26B' }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          ref={menuRef}
          className="fixed inset-0 z-40 flex flex-col pt-[68px]"
          style={{ backgroundColor: 'rgba(5,8,15,0.97)', backdropFilter: 'blur(16px)' }}
        >
          <div className="flex flex-col gap-1 px-6 py-6">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); smoothScroll(item.href); closeMobile() }}
                className="py-4 text-lg font-medium border-b"
                style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={closeMobile}
              className="mt-6 flex items-center justify-center gap-2 py-4 rounded-lg font-semibold text-base"
              style={{ backgroundColor: '#F5C26B', color: '#000' }}
            >
              Team Login <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center pt-[68px]"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,40,80,0.9) 0%, rgba(5,8,15,1) 70%)',
        }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(245,194,107,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,194,107,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold uppercase tracking-wider"
              style={{ backgroundColor: 'rgba(245,194,107,0.1)', border: '1px solid rgba(245,194,107,0.35)', color: '#F5C26B' }}
            >
              <TrendingUp size={14} />
              Sales Outsourcing Experts
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              We close{' '}
              <span style={{ color: '#F5C26B' }}>more deals</span>
              <br />
              so you can{' '}
              <span style={{ color: '#F5C26B' }}>scale faster</span>
            </h1>

            <p className="text-lg md:text-xl mb-10" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '580px' }}>
              GDF Internationals provides dedicated outbound sales teams that generate qualified leads, handle calls, and drive revenue — fully managed, fully compliant.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); smoothScroll('#contact') }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-base font-bold transition-all duration-200"
                style={{ backgroundColor: '#F5C26B', color: '#000', boxShadow: '0 0 30px rgba(245,194,107,0.25)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ffd47a'; e.currentTarget.style.boxShadow = '0 0 50px rgba(245,194,107,0.4)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5C26B'; e.currentTarget.style.boxShadow = '0 0 30px rgba(245,194,107,0.25)' }}
              >
                Get in touch <ArrowRight size={18} />
              </a>
              <a
                href="#services"
                onClick={(e) => { e.preventDefault(); smoothScroll('#services') }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-base font-semibold text-white transition-all duration-200"
                style={{ border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F5C26B'; e.currentTarget.style.color = '#F5C26B' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff' }}
              >
                Our services <ChevronDown size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ backgroundColor: 'rgba(245,194,107,0.06)', borderTop: '1px solid rgba(245,194,107,0.12)', borderBottom: '1px solid rgba(245,194,107,0.12)' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#F5C26B' }}>{s.value}</div>
              <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4" style={{ backgroundColor: 'rgba(245,194,107,0.1)', color: '#F5C26B', border: '1px solid rgba(245,194,107,0.25)' }}>
              What We Do
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Full-service <span style={{ color: '#F5C26B' }}>sales outsourcing</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
              From first call to closed deal, we handle every step of the sales process for your business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((svc) => (
              <div
                key={svc.title}
                className="rounded-xl p-7 transition-all duration-200 group"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(245,194,107,0.3)'; e.currentTarget.style.backgroundColor = 'rgba(245,194,107,0.05)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)' }}
              >
                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(245,194,107,0.15)' }}>
                  <svc.icon size={20} style={{ color: '#F5C26B' }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{svc.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section id="why-us" className="py-24" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4" style={{ backgroundColor: 'rgba(245,194,107,0.1)', color: '#F5C26B', border: '1px solid rgba(245,194,107,0.25)' }}>
                Why GDF
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Built for <span style={{ color: '#F5C26B' }}>results,</span> not just activity
              </h2>
              <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
                We don&apos;t just make calls. We build structured sales processes, train our teams on your product, and deliver measurable outcomes tied to your growth targets.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  'Dedicated reps trained on your product & script',
                  'FCA & ICO compliant outreach processes',
                  'Live CRM tracking with real-time reporting',
                  'No long-term lock-in — results-driven contracts',
                  'UK-based management with global reach',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle size={18} style={{ color: '#F5C26B', marginTop: '2px', flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {[
                { label: 'Avg. Calls Per Day', value: '200+', sub: 'Per representative' },
                { label: 'Lead Conversion', value: '18%', sub: 'Industry avg. 8%' },
                { label: 'Onboarding Time', value: '7 Days', sub: 'From sign-up to live' },
                { label: 'Quality Score', value: '96%', sub: 'QA monitored calls' },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl p-6 text-center"
                  style={{ backgroundColor: 'rgba(245,194,107,0.07)', border: '1px solid rgba(245,194,107,0.15)' }}
                >
                  <div className="text-3xl font-bold mb-1" style={{ color: '#F5C26B' }}>{card.value}</div>
                  <div className="text-sm font-semibold text-white mb-1">{card.label}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{card.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4" style={{ backgroundColor: 'rgba(245,194,107,0.1)', color: '#F5C26B', border: '1px solid rgba(245,194,107,0.25)' }}>
              Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Up and running in <span style={{ color: '#F5C26B' }}>days, not months</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px" style={{ backgroundColor: 'rgba(245,194,107,0.2)' }} />
            {STEPS.map((step) => (
              <div key={step.num} className="text-center relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold" style={{ backgroundColor: 'rgba(245,194,107,0.1)', border: '1px solid rgba(245,194,107,0.3)', color: '#F5C26B' }}>
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT CTA ── */}
      <section id="contact" className="py-24" style={{ backgroundColor: 'rgba(245,194,107,0.04)', borderTop: '1px solid rgba(245,194,107,0.12)' }}>
        <div className="max-w-3xl mx-auto px-5 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6" style={{ backgroundColor: 'rgba(245,194,107,0.1)', color: '#F5C26B', border: '1px solid rgba(245,194,107,0.25)' }}>
            Get Started
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">
            Ready to <span style={{ color: '#F5C26B' }}>grow your revenue?</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Speak with our team today and find out how GDF Internationals can build a dedicated sales operation for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <a
              href="mailto:harshit@gdfinternationals.com"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-base font-bold transition-all duration-200"
              style={{ backgroundColor: '#F5C26B', color: '#000' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ffd47a' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5C26B' }}
            >
              <Mail size={18} /> Email Us
            </a>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-base font-semibold transition-all duration-200"
              style={{ border: '1.5px solid rgba(245,194,107,0.5)', color: '#F5C26B', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245,194,107,0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Team Login <ArrowRight size={16} />
            </Link>
          </div>

          {/* Contact info */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <div className="flex items-center gap-2 justify-center">
              <Mail size={15} style={{ color: '#F5C26B' }} />
              harshit@gdfinternationals.com
            </div>
            <div className="flex items-center gap-2 justify-center">
              <MapPin size={15} style={{ color: '#F5C26B' }} />
              United Kingdom
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Globe size={15} style={{ color: '#F5C26B' }} />
              gdfinternationals.com
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#03050a' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold" style={{ color: '#F5C26B' }}>
            <Globe size={18} />
            GDF Internationals
          </div>
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
            © {new Date().getFullYear()} GDF Internationals Ltd. All rights reserved.
          </p>
          <Link
            href="/login"
            className="text-xs font-medium transition-colors"
            style={{ color: 'rgba(245,194,107,0.6)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#F5C26B' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,194,107,0.6)' }}
          >
            Team Login →
          </Link>
        </div>
      </footer>
    </div>
  )
}
