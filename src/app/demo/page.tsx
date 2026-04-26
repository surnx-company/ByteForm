"use client";

import { useState, useEffect } from "react";
import { FormView } from "@/components/form/FormView";
import { demoForm } from "@/lib/demo-form";
import Link from "next/link";

const W = "#6B1A2A";
const I = "#F7F3EC";
const B = "#1C1410";
const M = "#7A6A60";
const WA = (a: number) => `rgba(107,26,42,${a})`;
const serif = { fontFamily: "var(--font-serif)" } as const;

export default function DemoPage() {
  const [scrolled, setScrolled] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSubmit(_answers: Record<string, unknown>) {
    // Small delay so the thank-you screen animates in before CTA appears
    setTimeout(() => setSubmitted(true), 900);
  }

  return (
    <div style={{ position: "relative" }}>

      {/* Fixed branded nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 60,
        height: 56,
        background: scrolled ? "rgba(247,243,236,0.92)" : "rgba(247,243,236,0.80)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `0.5px solid ${scrolled ? WA(0.18) : WA(0.08)}`,
        boxShadow: scrolled ? "0 2px 16px rgba(28,20,16,0.06)" : "none",
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s",
      }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <img src="/logo-icon.svg" alt="ByteForm" style={{ height: 28, width: 28 }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <span style={{ ...serif, fontSize: 17, color: B, letterSpacing: "-0.3px" }}>Byte</span>
            <span style={{ ...serif, fontSize: 17, color: W, letterSpacing: "-0.3px" }}>Form</span>
          </div>
        </Link>

        {/* Demo pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          border: `0.5px solid ${WA(0.22)}`,
          padding: "4px 12px", borderRadius: 20,
          background: WA(0.05),
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: W }} />
          <span style={{ fontSize: 11, color: W, letterSpacing: "0.8px", textTransform: "uppercase" }}>
            Live demo
          </span>
        </div>

        {/* CTA */}
        <Link href="/auth/login?mode=signup" style={{
          fontSize: 13, color: I, background: W,
          padding: "8px 18px", borderRadius: 6,
          textDecoration: "none",
        }}>
          Start free
        </Link>
      </nav>

      {/* Form — full screen, sits below the fixed nav */}
      <div className="h-screen w-screen">
        <FormView form={demoForm} onSubmit={handleSubmit} />
      </div>

      {/* Post-completion CTA — slides up after thank-you screen */}
      {submitted && (
        <div style={{
          position: "fixed",
          bottom: 32, left: "50%",
          transform: "translateX(-50%)",
          zIndex: 70,
          background: "white",
          borderRadius: 14,
          border: `0.5px solid ${WA(0.12)}`,
          boxShadow: "0 8px 40px rgba(28,20,16,0.14)",
          padding: "20px 24px",
          display: "flex", alignItems: "center", gap: 20,
          maxWidth: 480, width: "calc(100vw - 48px)",
          animation: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both",
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: B, margin: "0 0 4px" }}>
              Ready to build yours?
            </p>
            <p style={{ fontSize: 12, color: M, lineHeight: 1.55, margin: 0 }}>
              Your respondents get this exact experience. Set up in under 2 minutes.
            </p>
          </div>
          <Link href="/auth/login?mode=signup" style={{
            fontSize: 13, color: I, background: W,
            padding: "10px 20px", borderRadius: 7,
            textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
          }}>
            Start free →
          </Link>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
