"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Form, Question } from "@/shared/types/form";
import type { Database } from "@/shared/types/database";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];
type DateFilter = "all" | "today" | "7d" | "30d";
type StatusFilter = "all" | "completed" | "partial";

interface Props {
  form: Form;
  submissions: Submission[];
  onSelect: (submission: Submission) => void;
  onDelete: (id: string) => Promise<void>;
  onFilteredChange?: (filtered: Submission[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isRecent(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 24 * 60 * 60 * 1000;
}

const DATE_FILTER_MS: Record<Exclude<DateFilter, "all">, number> = {
  today: 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

function applyDateFilter(submissions: Submission[], filter: DateFilter): Submission[] {
  if (filter === "all") return submissions;
  const cutoff = DATE_FILTER_MS[filter];
  return submissions.filter(
    (s) => Date.now() - new Date(s.created_at).getTime() <= cutoff
  );
}

function applyStatusFilter(submissions: Submission[], filter: StatusFilter): Submission[] {
  if (filter === "all") return submissions;
  return submissions.filter((s) =>
    filter === "completed" ? Boolean(s.completed_at) : !s.completed_at
  );
}

function applySearch(submissions: Submission[], query: string): Submission[] {
  if (!query.trim()) return submissions;
  const q = query.toLowerCase();
  return submissions.filter((s) => {
    const answers = s.answers as Record<string, unknown>;
    return Object.values(answers).some((val) => {
      if (Array.isArray(val)) return val.some((v) => String(v).toLowerCase().includes(q));
      return String(val ?? "").toLowerCase().includes(q);
    });
  });
}

/** Resolve a raw stored answer to a human-readable string.
 *  For choice questions the stored value is the slug — look up the label. */
function resolveDisplay(question: Question, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";

  const choices = question.choices;

  if (choices && choices.length > 0) {
    if (Array.isArray(value)) {
      const labels = value.map((v) => {
        const match = choices.find((c) => c.value === String(v));
        return match ? match.label : String(v);
      });
      return labels.length === 0 ? "—" : labels.join(", ");
    }
    const match = choices.find((c) => c.value === String(value));
    if (match) return match.label;
  }

  if (Array.isArray(value)) return value.length === 0 ? "—" : value.join(", ");
  return String(value);
}

// ─── Mobile card ─────────────────────────────────────────────────────────────

interface MobileCardProps {
  submission: Submission;
  index: number;
  total: number;
  form: Form;
  onSelect: (submission: Submission) => void;
  deletingId: string | null;
  confirmingId: string | null;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}

function MobileCard({
  submission,
  index,
  total,
  form,
  onSelect,
  deletingId,
  confirmingId,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: MobileCardProps) {
  const answers = submission.answers as Record<string, unknown>;
  const completed = Boolean(submission.completed_at);
  const recent = isRecent(submission.created_at);

  const answerableQuestions = form.questions.filter((q) => q.type !== "statement");

  return (
    <div
      onClick={() => onSelect(submission)}
      className="border border-border rounded-xl bg-card px-4 py-4 cursor-pointer hover:bg-secondary/20 transition-colors"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground tabular-nums">
            #{total - index}
          </span>
          {recent && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              New
            </span>
          )}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
              completed
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {completed ? "Completed" : "Partial"}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <DeleteControl
            submissionId={submission.id}
            isDeleting={deletingId === submission.id}
            confirmingId={confirmingId}
            onRequestDelete={onRequestDelete}
            onConfirmDelete={onConfirmDelete}
            onCancelDelete={onCancelDelete}
          />
        </div>
      </div>

      {/* Date */}
      <p className="text-xs text-muted-foreground mb-3">{formatDate(submission.created_at)}</p>

      {/* All answers */}
      <div className="space-y-2">
        {answerableQuestions.map((q) => {
          const display = resolveDisplay(q, answers[q.id]);
          const isEmpty = display === "—";
          return (
            <div key={q.id} className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
              <span className="text-xs text-muted-foreground pt-0.5 leading-snug max-w-[120px] truncate">
                {q.title || "Untitled"}
              </span>
              <span
                className={`text-sm leading-snug break-words ${
                  isEmpty ? "text-muted-foreground/40 italic" : "text-foreground"
                }`}
              >
                {display}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground/50 mt-3 text-right">Tap to view full response</p>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ form }: { form: Form }) {
  return (
    <div className="border border-border rounded-xl bg-card text-center py-20">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M10 3v8M10 3L7 6M10 3l3 3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 13v3a1 1 0 001 1h12a1 1 0 001-1v-3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-foreground font-medium">No responses yet</p>
      <p className="text-sm text-muted-foreground mt-1">
        {form.isPublished ? (
          <>
            Share your form at{" "}
            <a
              href={`/f/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              /f/{form.slug}
            </a>
          </>
        ) : (
          "Publish your form to start collecting responses"
        )}
      </p>
    </div>
  );
}

// ─── Delete control ───────────────────────────────────────────────────────────

interface DeleteControlProps {
  submissionId: string;
  isDeleting: boolean;
  confirmingId: string | null;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}

function DeleteControl({
  submissionId,
  isDeleting,
  confirmingId,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: DeleteControlProps) {
  const isConfirming = confirmingId === submissionId;

  if (isConfirming) {
    return (
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onConfirmDelete(submissionId)}
          disabled={isDeleting}
          className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
        >
          {isDeleting ? "…" : "Delete"}
        </button>
        <button
          onClick={onCancelDelete}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRequestDelete(submissionId);
      }}
      aria-label="Delete response"
      className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5v7.5c0 .28.22.5.5.5h3c.28 0 .5-.22.5-.5V3.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ResponsesTable({ form, submissions, onSelect, onDelete, onFilteredChange }: Props) {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = submissions;
    result = applyDateFilter(result, dateFilter);
    result = applyStatusFilter(result, statusFilter);
    result = applySearch(result, search);
    return result;
  }, [submissions, dateFilter, statusFilter, search]);

  // Notify parent whenever the filtered list changes so exports stay filter-aware
  useEffect(() => {
    onFilteredChange?.(filtered);
  }, [filtered, onFilteredChange]);

  const handleConfirmDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
        setConfirmingId(null);
      }
    },
    [onDelete]
  );

  if (submissions.length === 0) {
    return <EmptyState form={form} />;
  }

  const isFiltering =
    search.trim() !== "" || dateFilter !== "all" || statusFilter !== "all";

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          >
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search responses…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg
              text-foreground placeholder:text-muted-foreground
              focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
          />
        </div>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as DateFilter)}
          className="px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground
            focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
        >
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground
            focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
        >
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="partial">Partial</option>
        </select>
      </div>

      {isFiltering && (
        <p className="text-xs text-muted-foreground mb-3">
          {filtered.length} of {submissions.length} responses
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="border border-border rounded-xl bg-card text-center py-12">
          <p className="text-sm text-muted-foreground">No responses match your filters.</p>
        </div>
      ) : (
        <>
        {/* ── Mobile: card list ── */}
        <div className="flex flex-col gap-3 md:hidden">
          {filtered.map((sub, i) => (
            <MobileCard
              key={sub.id}
              submission={sub}
              index={i}
              total={filtered.length}
              form={form}
              onSelect={onSelect}
              deletingId={deletingId}
              confirmingId={confirmingId}
              onRequestDelete={setConfirmingId}
              onConfirmDelete={handleConfirmDelete}
              onCancelDelete={() => setConfirmingId(null)}
            />
          ))}
        </div>

        {/* ── Desktop: spreadsheet table ── */}
        <div className="hidden md:block border border-border rounded-xl bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse" style={{ minWidth: "100%" }}>
              <thead>
                <tr className="border-b-2 border-border bg-secondary/60 sticky top-0 z-10">
                  {/* # */}
                  <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap border-r border-border/50 bg-secondary/60 w-14">
                    #
                  </th>
                  {/* Date */}
                  <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap border-r border-border/50 bg-secondary/60 min-w-[140px]">
                    Date
                  </th>
                  {/* Status */}
                  <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap border-r border-border/50 bg-secondary/60 min-w-[100px]">
                    Status
                  </th>
                  {/* One column per question */}
                  {form.questions
                    .filter((q) => q.type !== "statement")
                    .map((q) => (
                      <th
                        key={q.id}
                        className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border/50 bg-secondary/60 min-w-[220px]"
                      >
                        {q.title || "Untitled"}
                      </th>
                    ))}
                  {/* Delete col */}
                  <th className="px-4 py-4 w-12 bg-secondary/60" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub, i) => {
                  const answers = sub.answers as Record<string, unknown>;
                  const recent = isRecent(sub.created_at);
                  const completed = Boolean(sub.completed_at);
                  const isEven = i % 2 === 1;

                  return (
                    <tr
                      key={sub.id}
                      className={`border-b border-border/60 last:border-0 transition-colors align-top ${
                        isEven ? "bg-secondary/10" : "bg-card"
                      } hover:bg-accent/5`}
                    >
                      {/* Row number */}
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap border-r border-border/40 align-top">
                        <div className="flex flex-col items-start gap-1.5 pt-0.5">
                          <span className="tabular-nums text-sm font-medium">
                            {filtered.length - i}
                          </span>
                          {recent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium leading-none">
                              New
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-foreground whitespace-nowrap text-xs border-r border-border/40 align-top pt-5">
                        {formatDate(sub.created_at)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap border-r border-border/40 align-top pt-[18px]">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                            completed
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {completed ? "Completed" : "Partial"}
                        </span>
                      </td>

                      {/* Answer columns */}
                      {form.questions
                        .filter((q) => q.type !== "statement")
                        .map((q) => {
                          const display = resolveDisplay(q, answers[q.id]);
                          const isEmpty = display === "—";
                          return (
                            <td
                              key={q.id}
                              className="px-5 py-4 border-r border-border/40 align-top min-w-[220px] max-w-[340px]"
                            >
                              <p
                                className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                  isEmpty
                                    ? "text-muted-foreground/40 italic"
                                    : "text-foreground"
                                }`}
                              >
                                {display}
                              </p>
                            </td>
                          );
                        })}

                      {/* Delete */}
                      <td className="px-4 py-4 whitespace-nowrap align-top">
                        <DeleteControl
                          submissionId={sub.id}
                          isDeleting={deletingId === sub.id}
                          confirmingId={confirmingId}
                          onRequestDelete={setConfirmingId}
                          onConfirmDelete={handleConfirmDelete}
                          onCancelDelete={() => setConfirmingId(null)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
