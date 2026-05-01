"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/shared/types/database";
import { UserMenu } from "@/shared/components/UserMenu";

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

interface FormCardProps {
  form: FormRow;
  responses: number;
  copied: boolean;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onCopyLink: (slug: string, id: string) => void;
}

function FormCardInner({ form, responses, copied, onOpen, onDelete, onCopyLink }: FormCardProps) {
  const questionCount = (form.questions as unknown[]).length;

  const handleOpen = useCallback(() => onOpen(form.id), [onOpen, form.id]);
  const handleDelete = useCallback(() => onDelete(form.id), [onDelete, form.id]);
  const handleCopy = useCallback(() => onCopyLink(form.slug, form.id), [onCopyLink, form.slug, form.id]);

  return (
    <div
      className="dashboard-form-card flex flex-col"
      onClick={handleOpen}
      style={{
        background: "white", borderRadius: 12,
        border: `0.5px solid ${WA(0.1)}`,
        padding: "20px 20px 16px",
        cursor: "pointer",
      }}
    >
      {/* Title row + status badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 style={{
          fontSize: 14, fontWeight: 500, color: B,
          margin: 0, flex: 1, minWidth: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {form.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {form.is_published && (
            <a
              href={`/f/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={stopPropagation}
              title="View live form"
              style={{
                display: "flex", alignItems: "center",
                padding: "3px 7px", borderRadius: 20,
                fontSize: 11, color: M, textDecoration: "none",
                border: `0.5px solid ${WA(0.12)}`,
              }}
            >
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M7.5 1H9V2.5M9 1L5 5M3.5 2H2C1.45 2 1 2.45 1 3V8C1 8.55 1.45 9 2 9H7C7.55 9 8 8.55 8 8V6.5" stroke={M} strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </a>
          )}
          <span style={{
            fontSize: 11, fontWeight: 500,
            padding: "3px 8px", borderRadius: 20,
            background: form.is_published ? "rgba(34,197,94,0.1)" : WA(0.06),
            color: form.is_published ? "#16a34a" : M,
            border: form.is_published ? "0.5px solid rgba(34,197,94,0.25)" : `0.5px solid ${WA(0.12)}`,
          }}>
            {form.is_published ? "Live" : "Draft"}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 flex-wrap mb-4" style={{ fontSize: 12 }}>
        <div className="flex items-center gap-1">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1 10L4.5 6.5L7 9L11 4" stroke={M} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: B, fontWeight: 500 }}>{responses}</span>
          <span style={{ color: M }}>response{responses !== 1 ? "s" : ""}</span>
        </div>
        <span style={{ color: D }}>·</span>
        <div className="flex items-center gap-1">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="2" width="11" height="9" rx="2" stroke={M} strokeWidth="1.2" />
            <path d="M4 5.5h5M4 8h3" stroke={M} strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span style={{ color: B, fontWeight: 500 }}>{questionCount}</span>
          <span style={{ color: M }}>question{questionCount !== 1 ? "s" : ""}</span>
        </div>
        <span style={{ color: D }}>·</span>
        <span style={{ color: M }}>{timeAgo(form.updated_at)}</span>
      </div>

      {/* Footer actions — always 4 items so all cards align */}
      <div
        className="flex items-center gap-1 flex-wrap mt-auto pt-3"
        style={{ borderTop: `0.5px solid ${WA(0.07)}` }}
        onClick={stopPropagation}
      >
        <Link
          href={`/builder/${form.id}`}
          className="dashboard-card-action flex items-center gap-1"
          style={{
            fontSize: 12, color: M, textDecoration: "none",
            padding: "5px 10px", borderRadius: 6,
            border: `0.5px solid ${WA(0.12)}`,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M8 1.5L9.5 3L4 8.5H2.5V7L8 1.5Z" stroke={M} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Edit
        </Link>

        <Link
          href={`/dashboard/${form.id}/responses`}
          className="dashboard-card-action flex items-center gap-1"
          style={{
            fontSize: 12, color: M, textDecoration: "none",
            padding: "5px 10px", borderRadius: 6,
            border: `0.5px solid ${WA(0.12)}`,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 8L3.5 5.5L5.5 7.5L8.5 3" stroke={M} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Responses
          {responses > 0 && (
            <span style={{
              background: WA(0.1), color: W,
              fontSize: 10, fontWeight: 600,
              padding: "1px 5px", borderRadius: 10,
            }}>{responses}</span>
          )}
        </Link>

        <button
          onClick={handleCopy}
          title="Copy share link"
          className="dashboard-card-action flex items-center gap-1"
          style={{
            fontSize: 12, color: copied ? "#16a34a" : M,
            padding: "5px 10px", borderRadius: 6,
            border: `0.5px solid ${WA(0.12)}`,
            background: "none", cursor: "pointer",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="1" y="3.5" width="6" height="7" rx="1.5" stroke={M} strokeWidth="1.1" />
            <path d="M4 3V2C4 1.45 4.45 1 5 1H9C9.55 1 10 1.45 10 2V7C10 7.55 9.55 8 9 8H8" stroke={M} strokeWidth="1.1" strokeLinecap="round" />
          </svg>
          {copied ? "Copied!" : "Copy link"}
        </button>

        <button
          onClick={handleDelete}
          title="Delete form"
          className="dashboard-card-delete flex items-center ml-auto"
          style={{
            padding: "5px 8px", borderRadius: 6,
            border: `0.5px solid transparent`,
            background: "none", cursor: "pointer",
            color: D,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 3.5H10M4.5 3.5V2.5C4.5 2.22 4.72 2 5 2H7C7.28 2 7.5 2.22 7.5 2.5V3.5M9 3.5V9.5C9 10.05 8.55 10.5 8 10.5H4C3.45 10.5 3 10.05 3 9.5V3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function stopPropagation(e: React.MouseEvent) { e.stopPropagation(); }

const FormCard = memo(FormCardInner);

export function DashboardClient({ forms: initialForms, responseCounts }: Props) {
  const [forms, setForms] = useState(initialForms);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const pendingDeleteForm = useMemo(
    () => forms.find((f) => f.id === pendingDeleteId) ?? null,
    [forms, pendingDeleteId],
  );

  const { totalResponses, publishedCount } = useMemo(() => ({
    totalResponses: Object.values(responseCounts).reduce((a, b) => a + b, 0),
    publishedCount: forms.filter((f) => f.is_published).length,
  }), [forms, responseCounts]);

  const handleCreateForm = useCallback(async () => {
    setCreating(true);
    const slug = `form-${Date.now().toString(36)}`;
    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Form", slug }),
    });
    if (res.ok) {
      const form = await res.json();
      router.push(`/builder/${form.id}`);
    } else {
      setCreating(false);
    }
  }, [router]);

  const handleDeleteForm = useCallback((id: string) => {
    setPendingDeleteId(id);
  }, []);

  const cancelDelete = useCallback(() => {
    if (deleting) return;
    setPendingDeleteId(null);
  }, [deleting]);

  const confirmDelete = useCallback(async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/forms/${pendingDeleteId}`, { method: "DELETE" });
    if (res.ok) {
      setForms((prev) => prev.filter((f) => f.id !== pendingDeleteId));
    }
    setDeleting(false);
    setPendingDeleteId(null);
  }, [pendingDeleteId]);

  useEffect(() => {
    if (!pendingDeleteId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelDelete();
      else if (e.key === "Enter") confirmDelete();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingDeleteId, cancelDelete, confirmDelete]);

  const handleCopyLink = useCallback((slug: string, id: string) => {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleOpenForm = useCallback((id: string) => {
    router.push(`/builder/${id}`);
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: I, fontFamily: "var(--font-sans)", color: B }}>

      <header style={{ borderBottom: `0.5px solid ${WA(0.1)}`, background: "white" }}>
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.svg" alt="ByteForm" style={{ height: 30, width: 30 }} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <span style={{ ...serif, fontSize: 18, color: B, letterSpacing: "-0.3px" }}>Byte</span>
              <span style={{ ...serif, fontSize: 18, color: W, letterSpacing: "-0.3px" }}>Form</span>
            </div>
          </Link>
          <UserMenu />
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-5 md:px-8 py-8 md:py-10">

        <div className="flex items-center justify-between gap-4 mb-8">
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
            className="flex items-center gap-2 shrink-0"
            style={{
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

        {forms.length > 0 && (
          <div
            className="grid grid-cols-3 mb-8 rounded-xl overflow-hidden"
            style={{ gap: 1, border: `0.5px solid ${WA(0.1)}` }}
          >
            {[
              { label: "Total forms", value: forms.length },
              { label: "Responses", value: totalResponses },
              { label: "Published", value: publishedCount },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white px-4 py-4 md:px-6 md:py-5">
                <div style={{ ...serif, fontSize: 26, color: B, fontWeight: 400, letterSpacing: "-0.5px", marginBottom: 2 }}>
                  {value}
                </div>
                <div style={{ fontSize: 12, color: M }}>{label}</div>
              </div>
            ))}
          </div>
        )}

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
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                responses={responseCounts[form.id] ?? 0}
                copied={copiedId === form.id}
                onOpen={handleOpenForm}
                onDelete={handleDeleteForm}
                onCopyLink={handleCopyLink}
              />
            ))}
          </div>
        )}
      </main>

      {pendingDeleteForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-form-title"
          onClick={cancelDelete}
          className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-foreground/45 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={stopPropagation}
            className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6 animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-200"
          >
            <div className="w-10 h-10 rounded-lg mb-4 bg-destructive/10 flex items-center justify-center text-destructive">
              <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 3.5H10M4.5 3.5V2.5C4.5 2.22 4.72 2 5 2H7C7.28 2 7.5 2.22 7.5 2.5V3.5M9 3.5V9.5C9 10.05 8.55 10.5 8 10.5H4C3.45 10.5 3 10.05 3 9.5V3.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2
              id="delete-form-title"
              className="font-serif text-xl font-normal tracking-tight text-foreground mb-1.5"
            >
              Delete this form?
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">
              <strong className="text-foreground font-medium">{pendingDeleteForm.title}</strong>
              {" "}and all of its responses will be permanently removed. This can&apos;t be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-card text-foreground text-[13px] font-medium border border-border hover:bg-foreground/5 hover:border-foreground/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                autoFocus
                className="px-4 py-2 rounded-lg bg-destructive text-white text-[13px] font-medium hover:opacity-90 transition disabled:opacity-70 disabled:cursor-wait"
              >
                {deleting ? "Deleting…" : "Delete form"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-form-card {
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .dashboard-form-card:hover {
          box-shadow: 0 4px 20px rgba(28,20,16,0.08);
          border-color: ${WA(0.22)};
        }
        .dashboard-card-delete:hover {
          color: #ef4444 !important;
        }
      `}
      </style>
    </div>
  );
}
