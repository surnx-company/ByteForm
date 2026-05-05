import type { Form, Question } from "@/shared/types/form";
import type { Database } from "@/shared/types/database";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];

/** Resolve a stored answer value to a human-readable string.
 *  Choice questions store slugs — map them back to labels. */
export function resolveValue(question: Question, value: unknown): string {
  if (value === null || value === undefined || value === "") return "";

  const choices = question.choices;

  if (choices && choices.length > 0) {
    if (Array.isArray(value)) {
      return value
        .map((v) => {
          const match = choices.find((c) => c.value === String(v));
          return match ? match.label : String(v);
        })
        .join("; ");
    }
    const match = choices.find((c) => c.value === String(value));
    if (match) return match.label;
  }

  if (Array.isArray(value)) return value.join("; ");
  return String(value);
}

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function exportCsv(form: Form, submissions: Submission[]): void {
  const answerQuestions = form.questions.filter((q) => q.type !== "statement");

  const headers = [
    "Response #",
    "Date",
    "Status",
    ...answerQuestions.map((q) => q.title || "Untitled"),
  ];

  const rows = submissions.map((sub, i) => {
    const answers = sub.answers as Record<string, unknown>;
    return [
      String(submissions.length - i),
      sub.created_at,
      sub.completed_at ? "Completed" : "Partial",
      ...answerQuestions.map((q) => resolveValue(q, answers[q.id])),
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${form.title.replace(/\s+/g, "_")}_responses.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
