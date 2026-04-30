'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

  // Scroll-aware nav
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Hero interactive demo
  const [heroStep, setHeroStep] = useState(0)
  const [heroAnswers, setHeroAnswers] = useState<(string | null)[]>([null, null, null])
  const heroDone = heroStep >= demoQuestions.length
  const heroProgress = heroDone ? 100 : Math.round(((heroStep) / demoQuestions.length) * 100)
  const currentAnswer = heroAnswers[heroStep] ?? null

  function heroSelect(opt: string) {
    setHeroAnswers(prev => prev.map((a, i) => i === heroStep ? opt : a))
  }
  function heroNext() {
    if (currentAnswer) setHeroStep(s => s + 1)
  }
  function heroBack() {
    setHeroStep(s => Math.max(0, s - 1))
  }
  function heroReset() {
    setHeroStep(0)
    setHeroAnswers([null, null, null])
  }

  return (
    <div style={{ background: I, color: B, fontFamily: 'var(--font-sans)' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(247,243,236,0.92)' : I,
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `0.5px solid ${scrolled ? WA(0.18) : WA(0.08)}`,
        boxShadow: scrolled ? '0 2px 16px rgba(28,20,16,0.06)' : 'none',
        padding: '0 40px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo-icon.svg" alt="ByteForm icon" style={{ height: 34, width: 34 }} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <span style={{ ...serif, fontSize: 20, color: B, letterSpacing: '-0.4px' }}>Byte</span>
            <span style={{ ...serif, fontSize: 20, color: W, letterSpacing: '-0.4px' }}>Form</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {[['Features', '#features'], ['Pricing', '#pricing'], ['Blog', '/blog'], ['Demo', '/demo']].map(([label, href]) => (
            <a key={label} href={href}
              style={{ fontSize: 13, color: M, textDecoration: 'none', cursor: 'pointer' }}>
              {label}
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/auth/login" style={{
            fontSize: 13, color: B, textDecoration: 'none',
            border: `0.5px solid ${WA(0.25)}`, padding: '8px 18px',
            borderRadius: 6, cursor: 'pointer',
          }}>Log in</Link>
          <Link href="/auth/login?mode=signup" style={{
            fontSize: 13, color: I, background: W,
            border: 'none', padding: '8px 18px',
            borderRadius: 6, cursor: 'pointer', textDecoration: 'none',
          }}>Start free</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        padding: '80px 40px 64px',
        display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,0.85fr)',
        gap: 56, alignItems: 'center',
        maxWidth: 1100, margin: '0 auto',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            border: `0.5px solid ${WA(0.28)}`, padding: '5px 14px',
            borderRadius: 20, marginBottom: 36,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: W, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: W, letterSpacing: '0.9px', textTransform: 'uppercase' }}>
            Beautiful forms. Honest pricing.
            </span>
          </div>
          <h1 style={{
            ...serif, fontSize: 'clamp(38px,5vw,54px)', color: B,
            lineHeight: 1.07, letterSpacing: '-1.8px',
            marginBottom: 22, fontWeight: 400,
          }}>
            Forms your users<br />actually want to fill.
          </h1>
          <p style={{ fontSize: 15, color: M, lineHeight: 1.78, maxWidth: 370, marginBottom: 40 }}>
          Your forms are the first impression. Make them count without the $99/mo bill. Byteform builds beautiful, AI-powered forms your audience genuinely wants to complete.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/auth/login?mode=signup" style={{
              background: W, color: I, border: 'none',
              padding: '13px 28px', borderRadius: 8, fontSize: 14,
              cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
            }}>
              Create your first form
            </Link>
            <Link href="/demo" style={{
              background: 'transparent', color: B,
              border: `0.5px solid ${WA(0.28)}`,
              padding: '13px 28px', borderRadius: 8, fontSize: 14,
              cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
            }}>
              See it in action
            </Link>
          </div>
          <p style={{ fontSize: 12, color: D, marginTop: 14 }}>
            No credit card required · Free to start
          </p>
        </div>

        {/* Hero form demo card — interactive */}
        <div style={{
          background: 'white', borderRadius: 14, padding: 32,
          border: `0.5px solid ${WA(0.1)}`,
          minHeight: 340,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          {/* Progress bar */}
          <div>
            <div style={{ height: 2, background: WA(0.08), borderRadius: 1, marginBottom: 24, overflow: 'hidden' }}>
              <div style={{
                width: `${heroProgress}%`, height: '100%', background: W, borderRadius: 1,
                transition: 'width 0.4s ease',
              }} />
            </div>

            {heroDone ? (
              /* ── Thank you screen ── */
              <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🎉</div>
                <h3 style={{ ...serif, fontSize: 22, color: B, fontWeight: 400, marginBottom: 12, lineHeight: 1.3 }}>
                  You're all set.
                </h3>
                <p style={{ fontSize: 13, color: M, lineHeight: 1.7, marginBottom: 24 }}>
                  That calm, focused experience? That's what your users will feel every time they fill a ByteForm.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link href="/auth/login?mode=signup" style={{
                    display: 'block', background: W, color: I, textDecoration: 'none',
                    padding: '11px 0', borderRadius: 7, fontSize: 13, textAlign: 'center',
                  }}>
                    Build your first form →
                  </Link>
                  <button onClick={heroReset} style={{
                    background: 'transparent', color: M, border: `0.5px solid ${WA(0.2)}`,
                    padding: '10px 0', borderRadius: 7, fontSize: 12, cursor: 'pointer',
                  }}>
                    Start over
                  </button>
                </div>
              </div>
            ) : (
              /* ── Question screen ── */
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span style={{ fontSize: 11, color: D, letterSpacing: '0.5px' }}>
                    {heroStep + 1} OF {demoQuestions.length}
                  </span>
                  <span style={{ fontSize: 11, color: D }}>{heroProgress}%</span>
                </div>
                <h3 style={{ ...serif, fontSize: 20, color: B, marginBottom: 20, lineHeight: 1.35, fontWeight: 400 }}>
                  {demoQuestions[heroStep].q}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {demoQuestions[heroStep].opts.map(opt => {
                    const selected = currentAnswer === opt
                    return (
                      <div
                        key={opt}
                        onClick={() => heroSelect(opt)}
                        style={{
                          padding: '11px 15px', cursor: 'pointer',
                          border: selected ? `1.5px solid ${W}` : `0.5px solid ${WA(0.15)}`,
                          borderRadius: 7, fontSize: 13,
                          color: selected ? W : B,
                          background: selected ? WA(0.05) : 'transparent',
                          transition: 'all 0.15s ease',
                          userSelect: 'none',
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

          {/* Footer nav */}
          {!heroDone && (
            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {heroStep > 0 ? (
                <button onClick={heroBack} style={{
                  background: 'transparent', color: M, border: 'none',
                  fontSize: 12, cursor: 'pointer', padding: 0,
                }}>← Back</button>
              ) : (
                <span style={{ fontSize: 11, color: D }}>Click an option</span>
              )}
              <button
                onClick={heroNext}
                disabled={!currentAnswer}
                style={{
                  background: currentAnswer ? W : WA(0.2),
                  color: I, border: 'none',
                  padding: '9px 20px', borderRadius: 6, fontSize: 13,
                  cursor: currentAnswer ? 'pointer' : 'default',
                  transition: 'background 0.2s ease',
                }}
              >
                {heroStep === demoQuestions.length - 1 ? 'Finish ✓' : 'Next →'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── LIVE DEMO STRIP ── */}
      <section style={{ padding: '64px 40px', background: 'white', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: W, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 12 }}>
          Try it yourself
        </p>
        <h2 style={{ ...serif, fontSize: 34, color: B, fontWeight: 400, marginBottom: 10 }}>
          Don't take our word for it.
        </h2>
        <p style={{ fontSize: 15, color: M, maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Click through a real ByteForm below. This is exactly what your users will experience.
        </p>
        <div style={{
          background: I, borderRadius: 16, padding: '40px 60px',
          border: `0.5px solid ${WA(0.1)}`, maxWidth: 500, margin: '0 auto',
        }}>
          {demoSubmitted ? (
            <div style={{ padding: '32px 0' }}>
              <div style={{ ...serif, fontSize: 28, color: B, fontWeight: 400, marginBottom: 12 }}>
                Thank you. 🎉
              </div>
              <p style={{ fontSize: 14, color: M, lineHeight: 1.7, marginBottom: 24 }}>
                That's exactly what your respondents will feel — calm, clear, done.
              </p>
              <button onClick={() => { setDemoSubmitted(false); setDemoValue('') }} style={{
                background: 'transparent', color: W, border: `0.5px solid ${WA(0.3)}`,
                padding: '9px 20px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
              }}>Try again</button>
            </div>
          ) : (
            <>
              <div style={{ height: 2, background: WA(0.08), borderRadius: 1, marginBottom: 28, overflow: 'hidden' }}>
                <div style={{ width: '20%', height: '100%', background: W, borderRadius: 1 }} />
              </div>
              <h3 style={{ ...serif, fontSize: 22, color: B, fontWeight: 400, marginBottom: 24, lineHeight: 1.4 }}>
                What's your biggest challenge with forms right now?
              </h3>
              <textarea
                value={demoValue}
                onChange={e => setDemoValue(e.target.value)}
                placeholder="Type your answer here..."
                style={{
                  width: '100%', border: `0.5px solid ${WA(0.2)}`, borderRadius: 8,
                  padding: 14, fontSize: 14, color: B, background: 'white',
                  resize: 'none', height: 80, fontFamily: 'var(--font-sans)',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: D }}>Press Enter ↵ or</span>
                <button
                  onClick={() => demoValue.trim() && setDemoSubmitted(true)}
                  style={{
                    background: demoValue.trim() ? W : WA(0.3), color: I,
                    border: 'none', padding: '10px 22px', borderRadius: 6,
                    fontSize: 13, cursor: demoValue.trim() ? 'pointer' : 'default',
                    transition: 'background 0.2s',
                  }}>
                  OK →
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── TWO SIDES ── */}
      <section id="features" style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ ...serif, fontSize: 36, color: B, fontWeight: 400, lineHeight: 1.2 }}>
            Built for two people.<br />You — and your users.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 24 }}>
          {/* Builder side */}
          <div style={{ background: 'white', borderRadius: 14, padding: 36, border: `0.5px solid ${WA(0.1)}` }}>
            <div style={{
              display: 'inline-block', background: WA(0.06),
              padding: '4px 12px', borderRadius: 12, marginBottom: 20,
            }}>
              <span style={{ fontSize: 11, color: W, letterSpacing: '0.5px' }}>For you — the builder</span>
            </div>
            <h3 style={{ ...serif, fontSize: 22, color: B, fontWeight: 400, marginBottom: 16 }}>
              Ready in under 2 minutes.
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Welcome screen', icon: 'square' },
                { label: 'Multiple choice', icon: 'bar', active: true },
                { label: 'Short text', icon: 'line' },
                { label: 'Thank you screen', icon: 'circle' },
              ].map(({ label, active }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', background: I, borderRadius: 8,
                  border: active ? `1px solid ${WA(0.2)}` : 'none',
                }}>
                  <div style={{
                    width: 28, height: 28, background: 'white', borderRadius: 6,
                    border: `0.5px solid ${WA(0.15)}`, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? W : WA(0.2) }} />
                  </div>
                  <span style={{ fontSize: 13, color: active ? W : B, fontWeight: active ? 500 : 400 }}>{label}</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: 14, height: 1.5, background: D, borderRadius: 1 }} />)}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: M, lineHeight: 1.65 }}>Drag, drop, publish. One click to share.</p>
          </div>

          {/* Filler side */}
          <div style={{ background: 'white', borderRadius: 14, padding: 36, border: `0.5px solid ${WA(0.1)}` }}>
            <div style={{
              display: 'inline-block', background: WA(0.06),
              padding: '4px 12px', borderRadius: 12, marginBottom: 20,
            }}>
              <span style={{ fontSize: 11, color: W, letterSpacing: '0.5px' }}>For them — the respondent</span>
            </div>
            <h3 style={{ ...serif, fontSize: 22, color: B, fontWeight: 400, marginBottom: 16 }}>
              An experience, not a chore.
            </h3>
            <div style={{
              background: I, borderRadius: 10, padding: 24,
              border: `0.5px solid ${WA(0.08)}`, marginBottom: 16,
            }}>
              <div style={{ height: 1.5, background: WA(0.08), borderRadius: 1, marginBottom: 18, overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: W, borderRadius: 1 }} />
              </div>
              <p style={{ ...serif, fontSize: 17, color: B, fontWeight: 400, marginBottom: 16, lineHeight: 1.4 }}>
                How likely are you to recommend us?
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 9, 10].map(n => (
                  <div key={n} style={{
                    flex: 1, padding: '7px 0',
                    border: n === 9 ? `1.5px solid ${W}` : `0.5px solid ${WA(0.15)}`,
                    borderRadius: 6, textAlign: 'center', fontSize: 12,
                    color: n === 9 ? W : D,
                    background: n === 9 ? WA(0.05) : 'transparent',
                  }}>{n}</div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 13, color: M, lineHeight: 1.65 }}>
              Calm, focused, one question at a time. Completion rates follow.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMPLETION RATE ── */}
      <section style={{ background: W, padding: '72px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 64, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, color: IA(0.5), letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 16 }}>
              The completion rate problem
            </p>
            <h2 style={{ ...serif, fontSize: 36, color: I, fontWeight: 400, lineHeight: 1.2, marginBottom: 16 }}>
              Most forms lose<br />half their respondents.
            </h2>
            <p style={{ fontSize: 15, color: IA(0.6), lineHeight: 1.78, marginBottom: 28 }}>
              The average form completion rate is 47%. ByteForm users average 91%.
              That difference isn't a feature — it's revenue.
            </p>
            <div style={{ background: IA(0.08), borderRadius: 10, padding: '20px 24px' }}>
              <p style={{ fontSize: 13, color: IA(0.6), marginBottom: 4 }}>At 1,000 monthly views, that's</p>
              <p style={{ ...serif, fontSize: 28, color: I, fontWeight: 400 }}>440 more responses</p>
              <p style={{ fontSize: 13, color: IA(0.5), marginTop: 4 }}>without spending more on traffic.</p>
            </div>
          </div>
          <div>
            {[
              { label: 'Average form builder', pct: 47, active: false },
              { label: 'ByteForm', pct: 91, active: true },
            ].map(({ label, pct, active }) => (
              <div key={label} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: active ? I : IA(0.6), fontWeight: active ? 500 : 400 }}>{label}</span>
                  <span style={{ fontSize: 13, color: active ? I : IA(0.6), fontWeight: active ? 500 : 400 }}>{pct}%</span>
                </div>
                <div style={{ height: 10, background: IA(0.1), borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: active ? I : IA(0.3), borderRadius: 5 }} />
                </div>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 32 }}>
              {[{ n: '2×', label: 'More responses' }, { n: '0%', label: 'Extra ad spend' }].map(({ n, label }) => (
                <div key={label} style={{ background: IA(0.08), borderRadius: 10, padding: '16px 20px' }}>
                  <div style={{ ...serif, fontSize: 28, color: I, fontWeight: 400 }}>{n}</div>
                  <div style={{ fontSize: 12, color: IA(0.5), marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESPONDENT EXPERIENCE ── */}
      <section style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 64, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, color: W, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 14 }}>
              The respondent experience
            </p>
            <h2 style={{ ...serif, fontSize: 34, color: B, fontWeight: 400, lineHeight: 1.2, marginBottom: 16 }}>
              Your brand,<br />at its best.
            </h2>
            <p style={{ fontSize: 15, color: M, lineHeight: 1.78, marginBottom: 28 }}>
              Every form your users open reflects on you. ByteForm makes sure that reflection
              is always polished, calm, and intentional.
            </p>
            {[
              'One focused question at a time, no overwhelm',
              'Keyboard-first navigation, instant response',
              'Progress bar that makes finishing feel close',
              'Works beautifully on any device',
            ].map(point => (
              <div key={point} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: W, marginTop: 6, flexShrink: 0 }} />
                <p style={{ fontSize: 14, color: M, lineHeight: 1.65 }}>{point}</p>
              </div>
            ))}
          </div>

          {/* Phone frame */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 240, background: B, borderRadius: 32, padding: 12, border: `6px solid ${B}` }}>
              <div style={{ background: I, borderRadius: 22, overflow: 'hidden' }}>
                <div style={{ padding: '20px 18px 16px' }}>
                  <div style={{ height: 2, background: WA(0.08), borderRadius: 1, marginBottom: 18, overflow: 'hidden' }}>
                    <div style={{ width: '60%', height: '100%', background: W, borderRadius: 1 }} />
                  </div>
                  <p style={{ fontSize: 11, color: D, marginBottom: 10 }}>3 OF 5</p>
                  <p style={{ ...serif, fontSize: 15, color: B, fontWeight: 400, lineHeight: 1.4, marginBottom: 14 }}>
                    How did you hear about us?
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {['Word of mouth', 'LinkedIn', 'Search / Google', 'Other'].map((opt, i) => (
                      <div key={opt} style={{
                        padding: '8px 11px',
                        border: i === 1 ? `1.5px solid ${W}` : `0.5px solid ${WA(0.15)}`,
                        borderRadius: 6, fontSize: 11,
                        color: i === 1 ? W : B,
                        background: i === 1 ? WA(0.05) : 'transparent',
                      }}>{opt}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, textAlign: 'right' }}>
                    <button style={{ background: W, color: I, border: 'none', padding: '7px 14px', borderRadius: 5, fontSize: 11, cursor: 'pointer' }}>
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
      <section id="features-types" style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 11, color: W, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 12 }}>
            13 question types
          </p>
          <h2 style={{ ...serif, fontSize: 34, color: B, fontWeight: 400, lineHeight: 1.2 }}>
            Every answer format.<br />All of them beautiful.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 18 }}>

          {/* Short text */}
          <div style={{ background: 'white', borderRadius: 12, padding: 22, border: `0.5px solid ${WA(0.1)}` }}>
            <p style={{ fontSize: 11, color: D, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 14 }}>Short text</p>
            <div style={{ borderBottom: `1.5px solid ${W}`, paddingBottom: 6, fontSize: 13, color: B }}>Your answer here_</div>
          </div>

          {/* Multiple choice */}
          <div style={{ background: 'white', borderRadius: 12, padding: 22, border: `0.5px solid ${WA(0.1)}` }}>
            <p style={{ fontSize: 11, color: D, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 14 }}>Multiple choice</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {['Option A', 'Option B', 'Option C'].map((opt, i) => (
                <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: i === 0 ? `1.5px solid ${W}` : `0.5px solid ${WA(0.2)}`, background: i === 0 ? WA(0.08) : 'transparent', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: i === 0 ? W : M }}>{opt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Star rating */}
          <div style={{ background: 'white', borderRadius: 12, padding: 22, border: `0.5px solid ${WA(0.1)}` }}>
            <p style={{ fontSize: 11, color: D, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 14 }}>Star rating</p>
            <div style={{ display: 'flex', gap: 5 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ width: 20, height: 20, background: i <= 4 ? W : WA(0.12), borderRadius: 3 }} />
              ))}
            </div>
          </div>

          {/* Yes / No */}
          <div style={{ background: 'white', borderRadius: 12, padding: 22, border: `0.5px solid ${WA(0.1)}` }}>
            <p style={{ fontSize: 11, color: D, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 14 }}>Yes / No</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, padding: '8px 0', border: `1.5px solid ${W}`, borderRadius: 6, textAlign: 'center', fontSize: 12, color: W, background: WA(0.05) }}>Yes</div>
              <div style={{ flex: 1, padding: '8px 0', border: `0.5px solid ${WA(0.15)}`, borderRadius: 6, textAlign: 'center', fontSize: 12, color: M }}>No</div>
            </div>
          </div>

          {/* NPS */}
          <div style={{ background: 'white', borderRadius: 12, padding: 22, border: `0.5px solid ${WA(0.1)}` }}>
            <p style={{ fontSize: 11, color: D, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 14 }}>Rating (NPS)</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 3, 5, 9, 10].map(n => (
                <div key={n} style={{
                  flex: 1, padding: '5px 0',
                  border: n === 9 ? `1.5px solid ${W}` : `0.5px solid ${WA(0.15)}`,
                  borderRadius: 4, textAlign: 'center', fontSize: 10,
                  color: n === 9 ? W : D,
                  background: n === 9 ? WA(0.05) : 'transparent',
                }}>{n}</div>
              ))}
            </div>
          </div>

          {/* Date */}
          <div style={{ background: 'white', borderRadius: 12, padding: 22, border: `0.5px solid ${WA(0.1)}` }}>
            <p style={{ fontSize: 11, color: D, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 14 }}>Date</p>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['MM', false], ['DD', true], ['YYYY', false]].map(([lbl, active]) => (
                <div key={String(lbl)} style={{
                  flex: 1, border: active ? `1.5px solid ${W}` : `0.5px solid ${WA(0.15)}`,
                  borderRadius: 6, padding: '6px 0', textAlign: 'center',
                  fontSize: 11, color: active ? W : B,
                  background: active ? WA(0.05) : 'transparent',
                }}>{String(lbl)}</div>
              ))}
            </div>
          </div>

        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: D, marginTop: 20 }}>
          + 7 more: long text, email, number, dropdown, checkboxes, file upload, statement
        </p>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ ...serif, fontSize: 34, color: B, fontWeight: 400 }}>What teams are saying</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 22 }}>
            {[
              { quote: '"Completion rate jumped from 52% to 89% in the first week."', name: 'Sarah Chen', role: 'Head of Growth, Versa', initials: 'SC' },
              { quote: '"Our clients ask us what tool we used. It reflects so well on our agency."', name: 'Marco Reyes', role: 'Founder, Studio MR', initials: 'MR' },
              { quote: '"I built our entire onboarding survey in 8 minutes. It looked custom-made."', name: 'Jade Park', role: 'Product Lead, Fable', initials: 'JP' },
            ].map(({ quote, name, role, initials }) => (
              <div key={name} style={{ padding: 30, background: I, borderRadius: 14, border: `0.5px solid ${WA(0.1)}` }}>
                <div style={{ width: 28, height: 2, background: W, marginBottom: 18 }} />
                <p style={{ ...serif, fontSize: 16, color: B, lineHeight: 1.6, fontWeight: 400, marginBottom: 22 }}>{quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', background: W,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 12, color: I, fontWeight: 500 }}>{initials}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, color: B, fontWeight: 500, margin: 0 }}>{name}</p>
                    <p style={{ fontSize: 11, color: D, margin: 0 }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ ...serif, fontSize: 34, color: B, fontWeight: 400 }}>Up and running in minutes.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 0 }}>
          {[
            { n: '01', title: 'Create your form', body: 'Drag and drop questions, set your logic, customise your welcome and thank-you screens. Takes under 2 minutes.' },
            { n: '02', title: 'Publish and share', body: "Get a clean, shareable link instantly. Embed it anywhere. Your form is live the moment you click publish." },
            { n: '03', title: 'Collect responses', body: 'Watch responses come in on your dashboard. Export any time. Every submission timestamped and stored.' },
          ].map(({ n, title, body }, i) => (
            <div key={n} style={{
              padding: `0 ${i === 2 ? 0 : 36}px 0 ${i === 0 ? 0 : 36}px`,
              borderRight: i < 2 ? `0.5px solid ${WA(0.1)}` : 'none',
            }}>
              <div style={{ ...serif, fontSize: 44, color: WA(0.15), fontWeight: 400, marginBottom: 16 }}>{n}</div>
              <h3 style={{ fontSize: 15, color: B, fontWeight: 500, marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 13, color: M, lineHeight: 1.7 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ ...serif, fontSize: 34, color: B, fontWeight: 400, marginBottom: 10 }}>Simple pricing.</h2>
            <p style={{ fontSize: 15, color: M }}>Start free. Upgrade when you're ready.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 22, alignItems: 'start' }}>
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
              <div key={name} style={{
                padding: 30, background: I, borderRadius: 14,
                border: popular ? `2px solid ${W}` : `0.5px solid ${WA(0.12)}`,
                position: 'relative',
              }}>
                {popular && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: W, padding: '3px 16px', borderRadius: 12,
                    fontSize: 11, color: I, letterSpacing: '0.5px', whiteSpace: 'nowrap',
                  }}>Most popular</div>
                )}
                <p style={{ fontSize: 14, color: B, fontWeight: 500, marginBottom: 4 }}>{name}</p>
                <p style={{ fontSize: 11, color: D, marginBottom: 22 }}>{sub}</p>
                <div style={{ ...serif, fontSize: 36, color: B, fontWeight: 400, marginBottom: 4 }}>{price}</div>
                <p style={{ fontSize: 12, color: D, marginBottom: 26 }}>{per}</p>
                <div style={{ borderTop: `0.5px solid ${WA(0.1)}`, paddingTop: 20, marginBottom: 26 }}>
                  {features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: W, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: M }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href={href} style={{
                  display: 'block', width: '100%', padding: '11px 0', textAlign: 'center',
                  border: popular ? 'none' : `0.5px solid ${WA(0.25)}`,
                  borderRadius: 7, fontSize: 13, cursor: 'pointer',
                  background: popular ? W : 'transparent',
                  color: popular ? I : B,
                  textDecoration: 'none',
                }}>{cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.75fr) minmax(0,1.25fr)', gap: 64, alignItems: 'start' }}>
          <div>
            <h2 style={{ ...serif, fontSize: 34, color: B, fontWeight: 400, lineHeight: 1.2 }}>
              Questions<br />answered.
            </h2>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: `0.5px solid ${WA(0.1)}` }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '18px 0', background: 'none',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}>
                  <span style={{ fontSize: 14, color: openFaq === i ? W : B, fontWeight: openFaq === i ? 500 : 400 }}>
                    {faq.q}
                  </span>
                  <span style={{ fontSize: 18, color: W, flexShrink: 0, marginLeft: 16 }}>
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <p style={{ fontSize: 14, color: M, lineHeight: 1.72, paddingBottom: 18 }}>{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section style={{ background: B, padding: '80px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: IA(0.35), letterSpacing: '1.3px', textTransform: 'uppercase', marginBottom: 16 }}>
          Get started today
        </p>
        <h2 style={{ ...serif, fontSize: 42, color: I, fontWeight: 400, lineHeight: 1.12, marginBottom: 14 }}>
          Your users deserve<br />better than a boring form.
        </h2>
        <p style={{ fontSize: 15, color: IA(0.45), maxWidth: 380, margin: '0 auto 40px', lineHeight: 1.75 }}>
          So do you. Build something that feels as good as the product you're building.
        </p>
        <Link href="/auth/login?mode=signup" style={{
          display: 'inline-block', background: I, color: W,
          border: 'none', padding: '15px 40px', borderRadius: 8,
          fontSize: 14, fontWeight: 500, cursor: 'pointer',
          textDecoration: 'none', letterSpacing: '0.2px',
        }}>
          Start building for free
        </Link>
        <p style={{ fontSize: 12, color: IA(0.25), marginTop: 16 }}>
          No credit card · Free tier always available
        </p>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#140E0A', padding: '36px 40px', flexWrap: 'wrap', gap: 24 }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 28 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <img src="/logo-icon.svg" alt="ByteForm icon" style={{ height: 30, width: 30, opacity: 0.85 }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <span style={{ ...serif, fontSize: 17, color: IA(0.55), letterSpacing: '-0.3px' }}>Byte</span>
                <span style={{ ...serif, fontSize: 17, color: W, letterSpacing: '-0.3px' }}>Form</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: IA(0.3), lineHeight: 1.6, maxWidth: 220 }}>
              Beautiful, conversational forms.<br />Built for completion rates that matter.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 11, color: IA(0.25), letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>Product</p>
              {['Features', 'Pricing', 'Docs'].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} style={{ display: 'block', fontSize: 13, color: IA(0.35), textDecoration: 'none', marginBottom: 8 }}>{l}</a>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 11, color: IA(0.25), letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>Company</p>
              {[
                { label: 'LinkedIn', href: 'https://linkedin.com/company/byteform' },
                { label: 'Privacy', href: '#' },
                { label: 'Terms', href: '#' },
              ].map(({ label, href }) => (
                <a key={label} href={href} style={{ display: 'block', fontSize: 13, color: IA(0.35), textDecoration: 'none', marginBottom: 8 }}>{label}</a>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 11, color: IA(0.25), letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>Contact</p>
              <a href="mailto:team@skyl4b.com" style={{ display: 'block', fontSize: 13, color: IA(0.35), textDecoration: 'none', marginBottom: 8 }}>team@skyl4b.com</a>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ borderTop: `0.5px solid ${IA(0.08)}`, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: IA(0.2) }}>© 2026 ByteForm. All rights reserved.</span>
          <span style={{ fontSize: 12, color: IA(0.15) }}>
            A&nbsp;<span style={{ color: IA(0.3) }}>skyl4b</span>&nbsp;product
          </span>
        </div>
      </footer>

    </div>
  )
}
