import * as XLSX from "xlsx";
import type { Form } from "@/shared/types/form";
import type { Database } from "@/shared/types/database";
import { resolveValue } from "./exportCsv";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];

export function exportXlsx(form: Form, submissions: Submission[]): void {
  const answerQuestions = form.questions.filter((q) => q.type !== "statement");

  // Build rows: header first, then data
  const header = [
    "Response #",
    "Date",
    "Status",
    ...answerQuestions.map((q) => q.title || "Untitled"),
  ];

  const dataRows = submissions.map((sub, i) => {
    const answers = sub.answers as Record<string, unknown>;
    return [
      submissions.length - i,
      new Date(sub.created_at).toLocaleString("en-US"),
      sub.completed_at ? "Completed" : "Partial",
      ...answerQuestions.map((q) => resolveValue(q, answers[q.id])),
    ];
  });

  // Create worksheet from array of arrays
  const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows]);

  // Auto column widths: measure longest value in each column
  const allRows = [header, ...dataRows];
  ws["!cols"] = header.map((_, colIdx) => {
    const maxLen = allRows.reduce((max, row) => {
      const cell = row[colIdx];
      const len = cell !== null && cell !== undefined ? String(cell).length : 0;
      return Math.max(max, len);
    }, 10);
    return { wch: Math.min(maxLen + 2, 60) }; // cap at 60 chars wide
  });

  // Freeze the header row
  ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft" };

  // Style the header row cells: bold + background fill
  const headerRange = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellAddr]) continue;
    ws[cellAddr].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "6B1A2A" }, patternType: "solid" },
      alignment: { vertical: "center", wrapText: false },
      border: {
        bottom: { style: "thin", color: { rgb: "4A0F1C" } },
      },
    };
  }

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Responses");

  // Download
  const fileName = `${form.title.replace(/\s+/g, "_")}_responses.xlsx`;
  XLSX.writeFile(wb, fileName);
}
