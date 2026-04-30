"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const W = "#6B1A2A";
const I = "#F7F3EC";
const B = "#1C1410";
const M = "#7A6A60";
const D = "#9A8A80";
const WA = (a: number) => `rgba(107,26,42,${a})`;
const IA = (a: number) => `rgba(247,243,236,${a})`;
const serif = { fontFamily: "var(--font-serif)" } as const;

const testimonials = [
  {
    quote: "Completion rate jumped from 52% to 89% in the first week.",
    name: "Sarah Chen",
    role: "Head of Growth, Versa",
    initials: "SC",
  },
  {
    quote:
      "Our clients ask us what tool we used. It reflects so well on our agency.",
    name: "Marco Reyes",
    role: "Founder, Studio MR",
    initials: "MR",
  },
  {
    quote:
      "I built our entire onboarding survey in 8 minutes. It looked custom-made.",
    name: "Jade Park",
    role: "Product Lead, Fable",
    initials: "JP",
  },
];

function getPasswordStrength(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) score++;
  if (pw.length >= 12 && /[^a-zA-Z0-9]/.test(pw)) score++;
  return score as 0 | 1 | 2 | 3;
}

const strengthLabel = ["", "Weak", "Good", "Strong"];
const strengthColor = ["", "#C0392B", "#E67E22", "#27AE60"];

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSignUp, setIsSignUp] = useState(
    () => searchParams.get("mode") === "signup"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [testimonialVisible, setTestimonialVisible] = useState(true);
  const [modeVisible, setModeVisible] = useState(true);
  const [leftVisible, setLeftVisible] = useState(true);

  const supabase = createClient();
  const pwStrength = getPasswordStrength(password);

  // Rotate testimonials every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialVisible(false);
      setTimeout(() => {
        setTestimonialIdx((i) => (i + 1) % testimonials.length);
        setTestimonialVisible(true);
      }, 350);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  function toggleMode() {
    setModeVisible(false);
    setLeftVisible(false);
    setTimeout(() => {
      setIsSignUp((v) => !v);
      setError(null);
      setMessage(null);
      setPassword("");
      setModeVisible(true);
      setLeftVisible(true);
    }, 220);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/welcome`,
        },
      });
      if (error) setError(error.message);
      else setMessage("Check your email for the confirmation link.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else {
        router.push("/dashboard");
        router.refresh();
      }
    }

    setLoading(false);
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/welcome`,
      },
    });
  }

  const t = testimonials[testimonialIdx];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── LEFT PANEL ── */}
      <div
        style={{
          background: B,
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background accent */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: WA(0.25),
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <img
            src="/logo-icon.svg"
            alt="ByteForm"
            style={{ height: 36, width: 36 }}
          />
          <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <span
              style={{
                ...serif,
                fontSize: 21,
                color: IA(0.6),
                letterSpacing: "-0.4px",
              }}
            >
              Byte
            </span>
            <span
              style={{
                ...serif,
                fontSize: 21,
                color: W,
                letterSpacing: "-0.4px",
              }}
            >
              Form
            </span>
          </div>
        </Link>

        {/* Middle content — fades between sign up and login */}
        <div
          style={{
            opacity: leftVisible ? 1 : 0,
            transform: leftVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.22s ease, transform 0.22s ease",
          }}
        >
          {isSignUp ? (
            /* ── SIGN UP: persuade ── */
            <>
              <h2
                style={{
                  ...serif,
                  fontSize: 38,
                  color: I,
                  fontWeight: 400,
                  lineHeight: 1.15,
                  letterSpacing: "-1px",
                  marginBottom: 16,
                }}
              >
                Start creating forms
                <br />
                people love to fill.
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: IA(0.45),
                  lineHeight: 1.75,
                  maxWidth: 340,
                  marginBottom: 48,
                }}
              >
                Join teams who&apos;ve moved beyond boring forms — and the
                completion rates that follow.
              </p>

              {/* Stats */}
              <div style={{ display: "flex", gap: 32, marginBottom: 56 }}>
                {[
                  ["91%", "Avg. completion rate"],
                  ["2 min", "To build a form"],
                  ["13", "Question types"],
                ].map(([n, label]) => (
                  <div key={label}>
                    <div
                      style={{
                        ...serif,
                        fontSize: 24,
                        color: I,
                        fontWeight: 400,
                      }}
                    >
                      {n}
                    </div>
                    <div style={{ fontSize: 12, color: IA(0.4), marginTop: 2 }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rotating testimonial */}
              <div
                style={{
                  borderLeft: `2px solid ${WA(0.5)}`,
                  paddingLeft: 20,
                  opacity: testimonialVisible ? 1 : 0,
                  transform: testimonialVisible
                    ? "translateY(0)"
                    : "translateY(6px)",
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                }}
              >
                <p
                  style={{
                    ...serif,
                    fontSize: 16,
                    color: IA(0.75),
                    lineHeight: 1.6,
                    fontWeight: 400,
                    marginBottom: 16,
                  }}
                >
                  &quot;{t.quote}&quot;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: W,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 11, color: I, fontWeight: 500 }}>
                      {t.initials}
                    </span>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        color: IA(0.65),
                        fontWeight: 500,
                        margin: 0,
                      }}
                    >
                      {t.name}
                    </p>
                    <p style={{ fontSize: 11, color: IA(0.35), margin: 0 }}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setTestimonialVisible(false);
                      setTimeout(() => {
                        setTestimonialIdx(i);
                        setTestimonialVisible(true);
                      }, 350);
                    }}
                    style={{
                      width: i === testimonialIdx ? 20 : 6,
                      height: 6,
                      borderRadius: 3,
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      background: i === testimonialIdx ? W : IA(0.2),
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            /* ── LOGIN: welcome home ── */
            <>
              <h2
                style={{
                  ...serif,
                  fontSize: 42,
                  color: I,
                  fontWeight: 400,
                  lineHeight: 1.1,
                  letterSpacing: "-1.2px",
                  marginBottom: 14,
                }}
              >
                Good to have
                <br />
                you back.
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: IA(0.45),
                  lineHeight: 1.75,
                  marginBottom: 48,
                }}
              >
                Your forms are waiting.
              </p>

              {/* Fake form cards — "your work is in here" */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 44,
                }}
              >
                {[
                  {
                    title: "Customer onboarding survey",
                    responses: 142,
                    active: true,
                  },
                  {
                    title: "Product feedback — Q2",
                    responses: 89,
                    active: false,
                  },
                  {
                    title: "Lead qualification form",
                    responses: 311,
                    active: false,
                  },
                ].map(({ title, responses, active }) => (
                  <div
                    key={title}
                    style={{
                      background: IA(0.04),
                      borderRadius: 10,
                      border: `0.5px solid ${IA(active ? 0.12 : 0.06)}`,
                      padding: "12px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: active ? W : IA(0.2),
                        }}
                      />
                      <span
                        style={{ fontSize: 13, color: IA(active ? 0.75 : 0.4) }}
                      >
                        {title}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: IA(0.3),
                        flexShrink: 0,
                        marginLeft: 12,
                      }}
                    >
                      {responses} responses
                    </span>
                  </div>
                ))}
              </div>

              {/* What's new */}
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: IA(0.25),
                    letterSpacing: "0.9px",
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  What&apos;s new
                </p>
                {[
                  { label: "Interactive form demo on homepage", tag: "New" },
                  { label: "Password strength on sign up", tag: "New" },
                  { label: "Response export — coming soon", tag: "Soon" },
                ].map(({ label, tag }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: tag === "New" ? W : IA(0.3),
                        border: `0.5px solid ${tag === "New" ? WA(0.4) : IA(0.15)}`,
                        padding: "2px 7px",
                        borderRadius: 4,
                        flexShrink: 0,
                        letterSpacing: "0.4px",
                      }}
                    >
                      {tag}
                    </div>
                    <span style={{ fontSize: 13, color: IA(0.4) }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bottom note */}
        <p style={{ fontSize: 12, color: IA(0.2) }}>
          A <span style={{ color: IA(0.35) }}>skyl4b</span> product ·{" "}
          <a
            href="mailto:team@skyl4b.com"
            style={{ color: IA(0.35), textDecoration: "none" }}
          >
            team@skyl4b.com
          </a>
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        style={{
          background: I,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 56px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 380 }}>
          {/* Mode heading with fade transition */}
          <div
            style={{
              opacity: modeVisible ? 1 : 0,
              transform: modeVisible ? "translateY(0)" : "translateY(-6px)",
              transition: "opacity 0.2s ease, transform 0.2s ease",
              marginBottom: 32,
            }}
          >
            <h1
              style={{
                ...serif,
                fontSize: 28,
                color: B,
                fontWeight: 400,
                marginBottom: 6,
                letterSpacing: "-0.5px",
              }}
            >
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p style={{ fontSize: 14, color: M }}>
              {isSignUp
                ? "Free to start. No credit card required."
                : "Sign in to your ByteForm workspace."}
            </p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "12px 16px",
              borderRadius: 8,
              cursor: "pointer",
              border: `0.5px solid ${WA(0.2)}`,
              background: "white",
              fontSize: 14,
              color: B,
              marginBottom: 20,
              transition: "border-color 0.15s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <div style={{ height: "0.5px", background: WA(0.12) }} />
            <span
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                background: I,
                padding: "0 12px",
                fontSize: 12,
                color: D,
              }}
            >
              or
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 12 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: `0.5px solid ${WA(0.2)}`,
                  background: "white",
                  fontSize: 14,
                  color: B,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "var(--font-sans)",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = W)}
                onBlur={(e) => (e.target.style.borderColor = WA(0.2))}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: isSignUp ? 8 : 20 }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: `0.5px solid ${WA(0.2)}`,
                  background: "white",
                  fontSize: 14,
                  color: B,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "var(--font-sans)",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = W)}
                onBlur={(e) => (e.target.style.borderColor = WA(0.2))}
              />
            </div>

            {/* Password strength — sign up only */}
            {isSignUp && password.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background:
                          pwStrength >= level
                            ? strengthColor[pwStrength]
                            : WA(0.1),
                        transition: "background 0.25s ease",
                      }}
                    />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: pwStrength > 0 ? strengthColor[pwStrength] : D,
                    margin: 0,
                  }}
                >
                  {strengthLabel[pwStrength]} password
                  {pwStrength < 3 &&
                    pwStrength > 0 &&
                    " — try adding numbers or symbols"}
                </p>
              </div>
            )}
            {isSignUp && password.length === 0 && (
              <div style={{ marginBottom: 20 }} />
            )}

            {/* Error / success */}
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 7,
                  marginBottom: 14,
                  background: "rgba(192,57,43,0.06)",
                  border: "0.5px solid rgba(192,57,43,0.2)",
                  fontSize: 13,
                  color: "#C0392B",
                }}
              >
                {error}
              </div>
            )}
            {message && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 7,
                  marginBottom: 14,
                  background: "rgba(39,174,96,0.06)",
                  border: "0.5px solid rgba(39,174,96,0.2)",
                  fontSize: 13,
                  color: "#27AE60",
                }}
              >
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: 8,
                background: loading ? WA(0.4) : W,
                color: I,
                border: "none",
                fontSize: 14,
                cursor: loading ? "default" : "pointer",
                transition: "background 0.2s ease",
                marginBottom: 20,
              }}
            >
              {loading
                ? "Please wait…"
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          {/* Toggle mode */}
          <p style={{ textAlign: "center", fontSize: 13, color: M }}>
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={toggleMode}
              style={{
                background: "none",
                border: "none",
                color: W,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {isSignUp ? "Sign in" : "Sign up free"}
            </button>
          </p>

          {/* Back to home */}
          <p style={{ textAlign: "center", marginTop: 24 }}>
            <Link
              href="/"
              style={{ fontSize: 12, color: D, textDecoration: "none" }}
            >
              ← Back to ByteForm.co
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
