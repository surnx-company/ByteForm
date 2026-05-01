'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Color helpers used only for runtime-computed inline styles (progress bars, selected state)
const W = '#6B1A2A'
const I = '#F7F3EC'
const B = '#1C1410'
const M = '#7A6A60'
const D = '#9A8A80'
const WA = (a: number) => `rgba(107,26,42,${a})`
const IA = (a: number) => `rgba(247,243,236,${a})`
const serif = { fontFamily: 'var(--font-serif)' } as const

const demoQuestions = [
  {
    q: 'What best describes your role?',
    opts: ['Founder / Entrepreneur', 'Product / Design', 'Marketing / Growth', 'Agency / Consultant'],
  },
  {
    q: "What's your biggest challenge with forms right now?",
    opts: ['Low completion rates', 'Forms look unprofessional', 'Too complex to build', 'No analytics or insights'],
  },
  {
    q: 'How many forms do you send per month?',
    opts: ['Just a few', '5 – 20', '20 – 100', '100+'],
  },
]

const faqs = [
  {
    q: 'How is this different from Typeform?',
    a: "Typeform is a great product, but it starts at $25/month with significant limits and gets expensive fast. ByteForm gives you the same conversational experience at a fraction of the price — and we don't lock your best features behind the top tier.",
  },
  {
    q: 'Can I use my own brand colours?',
    a: 'Yes. Pro and Team plans let you fully customise colours, fonts, and remove ByteForm branding so every form feels completely native to your brand.',
  },
  {
    q: 'Can I embed a form on my website?',
    a: "Yes. Every ByteForm has an embeddable snippet you can drop into any website. It renders natively and inherits your page's scroll behaviour.",
  },
  {
    q: 'What happens when I hit my response limit?',
    a: "We'll notify you before you hit your limit. You can upgrade at any time, or wait for your monthly limit to reset. We never delete responses or lock you out.",
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All data is encrypted in transit and at rest. We use Supabase (PostgreSQL) with row-level security. We never sell or share your data.',
  },
]

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [demoValue, setDemoValue] = useState('')
  const [demoSubmitted, setDemoSubmitted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change / resize
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const [heroStep, setHeroStep] = useState(0)
  const [heroAnswers, setHeroAnswers] = useState<(string | null)[]>([null, null, null])
  const heroDone = heroStep >= demoQuestions.length
  const heroProgress = heroDone ? 100 : Math.round((heroStep / demoQuestions.length) * 100)
  const currentAnswer = heroAnswers[heroStep] ?? null

  function heroSelect(opt: string) {
    setHeroAnswers(prev => prev.map((a, i) => i === heroStep ? opt : a))
  }
  function heroNext() { if (currentAnswer) setHeroStep(s => s + 1) }
  function heroBack() { setHeroStep(s => Math.max(0, s - 1)) }
  function heroReset() { setHeroStep(0); setHeroAnswers([null, null, null]) }

  const navLinks = [
    ['Features', '#features'],
    ['Pricing', '#pricing'],
    ['Blog', '/blog'],
    ['Demo', '/demo'],
  ] as const

  return (
    <div className="bg-bg text-fg font-sans">

      {/* ── NAV ── */}
      <nav className={[
        'sticky top-0 z-50 px-5 md:px-10 h-[60px] flex items-center justify-between transition-all duration-200',
        scrolled
          ? 'bg-bg/92 backdrop-blur-xl border-b border-accent/18 shadow-sm'
          : 'bg-bg border-b border-accent/8',
      ].join(' ')}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMenuOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.svg" alt="ByteForm" className="h-[34px] w-[34px]" />
          <div className="flex items-baseline gap-px font-serif text-[20px] tracking-[-0.4px]">
            <span className="text-fg">Byte</span>
            <span className="text-accent">Form</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(([label, href]) => (
            <a key={label} href={href} className="text-[13px] text-fg-muted hover:text-fg transition-colors">
              {label}
            </a>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link href="/auth/login" className="text-[13px] text-fg border border-accent/25 px-[18px] py-2 rounded-md hover:bg-accent/5 transition-colors">
            Log in
          </Link>
          <Link href="/auth/login?mode=signup" className="text-[13px] text-[#F7F3EC] bg-accent px-[18px] py-2 rounded-md hover:bg-accent-hover transition-colors">
            Start free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 -mr-2"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span className={`block w-5 h-[1.5px] bg-fg transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-fg transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-fg transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] z-40 bg-bg flex flex-col px-5 py-8 gap-6">
          {navLinks.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-lg text-fg-muted hover:text-fg transition-colors border-b border-accent/8 pb-6"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2">
            <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="text-center text-[14px] text-fg border border-accent/25 px-5 py-3 rounded-md">
              Log in
            </Link>
            <Link href="/auth/login?mode=signup" onClick={() => setMenuOpen(false)} className="text-center text-[14px] text-[#F7F3EC] bg-accent px-5 py-3 rounded-md">
              Start free
            </Link>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="px-5 pt-14 pb-16 md:px-10 md:pt-20 md:pb-16 max-w-[1100px] mx-auto grid grid-cols-1 gap-12 md:grid-cols-[1.15fr_0.85fr] md:gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 border border-accent/28 px-3.5 py-[5px] rounded-full mb-9">
            <div className="w-[5px] h-[5px] rounded-full bg-accent shrink-0" />
            <span className="text-[11px] text-accent tracking-[0.9px] uppercase">
              Beautiful forms. Honest pricing.
            </span>
          </div>
          <h1 className="font-serif text-[clamp(36px,6vw,54px)] text-fg leading-[1.07] tracking-[-1.8px] mb-5 font-normal">
            Forms your users<br />actually want to fill.
          </h1>
          <p className="text-[15px] text-fg-muted leading-[1.78] max-w-[370px] mb-10">
            Your forms are the first impression. Make them count without the $99/mo bill. ByteForm builds beautiful, AI-powered forms your audience genuinely wants to complete.
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Link href="/auth/login?mode=signup" className="text-[14px] text-[#F7F3EC] bg-accent px-7 py-3.5 rounded-lg hover:bg-accent-hover transition-colors">
              Create your first form
            </Link>
            <Link href="/demo" className="text-[14px] text-fg border border-accent/28 px-7 py-3.5 rounded-lg hover:bg-accent/5 transition-colors">
              See it in action
            </Link>
          </div>
          <p className="text-[12px] text-fg-dim mt-3.5">No credit card required · Free to start</p>
        </div>

        {/* Hero interactive demo card */}
        <div className="bg-white rounded-[14px] p-6 md:p-8 border border-accent/10 min-h-[320px] flex flex-col justify-between">
          <div>
            {/* Progress bar */}
            <div className="h-[2px] bg-accent/8 rounded-full mb-6 overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-500 ease-out" style={{ width: `${heroProgress}%` }} />
            </div>

            {heroDone ? (
              <div className="text-center py-5">
                <div className="text-3xl mb-4">🎉</div>
                <h3 className="font-serif text-[22px] text-fg font-normal mb-3 leading-snug">You&apos;re all set.</h3>
                <p className="text-[13px] text-fg-muted leading-[1.7] mb-6">
                  That calm, focused experience? That&apos;s what your users will feel every time they fill a ByteForm.
                </p>
                <div className="flex flex-col gap-2.5">
                  <Link href="/auth/login?mode=signup" className="block bg-accent text-[#F7F3EC] no-underline py-2.5 rounded-lg text-[13px] text-center hover:bg-accent-hover transition-colors">
                    Build your first form →
                  </Link>
                  <button onClick={heroReset} className="bg-transparent text-fg-muted border border-accent/20 py-2.5 rounded-lg text-[12px] cursor-pointer hover:bg-accent/5 transition-colors">
                    Start over
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between mb-5">
                  <span className="text-[11px] text-fg-dim tracking-[0.5px]">{heroStep + 1} OF {demoQuestions.length}</span>
                  <span className="text-[11px] text-fg-dim">{heroProgress}%</span>
                </div>
                <h3 className="font-serif text-[20px] text-fg mb-5 leading-snug font-normal">
                  {demoQuestions[heroStep].q}
                </h3>
                <div className="flex flex-col gap-2">
                  {demoQuestions[heroStep].opts.map(opt => {
                    const selected = currentAnswer === opt
                    return (
                      <div
                        key={opt}
                        onClick={() => heroSelect(opt)}
                        className="px-4 py-2.5 rounded-lg text-[13px] cursor-pointer select-none transition-all duration-150"
                        style={{
                          border: selected ? `1.5px solid ${W}` : `0.5px solid ${WA(0.15)}`,
                          color: selected ? W : B,
                          background: selected ? WA(0.05) : 'transparent',
                        }}
                      >
                        {opt}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {!heroDone && (
            <div className="mt-5 flex justify-between items-center">
              {heroStep > 0 ? (
                <button onClick={heroBack} className="bg-transparent text-fg-muted border-none text-[12px] cursor-pointer p-0 hover:text-fg transition-colors">
                  ← Back
                </button>
              ) : (
                <span className="text-[11px] text-fg-dim">Click an option</span>
              )}
              <button
                onClick={heroNext}
                disabled={!currentAnswer}
                className="text-[#F7F3EC] border-none px-5 py-2 rounded-md text-[13px] transition-colors duration-200"
                style={{ background: currentAnswer ? W : WA(0.2), cursor: currentAnswer ? 'pointer' : 'default' }}
              >
                {heroStep === demoQuestions.length - 1 ? 'Finish ✓' : 'Next →'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── LIVE DEMO STRIP ── */}
      <section className="px-5 py-16 md:px-10 md:py-16 bg-white text-center">
        <p className="text-[11px] text-accent tracking-[1.2px] uppercase mb-3">Try it yourself</p>
        <h2 className="font-serif text-[28px] md:text-[34px] text-fg font-normal mb-2.5">Don&apos;t take our word for it.</h2>
        <p className="text-[15px] text-fg-muted max-w-[400px] mx-auto mb-9 leading-[1.7]">
          Click through a real ByteForm below. This is exactly what your users will experience.
        </p>
        <div className="bg-bg rounded-2xl p-8 md:p-12 border border-accent/10 max-w-[500px] mx-auto">
          {demoSubmitted ? (
            <div className="py-8">
              <div className="font-serif text-[28px] text-fg font-normal mb-3">Thank you. 🎉</div>
              <p className="text-[14px] text-fg-muted leading-[1.7] mb-6">
                That&apos;s exactly what your respondents will feel — calm, clear, done.
              </p>
              <button
                onClick={() => { setDemoSubmitted(false); setDemoValue('') }}
                className="bg-transparent text-accent border border-accent/30 px-5 py-2 rounded-md text-[13px] cursor-pointer hover:bg-accent/5 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="h-[2px] bg-accent/8 rounded-full mb-7 overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: '20%' }} />
              </div>
              <h3 className="font-serif text-[22px] text-fg font-normal mb-6 leading-snug">
                What&apos;s your biggest challenge with forms right now?
              </h3>
              <textarea
                value={demoValue}
                onChange={e => setDemoValue(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full border border-accent/20 rounded-lg p-3.5 text-[14px] text-fg bg-white resize-none h-20 font-sans outline-none focus:border-accent/50 box-border transition-colors"
              />
              <div className="mt-4 flex justify-between items-center">
                <span className="text-[11px] text-fg-dim">Press Enter ↵ or</span>
                <button
                  onClick={() => demoValue.trim() && setDemoSubmitted(true)}
                  className="text-[#F7F3EC] border-none px-5 py-2.5 rounded-md text-[13px] transition-colors duration-200"
                  style={{ background: demoValue.trim() ? W : WA(0.3), cursor: demoValue.trim() ? 'pointer' : 'default' }}
                >
                  OK →
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── TWO SIDES ── */}
      <section id="features" className="px-5 py-16 md:px-10 md:py-20 max-w-[1100px] mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-serif text-[28px] md:text-[36px] text-fg font-normal leading-snug">
            Built for two people.<br />You — and your users.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Builder side */}
          <div className="bg-white rounded-[14px] p-8 border border-accent/10">
            <div className="inline-block bg-accent/6 px-3 py-1 rounded-xl mb-5">
              <span className="text-[11px] text-accent tracking-[0.5px]">For you — the builder</span>
            </div>
            <h3 className="font-serif text-[22px] text-fg font-normal mb-4">Ready in under 2 minutes.</h3>
            <div className="flex flex-col gap-2.5 mb-5">
              {[
                { label: 'Welcome screen', active: false },
                { label: 'Multiple choice', active: true },
                { label: 'Short text', active: false },
                { label: 'Thank you screen', active: false },
              ].map(({ label, active }) => (
                <div key={label} className={`flex items-center gap-3 px-3.5 py-2.5 bg-bg rounded-lg ${active ? 'border border-accent/20' : ''}`}>
                  <div className="w-7 h-7 bg-white rounded-md border border-accent/15 shrink-0 flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${active ? 'bg-accent' : 'bg-accent/20'}`} />
                  </div>
                  <span className={`text-[13px] ${active ? 'text-accent font-medium' : 'text-fg'}`}>{label}</span>
                  <div className="ml-auto flex flex-col gap-[3px]">
                    {[0, 1, 2].map(i => <div key={i} className="w-3.5 h-[1.5px] bg-fg-dim rounded" />)}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-fg-muted leading-[1.65]">Drag, drop, publish. One click to share.</p>
          </div>

          {/* Filler side */}
          <div className="bg-white rounded-[14px] p-8 border border-accent/10">
            <div className="inline-block bg-accent/6 px-3 py-1 rounded-xl mb-5">
              <span className="text-[11px] text-accent tracking-[0.5px]">For them — the respondent</span>
            </div>
            <h3 className="font-serif text-[22px] text-fg font-normal mb-4">An experience, not a chore.</h3>
            <div className="bg-bg rounded-xl p-6 border border-accent/8 mb-4">
              <div className="h-[1.5px] bg-accent/8 rounded mb-4 overflow-hidden">
                <div className="h-full bg-accent rounded" style={{ width: '60%' }} />
              </div>
              <p className="font-serif text-[17px] text-fg font-normal mb-4 leading-snug">
                How likely are you to recommend us?
              </p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 9, 10].map(n => (
                  <div key={n} className="flex-1 py-1.5 rounded-md text-center text-[12px]"
                    style={{
                      border: n === 9 ? `1.5px solid ${W}` : `0.5px solid ${WA(0.15)}`,
                      color: n === 9 ? W : D,
                      background: n === 9 ? WA(0.05) : 'transparent',
                    }}
                  >{n}</div>
                ))}
              </div>
            </div>
            <p className="text-[13px] text-fg-muted leading-[1.65]">
              Calm, focused, one question at a time. Completion rates follow.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMPLETION RATE ── */}
      <section className="bg-accent px-5 py-16 md:px-10 md:py-[72px]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 items-center">
          <div>
            <p className="text-[11px] text-bg/50 tracking-[1.2px] uppercase mb-4">The completion rate problem</p>
            <h2 className="font-serif text-[28px] md:text-[36px] text-bg font-normal leading-snug mb-4">
              Most forms lose<br />half their respondents.
            </h2>
            <p className="text-[15px] text-bg/60 leading-[1.78] mb-7">
              The average form completion rate is 47%. ByteForm users average 91%.
              That difference isn&apos;t a feature — it&apos;s revenue.
            </p>
            <div className="bg-bg/8 rounded-xl px-6 py-5">
              <p className="text-[13px] text-bg/60 mb-1">At 1,000 monthly views, that&apos;s</p>
              <p className="font-serif text-[28px] text-bg font-normal">440 more responses</p>
              <p className="text-[13px] text-bg/50 mt-1">without spending more on traffic.</p>
            </div>
          </div>
          <div>
            {[
              { label: 'Average form builder', pct: 47, active: false },
              { label: 'ByteForm', pct: 91, active: true },
            ].map(({ label, pct, active }) => (
              <div key={label} className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className={`text-[13px] ${active ? 'text-bg font-medium' : 'text-bg/60'}`}>{label}</span>
                  <span className={`text-[13px] ${active ? 'text-bg font-medium' : 'text-bg/60'}`}>{pct}%</span>
                </div>
                <div className="h-2.5 bg-bg/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${active ? 'bg-bg' : 'bg-bg/30'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[{ n: '2×', label: 'More responses' }, { n: '0%', label: 'Extra ad spend' }].map(({ n, label }) => (
                <div key={label} className="bg-bg/8 rounded-xl px-5 py-4">
                  <div className="font-serif text-[28px] text-bg font-normal">{n}</div>
                  <div className="text-[12px] text-bg/50 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESPONDENT EXPERIENCE ── */}
      <section className="px-5 py-16 md:px-10 md:py-20 bg-white">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 items-center">
          <div>
            <p className="text-[11px] text-accent tracking-[1.2px] uppercase mb-3.5">The respondent experience</p>
            <h2 className="font-serif text-[28px] md:text-[34px] text-fg font-normal leading-snug mb-4">
              Your brand,<br />at its best.
            </h2>
            <p className="text-[15px] text-fg-muted leading-[1.78] mb-7">
              Every form your users open reflects on you. ByteForm makes sure that reflection
              is always polished, calm, and intentional.
            </p>
            {[
              'One focused question at a time, no overwhelm',
              'Keyboard-first navigation, instant response',
              'Progress bar that makes finishing feel close',
              'Works beautifully on any device',
            ].map(point => (
              <div key={point} className="flex items-start gap-3.5 mb-3.5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-[7px] shrink-0" />
                <p className="text-[14px] text-fg-muted leading-[1.65]">{point}</p>
              </div>
            ))}
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="w-[240px] bg-fg rounded-[32px] p-3 border-[6px] border-fg">
              <div className="bg-bg rounded-[22px] overflow-hidden">
                <div className="p-5">
                  <div className="h-[2px] bg-accent/8 rounded mb-4 overflow-hidden">
                    <div className="h-full bg-accent rounded" style={{ width: '60%' }} />
                  </div>
                  <p className="text-[11px] text-fg-dim mb-2.5">3 OF 5</p>
                  <p className="font-serif text-[15px] text-fg font-normal leading-snug mb-3.5">
                    How did you hear about us?
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {['Word of mouth', 'LinkedIn', 'Search / Google', 'Other'].map((opt, i) => (
                      <div key={opt} className="px-3 py-2 rounded-md text-[11px]"
                        style={{
                          border: i === 1 ? `1.5px solid ${W}` : `0.5px solid ${WA(0.15)}`,
                          color: i === 1 ? W : B,
                          background: i === 1 ? WA(0.05) : 'transparent',
                        }}
                      >{opt}</div>
                    ))}
                  </div>
                  <div className="mt-3.5 text-right">
                    <button className="border-none px-3.5 py-1.5 rounded-md text-[11px] cursor-pointer" style={{ background: W, color: I }}>
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUESTION TYPES ── */}
      <section className="px-5 py-16 md:px-10 md:py-20 max-w-[1100px] mx-auto">
        <div className="text-center mb-13">
          <p className="text-[11px] text-accent tracking-[1.2px] uppercase mb-3">13 question types</p>
          <h2 className="font-serif text-[28px] md:text-[34px] text-fg font-normal leading-snug">
            Every answer format.<br />All of them beautiful.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Short text */}
          <div className="bg-white rounded-xl p-5 border border-accent/10">
            <p className="text-[11px] text-fg-dim tracking-[0.8px] uppercase mb-3.5">Short text</p>
            <div className="border-b-[1.5px] border-accent pb-1.5 text-[13px] text-fg">Your answer here_</div>
          </div>
          {/* Multiple choice */}
          <div className="bg-white rounded-xl p-5 border border-accent/10">
            <p className="text-[11px] text-fg-dim tracking-[0.8px] uppercase mb-3.5">Multiple choice</p>
            <div className="flex flex-col gap-1.5">
              {['Option A', 'Option B', 'Option C'].map((opt, i) => (
                <div key={opt} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ border: i === 0 ? `1.5px solid ${W}` : `0.5px solid ${WA(0.2)}`, background: i === 0 ? WA(0.08) : 'transparent' }} />
                  <span className="text-[12px]" style={{ color: i === 0 ? W : M }}>{opt}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Star rating */}
          <div className="bg-white rounded-xl p-5 border border-accent/10">
            <p className="text-[11px] text-fg-dim tracking-[0.8px] uppercase mb-3.5">Star rating</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-5 h-5 rounded-[3px]" style={{ background: i <= 4 ? W : WA(0.12) }} />
              ))}
            </div>
          </div>
          {/* Yes / No */}
          <div className="bg-white rounded-xl p-5 border border-accent/10">
            <p className="text-[11px] text-fg-dim tracking-[0.8px] uppercase mb-3.5">Yes / No</p>
            <div className="flex gap-2">
              <div className="flex-1 py-2 rounded-md text-center text-[12px]" style={{ border: `1.5px solid ${W}`, color: W, background: WA(0.05) }}>Yes</div>
              <div className="flex-1 py-2 rounded-md text-center text-[12px]" style={{ border: `0.5px solid ${WA(0.15)}`, color: M }}>No</div>
            </div>
          </div>
          {/* NPS */}
          <div className="bg-white rounded-xl p-5 border border-accent/10">
            <p className="text-[11px] text-fg-dim tracking-[0.8px] uppercase mb-3.5">Rating (NPS)</p>
            <div className="flex gap-1">
              {[1, 3, 5, 9, 10].map(n => (
                <div key={n} className="flex-1 py-1 rounded text-center text-[10px]"
                  style={{ border: n === 9 ? `1.5px solid ${W}` : `0.5px solid ${WA(0.15)}`, color: n === 9 ? W : D, background: n === 9 ? WA(0.05) : 'transparent' }}
                >{n}</div>
              ))}
            </div>
          </div>
          {/* Date */}
          <div className="bg-white rounded-xl p-5 border border-accent/10">
            <p className="text-[11px] text-fg-dim tracking-[0.8px] uppercase mb-3.5">Date</p>
            <div className="flex gap-1.5">
              {[['MM', false], ['DD', true], ['YYYY', false]].map(([lbl, active]) => (
                <div key={String(lbl)} className="flex-1 rounded-md py-1.5 text-center text-[11px]"
                  style={{ border: active ? `1.5px solid ${W}` : `0.5px solid ${WA(0.15)}`, color: active ? W : B, background: active ? WA(0.05) : 'transparent' }}
                >{String(lbl)}</div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-[13px] text-fg-dim mt-5">
          + 7 more: long text, email, number, dropdown, checkboxes, file upload, statement
        </p>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="px-5 py-16 md:px-10 md:py-20 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-13">
            <h2 className="font-serif text-[28px] md:text-[34px] text-fg font-normal">What teams are saying</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { quote: '"Completion rate jumped from 52% to 89% in the first week."', name: 'Sarah Chen', role: 'Head of Growth, Versa', initials: 'SC' },
              { quote: '"Our clients ask us what tool we used. It reflects so well on our agency."', name: 'Marco Reyes', role: 'Founder, Studio MR', initials: 'MR' },
              { quote: '"I built our entire onboarding survey in 8 minutes. It looked custom-made."', name: 'Jade Park', role: 'Product Lead, Fable', initials: 'JP' },
            ].map(({ quote, name, role, initials }) => (
              <div key={name} className="p-7 bg-bg rounded-[14px] border border-accent/10">
                <div className="w-7 h-[2px] bg-accent mb-4" />
                <p className="font-serif text-[16px] text-fg leading-[1.6] font-normal mb-5">{quote}</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-[34px] h-[34px] rounded-full bg-accent flex items-center justify-center shrink-0">
                    <span className="text-[12px] text-[#F7F3EC] font-medium">{initials}</span>
                  </div>
                  <div>
                    <p className="text-[13px] text-fg font-medium m-0">{name}</p>
                    <p className="text-[11px] text-fg-dim m-0">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-5 py-16 md:px-10 md:py-20 max-w-[1100px] mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-serif text-[28px] md:text-[34px] text-fg font-normal">Up and running in minutes.</h2>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-0">
          {[
            { n: '01', title: 'Create your form', body: 'Drag and drop questions, set your logic, customise your welcome and thank-you screens. Takes under 2 minutes.' },
            { n: '02', title: 'Publish and share', body: "Get a clean, shareable link instantly. Embed it anywhere. Your form is live the moment you click publish." },
            { n: '03', title: 'Collect responses', body: 'Watch responses come in on your dashboard. Export any time. Every submission timestamped and stored.' },
          ].map(({ n, title, body }, i) => (
            <div key={n} className={[
              i < 2 ? 'border-b border-accent/10 pb-10 md:border-b-0 md:pb-0 md:border-r md:pr-9' : '',
              i === 1 ? 'md:px-9' : '',
              i === 2 ? 'md:pl-9' : '',
            ].join(' ')}>
              <div className="font-serif text-[44px] text-accent/15 font-normal mb-4">{n}</div>
              <h3 className="text-[15px] text-fg font-medium mb-2.5">{title}</h3>
              <p className="text-[13px] text-fg-muted leading-[1.7]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="px-5 py-16 md:px-10 md:py-20 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-13">
            <h2 className="font-serif text-[28px] md:text-[34px] text-fg font-normal mb-2.5">Simple pricing.</h2>
            <p className="text-[15px] text-fg-muted">Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 items-start">
            {[
              {
                name: 'Free', sub: 'Get started', price: '$0', per: 'forever', popular: false,
                features: ['3 active forms', '100 responses/mo', 'All question types', 'ByteForm branding'],
                cta: 'Get started free', href: '/builder',
              },
              {
                name: 'Pro', sub: 'For growing teams', price: '$19', per: 'per month', popular: true,
                features: ['Unlimited forms', '1,000 responses/mo', 'Remove branding', 'Response analytics', 'Custom colours'],
                cta: 'Start with Pro', href: '/auth/login',
              },
              {
                name: 'Team', sub: 'For agencies & orgs', price: '$59', per: 'per month', popular: false,
                features: ['Everything in Pro', '5 team members', 'Unlimited responses', 'Priority support'],
                cta: 'Talk to us', href: 'mailto:hello@byteform.co',
              },
            ].map(({ name, sub, price, per, popular, features, cta, href }) => (
              <div key={name} className={`p-7 bg-bg rounded-[14px] relative ${popular ? 'border-2 border-accent' : 'border border-accent/12'}`}>
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent px-4 py-[3px] rounded-xl text-[11px] text-[#F7F3EC] tracking-[0.5px] whitespace-nowrap">
                    Most popular
                  </div>
                )}
                <p className="text-[14px] text-fg font-medium mb-1">{name}</p>
                <p className="text-[11px] text-fg-dim mb-5">{sub}</p>
                <div className="font-serif text-[36px] text-fg font-normal mb-1">{price}</div>
                <p className="text-[12px] text-fg-dim mb-6">{per}</p>
                <div className="border-t border-accent/10 pt-5 mb-6">
                  {features.map(f => (
                    <div key={f} className="flex items-center gap-2.5 mb-2.5">
                      <div className="w-[5px] h-[5px] rounded-full bg-accent shrink-0" />
                      <span className="text-[13px] text-fg-muted">{f}</span>
                    </div>
                  ))}
                </div>
                <Link href={href} className="block w-full py-2.5 text-center rounded-lg text-[13px] no-underline transition-colors"
                  style={{
                    border: popular ? 'none' : `0.5px solid ${WA(0.25)}`,
                    background: popular ? W : 'transparent',
                    color: popular ? I : B,
                  }}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-5 py-16 md:px-10 md:py-20 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[0.75fr_1.25fr] md:gap-16 items-start">
          <div>
            <h2 className="font-serif text-[28px] md:text-[34px] text-fg font-normal leading-snug">
              Questions<br />answered.
            </h2>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-accent/10">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center py-4 bg-transparent border-none cursor-pointer text-left gap-4"
                >
                  <span className={`text-[14px] ${openFaq === i ? 'text-accent font-medium' : 'text-fg'}`}>
                    {faq.q}
                  </span>
                  <span className="text-[18px] text-accent shrink-0">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <p className="text-[14px] text-fg-muted leading-[1.72] pb-4">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section className="bg-fg px-5 py-16 md:px-10 md:py-20 text-center">
        <p className="text-[11px] text-bg/35 tracking-[1.3px] uppercase mb-4">Get started today</p>
        <h2 className="font-serif text-[34px] md:text-[42px] text-bg font-normal leading-[1.12] mb-3.5">
          Your users deserve<br />better than a boring form.
        </h2>
        <p className="text-[15px] text-bg/45 max-w-[380px] mx-auto mb-10 leading-[1.75]">
          So do you. Build something that feels as good as the product you&apos;re building.
        </p>
        <Link href="/auth/login?mode=signup" className="inline-block bg-bg text-accent px-10 py-4 rounded-lg text-[14px] font-medium no-underline hover:bg-bg/90 transition-colors tracking-[0.2px]">
          Start building for free
        </Link>
        <p className="text-[12px] text-bg/25 mt-4">No credit card · Free tier always available</p>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#140E0A] px-5 py-9 md:px-10">
        <div className="flex justify-between items-start flex-wrap gap-6 mb-7">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-icon.svg" alt="ByteForm" className="h-[30px] w-[30px] opacity-85" />
              <div className="font-serif text-[17px] tracking-[-0.3px]">
                <span style={{ color: IA(0.55) }}>Byte</span>
                <span className="text-accent">Form</span>
              </div>
            </div>
            <p className="text-[12px] leading-[1.6] max-w-[220px]" style={{ color: IA(0.3) }}>
              Beautiful, conversational forms.<br />Built for completion rates that matter.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-10 flex-wrap">
            <div>
              <p className="text-[11px] tracking-[0.8px] uppercase mb-3" style={{ color: IA(0.25) }}>Product</p>
              {['Features', 'Pricing', 'Docs'].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} className="block text-[13px] no-underline mb-2 hover:opacity-60 transition-opacity" style={{ color: IA(0.35) }}>{l}</a>
              ))}
            </div>
            <div>
              <p className="text-[11px] tracking-[0.8px] uppercase mb-3" style={{ color: IA(0.25) }}>Company</p>
              {[
                { label: 'LinkedIn', href: 'https://linkedin.com/company/byteform' },
                { label: 'Privacy', href: '#' },
                { label: 'Terms', href: '#' },
              ].map(({ label, href }) => (
                <a key={label} href={href} className="block text-[13px] no-underline mb-2 hover:opacity-60 transition-opacity" style={{ color: IA(0.35) }}>{label}</a>
              ))}
            </div>
            <div>
              <p className="text-[11px] tracking-[0.8px] uppercase mb-3" style={{ color: IA(0.25) }}>Contact</p>
              <a href="mailto:team@skyl4b.com" className="block text-[13px] no-underline mb-2 hover:opacity-60 transition-opacity" style={{ color: IA(0.35) }}>team@skyl4b.com</a>
            </div>
          </div>
        </div>

        <div className="border-t pt-5 flex justify-between items-center flex-wrap gap-3" style={{ borderColor: IA(0.08) }}>
          <span className="text-[12px]" style={{ color: IA(0.2) }}>© 2026 ByteForm. All rights reserved.</span>
          <span className="text-[12px]" style={{ color: IA(0.15) }}>
            A&nbsp;<span style={{ color: IA(0.3) }}>skyl4b</span>&nbsp;product
          </span>
        </div>
      </footer>
    </div>
  )
}
