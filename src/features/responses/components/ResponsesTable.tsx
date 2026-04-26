"use client";

import { useState, useMemo, useCallback } from "react";
import type { Form } from "@/shared/types/form";
import type { Database } from "@/shared/types/database";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];
type DateFilter = "all" | "today" | "7d" | "30d";
type StatusFilter = "all" | "completed" | "partial";

interface Props {
  form: Form;
  submissions: Submission[];
  onSelect: (submission: Submission) => void;
  onDelete: (id: string) => Promise<void>;
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

function applyStatusFilter(
  submissions: Submission[],
  filter: StatusFilter
): Submission[] {
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

function cellDisplay(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.length === 0 ? "—" : value.join(", ");
  return String(value);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

interface DeleteCellProps {
  submissionId: string;
  isDeleting: boolean;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  confirmingId: string | null;
}

function DeleteCell({
  submissionId,
  isDeleting,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  confirmingId,
}: DeleteCellProps) {
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
      className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600
        transition-colors"
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

export function ResponsesTable({ form, submissions, onSelect, onDelete }: Props) {
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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

      {/* Result count when filtering */}
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
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  {form.questions.map((q) => (
                    <th
                      key={q.id}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      <span className="block truncate max-w-[160px]">
                        {q.title || "Untitled"}
                      </span>
                    </th>
                  ))}
                  {/* Delete column */}
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub, i) => {
                  const answers = sub.answers as Record<string, unknown>;
                  const recent = isRecent(sub.created_at);
                  const completed = Boolean(sub.completed_at);

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => onSelect(sub)}
                      className="border-b border-border last:border-0 hover:bg-secondary/30
                        cursor-pointer transition-colors"
                    >
                      {/* Row number + New badge */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{filtered.length - i}</span>
                          {recent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full
                              bg-green-100 text-green-700 font-medium">
                              New
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-foreground whitespace-nowrap text-xs">
                        {formatDate(sub.created_at)}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
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
                      {form.questions.map((q) => {
                        const display = cellDisplay(answers[q.id]);
                        return (
                          <td key={q.id} className="px-4 py-3 max-w-[160px]">
                            <span
                              className="block truncate text-sm text-foreground"
                              title={display}
                            >
                              {display}
                            </span>
                          </td>
                        );
                      })}

                      {/* Delete action */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <DeleteCell
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
      )}
    </div>
  );
}
