import type { Form } from "@/shared/types/form";
import type { Database } from "@/shared/types/database";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join("; ");
  return String(value);
}

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function exportCsv(form: Form, submissions: Submission[]): void {
  const headers = [
    "Submission ID",
    "Submitted At",
    "Status",
    ...form.questions.map((q) => q.title || "Untitled"),
  ];

  const rows = submissions.map((sub) => {
    const answers = sub.answers as Record<string, unknown>;
    return [
      sub.id,
      sub.created_at,
      sub.completed_at ? "Completed" : "Partial",
      ...form.questions.map((q) => formatCellValue(answers[q.id])),
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${form.title.replace(/\s+/g, "_")}_responses.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
