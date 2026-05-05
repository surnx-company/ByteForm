"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateSlug } from "@/shared/lib/slug";

const W = "#6B1A2A";
const I = "#F7F3EC";
const B = "#1C1410";
const M = "#7A6A60";
const D = "#9A8A80";
const WA = (a: number) => `rgba(107,26,42,${a})`;
const serif = { fontFamily: "var(--font-serif)" } as const;

const options = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect
          x="1"
          y="3"
          width="20"
          height="16"
          rx="3"
          stroke={W}
          strokeWidth="1.5"
        />
        <path
          d="M7 8h8M7 12h5"
          stroke={W}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Build a form from scratch",
    desc: "Drag, drop, publish. Your first form in under 2 minutes.",
    cta: "Start building",
    href: "/builder",
    primary: true,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 2L13.5 8.5H20L14.5 12.5L16.5 19L11 15L5.5 19L7.5 12.5L2 8.5H8.5L11 2Z"
          stroke={M}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Browse templates",
    desc: "Start with a proven structure — customer feedback, NPS, onboarding.",
    cta: "Coming soon",
    href: "#",
    primary: false,
    disabled: true,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke={M} strokeWidth="1.5" />
        <path
          d="M9 8l5 3-5 3V8z"
          stroke={M}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "See how it works",
    desc: "A 60-second walkthrough of the full ByteForm experience.",
    cta: "Watch demo",
    href: "/demo",
    primary: false,
  },
];

export default function WelcomePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleStartBuilding() {
    setCreating(true);
    const title = "Untitled Form";
    const slug = generateSlug(title);
    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug }),
    });
    if (res.ok) {
      const form = await res.json();
      router.push(`/builder/${form.id}`);
    } else {
      setCreating(false);
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/auth/login");
        return;
      }
      setEmail(data.user.email ?? null);
      setLoading(false);
    });
  }, []);

  const firstName = email ? email.split("@")[0].split(".")[0] : "";
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: I,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: WA(0.3),
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: I,
        fontFamily: "var(--font-sans)",
        color: B,
      }}
    >
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-5 sm:px-10"
        style={{
          height: 60,
          borderBottom: `0.5px solid ${WA(0.1)}`,
        }}
      >
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
            style={{ height: 32, width: 32 }}
          />
          <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <span
              style={{
                ...serif,
                fontSize: 19,
                color: B,
                letterSpacing: "-0.4px",
              }}
            >
              Byte
            </span>
            <span
              style={{
                ...serif,
                fontSize: 19,
                color: W,
                letterSpacing: "-0.4px",
              }}
            >
              Form
            </span>
          </div>
        </Link>
        <Link
          href="/dashboard"
          style={{ fontSize: 13, color: M, textDecoration: "none" }}
        >
          Go to dashboard →
        </Link>
      </nav>

      {/* Content */}
      <div
        className="px-5 sm:px-10 pt-12 sm:pt-[72px] pb-10"
        style={{ maxWidth: 680, margin: "0 auto" }}
      >
        {/* Greeting */}
        <div style={{ marginBottom: 56 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: `0.5px solid ${WA(0.2)}`,
              padding: "5px 14px",
              borderRadius: 20,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: W,
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: W,
                letterSpacing: "0.9px",
                textTransform: "uppercase",
              }}
            >
              Account created
            </span>
          </div>
          <h1
            style={{
              ...serif,
              fontSize: "clamp(32px,4vw,48px)",
              color: B,
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-1.2px",
              marginBottom: 16,
            }}
          >
            {displayName ? `Welcome, ${displayName}.` : "Welcome to ByteForm."}
          </h1>
          <p
            style={{ fontSize: 16, color: M, lineHeight: 1.75, maxWidth: 480 }}
          >
            You&apos;re all set. Pick where you&apos;d like to start — your
            first form is just a couple of minutes away.
          </p>
        </div>

        {/* Option cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 56,
          }}
        >
          {options.map(
            ({ icon, title, desc, cta, href, primary, disabled }) => (
              <div
                key={title}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: "20px 22px",
                  border: primary
                    ? `1.5px solid ${W}`
                    : `0.5px solid ${WA(0.1)}`,
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 16 }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      flexShrink: 0,
                      background: primary ? WA(0.06) : "transparent",
                      border: `0.5px solid ${primary ? WA(0.15) : WA(0.08)}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        color: B,
                        fontWeight: 500,
                        marginBottom: 4,
                      }}
                    >
                      {title}
                    </p>
                    <p style={{ fontSize: 13, color: M, lineHeight: 1.6 }}>
                      {desc}
                    </p>
                  </div>
                </div>
                {disabled ? (
                  <span
                    className="self-start sm:self-auto"
                    style={{
                      fontSize: 12,
                      color: D,
                      border: `0.5px solid ${WA(0.1)}`,
                      padding: "6px 14px",
                      borderRadius: 6,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {cta}
                  </span>
                ) : primary ? (
                  <button
                    onClick={handleStartBuilding}
                    disabled={creating}
                    className="self-start sm:self-auto"
                    style={{
                      fontSize: 13,
                      flexShrink: 0,
                      padding: "9px 20px",
                      borderRadius: 7,
                      background: creating ? `${WA(0.5)}` : W,
                      color: I,
                      border: "none",
                      cursor: creating ? "wait" : "pointer",
                    }}
                  >
                    {creating ? "Creating…" : cta}
                  </button>
                ) : (
                  <Link
                    href={href}
                    className="self-start sm:self-auto"
                    style={{
                      fontSize: 13,
                      textDecoration: "none",
                      flexShrink: 0,
                      padding: "9px 20px",
                      borderRadius: 7,
                      background: "transparent",
                      color: W,
                      border: `0.5px solid ${WA(0.25)}`,
                    }}
                  >
                    {cta}
                  </Link>
                )}
              </div>
            ),
          )}
        </div>

        {/* What to expect strip */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-5"
          style={{
            background: B,
            borderRadius: 14,
            padding: "24px 28px",
          }}
        >
          {[
            ["91%", "Average completion rate"],
            ["2 min", "To build your first form"],
            ["Free", "No credit card needed"],
          ].map(([n, label]) => (
            <div key={label} className="text-left sm:text-center">
              <div
                style={{
                  ...serif,
                  fontSize: 24,
                  color: I,
                  fontWeight: 400,
                  marginBottom: 4,
                }}
              >
                {n}
              </div>
              <div style={{ fontSize: 12, color: `rgba(247,243,236,0.4)` }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        <p
          style={{ textAlign: "center", fontSize: 12, color: D, marginTop: 28 }}
        >
          Need help?{" "}
          <a
            href="mailto:team@skyl4b.com"
            style={{ color: W, textDecoration: "none" }}
          >
            team@skyl4b.com
          </a>
        </p>
      </div>
    </div>
  );
}
