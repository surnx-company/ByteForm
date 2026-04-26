"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { UserMenu } from "@/components/UserMenu";
import { generateSlug } from "@/lib/slug";

const W = "#6B1A2A";
const I = "#F7F3EC";
const B = "#1C1410";
const M = "#7A6A60";
const D = "#9A8A80";
const WA = (a: number) => `rgba(107,26,42,${a})`;
const serif = { fontFamily: "var(--font-serif)" } as const;

type FormRow = Database["public"]["Tables"]["forms"]["Row"];

interface Props {
  forms: FormRow[];
  userEmail: string;
  responseCounts: Record<string, number>;
}

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
  return `${Math.floor(s / 2592000)}mo ago`;
}

export function DashboardClient({ forms: initialForms, responseCounts }: Props) {
  const [forms, setForms] = useState(initialForms);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const totalResponses = Object.values(responseCounts).reduce((a, b) => a + b, 0);
  const publishedCount = forms.filter((f) => f.is_published).length;

  async function handleCreateForm() {
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

  async function handleDeleteForm(id: string) {
    const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });
    if (res.ok) {
      setForms((prev) => prev.filter((f) => f.id !== id));
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function handleCopyLink(slug: string, id: string) {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: I, fontFamily: "var(--font-sans)", color: B }}>

      {/* Header */}
      <header style={{
        borderBottom: `0.5px solid ${WA(0.1)}`,
        background: "white",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/logo-icon.svg" alt="ByteForm" style={{ height: 30, width: 30 }} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <span style={{ ...serif, fontSize: 18, color: B, letterSpacing: "-0.3px" }}>Byte</span>
              <span style={{ ...serif, fontSize: 18, color: W, letterSpacing: "-0.3px" }}>Form</span>
            </div>
          </a>
          <UserMenu />
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px" }}>

        {/* Page title + New form */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ ...serif, fontSize: 28, fontWeight: 400, color: B, letterSpacing: "-0.5px", margin: "0 0 4px" }}>
              Your forms
            </h1>
            <p style={{ fontSize: 13, color: M, margin: 0 }}>
              {forms.length === 0 ? "No forms yet" : `${forms.length} form${forms.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={handleCreateForm}
            disabled={creating}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 8,
              background: creating ? WA(0.5) : W,
              color: I, fontSize: 13, fontWeight: 500,
              border: "none", cursor: creating ? "wait" : "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {creating ? "Creating…" : "New form"}
          </button>
        </div>

        {/* Stats strip */}
        {forms.length > 0 && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1, marginBottom: 32,
            borderRadius: 12, overflow: "hidden",
            border: `0.5px solid ${WA(0.1)}`,
          }}>
            {[
              { label: "Total forms", value: forms.length },
              { label: "Total responses", value: totalResponses },
              { label: "Published", value: publishedCount },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: "white", padding: "18px 24px",
              }}>
                <div style={{ ...serif, fontSize: 26, color: B, fontWeight: 400, letterSpacing: "-0.5px", marginBottom: 2 }}>
                  {value}
                </div>
                <div style={{ fontSize: 12, color: M }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Forms grid */}
        {forms.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 0",
            background: "white", borderRadius: 14,
            border: `0.5px solid ${WA(0.1)}`,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: "0 auto 20px",
              background: WA(0.05), border: `0.5px solid ${WA(0.14)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="1" y="3" width="20" height="16" rx="3" stroke={W} strokeWidth="1.5" />
                <path d="M7 9h8M7 13h5" stroke={W} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 500, color: B, margin: "0 0 8px" }}>No forms yet</h2>
            <p style={{ fontSize: 13, color: M, marginBottom: 24 }}>
              Create your first form and start collecting responses.
            </p>
            <button
              onClick={handleCreateForm}
              disabled={creating}
              style={{
                padding: "10px 24px", borderRadius: 8,
                background: W, color: I,
                fontSize: 13, fontWeight: 500,
                border: "none", cursor: "pointer",
              }}
            >
              {creating ? "Creating…" : "Create your first form"}
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {forms.map((form) => {
              const responses = responseCounts[form.id] ?? 0;
              const questionCount = (form.questions as unknown[]).length;
              return (
                <div
                  key={form.id}
                  style={{
                    background: "white", borderRadius: 12,
                    border: `0.5px solid ${WA(0.1)}`,
                    padding: "20px 20px 16px",
                    cursor: "pointer",
                    transition: "box-shadow 0.15s, border-color 0.15s",
                  }}
                  onClick={() => router.push(`/builder/${form.id}`)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(28,20,16,0.08)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = WA(0.22);
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLDivElement).style.borderColor = WA(0.1);
                  }}
                >
                  {/* Card header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <h3 style={{
                      fontSize: 14, fontWeight: 500, color: B,
                      margin: 0, flex: 1, paddingRight: 10,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {form.title}
                    </h3>
                    {/* Published / Draft badge */}
                    <span style={{
                      fontSize: 11, fontWeight: 500, flexShrink: 0,
                      padding: "3px 8px", borderRadius: 20,
                      background: form.is_published ? "rgba(34,197,94,0.1)" : WA(0.06),
                      color: form.is_published ? "#16a34a" : M,
                      border: form.is_published ? "0.5px solid rgba(34,197,94,0.25)" : `0.5px solid ${WA(0.12)}`,
                    }}>
                      {form.is_published ? "Live" : "Draft"}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M1 10L4.5 6.5L7 9L11 4" stroke={M} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: 12, color: B, fontWeight: 500 }}>{responses}</span>
                      <span style={{ fontSize: 12, color: M }}>response{responses !== 1 ? "s" : ""}</span>
                    </div>
                    <span style={{ fontSize: 12, color: D }}>·</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <rect x="1" y="2" width="11" height="9" rx="2" stroke={M} strokeWidth="1.2" />
                        <path d="M4 5.5h5M4 8h3" stroke={M} strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      <span style={{ fontSize: 12, color: B, fontWeight: 500 }}>{questionCount}</span>
                      <span style={{ fontSize: 12, color: M }}>question{questionCount !== 1 ? "s" : ""}</span>
                    </div>
                    <span style={{ fontSize: 12, color: D }}>·</span>
                    <span style={{ fontSize: 12, color: M }}>{timeAgo(form.updated_at)}</span>
                  </div>

                  {/* Quick actions */}
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      paddingTop: 12, borderTop: `0.5px solid ${WA(0.07)}`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Primary: Edit — takes remaining space */}
                    <a
                      href={`/builder/${form.id}`}
                      style={{
                        flex: 1, display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 6,
                        fontSize: 12, fontWeight: 500, color: W,
                        textDecoration: "none",
                        padding: "7px 0", borderRadius: 7,
                        background: WA(0.07), border: `0.5px solid ${WA(0.18)}`,
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M8 1.5L9.5 3L4 8.5H2.5V7L8 1.5Z" stroke={W} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Edit
                    </a>

                    {/* Secondary: icon-only buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>

                      {/* Responses */}
                      <a
                        href={`/dashboard/${form.id}/responses`}
                        title={`${responses} response${responses !== 1 ? "s" : ""}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 4,
                          padding: "7px 9px", borderRadius: 7,
                          border: `0.5px solid ${WA(0.12)}`,
                          color: responses > 0 ? W : M,
                          background: responses > 0 ? WA(0.05) : "transparent",
                          textDecoration: "none",
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <path d="M1 8L3.5 5.5L5.5 7.5L8.5 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {responses > 0 && (
                          <span style={{ fontSize: 11, fontWeight: 600 }}>{responses}</span>
                        )}
                      </a>

                      {/* Copy link */}
                      <button
                        onClick={() => handleCopyLink(form.slug, form.id)}
                        title={copiedId === form.id ? "Copied!" : "Copy share link"}
                        style={{
                          display: "flex", alignItems: "center",
                          padding: "7px 9px", borderRadius: 7,
                          border: `0.5px solid ${WA(0.12)}`,
                          background: copiedId === form.id ? "rgba(34,197,94,0.08)" : "none",
                          color: copiedId === form.id ? "#16a34a" : M,
                          cursor: "pointer",
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <rect x="1" y="3.5" width="6" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
                          <path d="M4 3V2C4 1.45 4.45 1 5 1H9C9.55 1 10 1.45 10 2V7C10 7.55 9.55 8 9 8H8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                        </svg>
                      </button>

                      {/* View live — only if published */}
                      {form.is_published && (
                        <a
                          href={`/f/${form.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View live form"
                          style={{
                            display: "flex", alignItems: "center",
                            padding: "7px 9px", borderRadius: 7,
                            border: `0.5px solid ${WA(0.12)}`,
                            color: M, textDecoration: "none",
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M8 1H10V3M10 1L5.5 5.5M4 2H2C1.45 2 1 2.45 1 3V9C1 9.55 1.45 10 2 10H8C8.55 10 9 9.55 9 9V7" stroke={M} strokeWidth="1.1" strokeLinecap="round" />
                          </svg>
                        </a>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteForm(form.id)}
                        title="Delete form"
                        style={{
                          display: "flex", alignItems: "center",
                          padding: "7px 9px", borderRadius: 7,
                          border: "0.5px solid transparent",
                          background: "none", cursor: "pointer", color: D,
                          transition: "color 0.15s, background 0.15s, border-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.color = "#ef4444";
                          el.style.background = "rgba(239,68,68,0.06)";
                          el.style.borderColor = "rgba(239,68,68,0.2)";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.color = D;
                          el.style.background = "none";
                          el.style.borderColor = "transparent";
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2 3.5H10M4.5 3.5V2.5C4.5 2.22 4.72 2 5 2H7C7.28 2 7.5 2.22 7.5 2.5V3.5M9 3.5V9.5C9 10.05 8.55 10.5 8 10.5H4C3.45 10.5 3 10.05 3 9.5V3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
