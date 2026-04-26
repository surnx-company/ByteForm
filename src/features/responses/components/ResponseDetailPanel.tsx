"use client";

import { useEffect } from "react";
import type { Form } from "@/shared/types/form";
import type { Database } from "@/shared/types/database";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];

interface Props {
  submission: Submission | null;
  form: Form;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length === 0 ? "—" : value.join(", ");
  return String(value);
}

export function ResponseDetailPanel({ submission, form, onClose }: Props) {
  const isOpen = submission !== null;

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const isCompleted = Boolean(submission?.completed_at);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 bg-foreground/20 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-in panel */}
      <aside
        aria-label="Response detail"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border
          z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <p className="text-sm font-semibold text-foreground">Response</p>
            {submission && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(submission.created_at)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {submission && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                  isCompleted
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {isCompleted ? "Completed" : "Partial"}
              </span>
            )}
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground
                hover:text-foreground transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M4 4L12 12M12 4L4 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Answer list */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {submission && (
            <ol className="space-y-6">
              {form.questions.map((question, i) => {
                const answers = submission.answers as Record<string, unknown>;
                const raw = answers[question.id];
                const display = displayValue(raw);
                const isEmpty = display === "—";

                return (
                  <li key={question.id}>
                    <div className="flex items-start gap-2 mb-1.5">
                      <span className="text-xs text-muted-foreground mt-[3px] shrink-0 tabular-nums">
                        {i + 1}.
                      </span>
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {question.title || "Untitled"}
                        {question.required && (
                          <span className="text-red-500 ml-1" aria-hidden>*</span>
                        )}
                      </p>
                    </div>
                    <div
                      className={`ml-5 text-sm leading-relaxed rounded-lg px-3 py-2.5 ${
                        isEmpty
                          ? "text-muted-foreground bg-secondary/50 italic"
                          : "text-foreground bg-background border border-border"
                      }`}
                    >
                      {display}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </aside>
    </>
  );
}
