import type { QuestionType } from "@/types/form";

interface QuestionTypeInfo {
  type: QuestionType;
  label: string;
  icon: string;
  category: "text" | "choice" | "rating" | "other";
}

export const QUESTION_TYPES: QuestionTypeInfo[] = [
  { type: "short_text", label: "Short Text", icon: "T", category: "text" },
  { type: "long_text", label: "Long Text", icon: "\u00B6", category: "text" },
  { type: "email", label: "Email", icon: "@", category: "text" },
  { type: "number", label: "Number", icon: "#", category: "text" },
  { type: "multiple_choice", label: "Multiple Choice", icon: "\u25CB", category: "choice" },
  { type: "checkboxes", label: "Checkboxes", icon: "\u2610", category: "choice" },
  { type: "dropdown", label: "Dropdown", icon: "\u25BE", category: "choice" },
  { type: "yes_no", label: "Yes / No", icon: "\u2714", category: "choice" },
  { type: "rating", label: "Rating (NPS)", icon: "\u2606", category: "rating" },
  { type: "star_rating", label: "Star Rating", icon: "\u2605", category: "rating" },
  { type: "date", label: "Date", icon: "\uD83D\uDCC5", category: "other" },
  { type: "file_upload", label: "File Upload", icon: "\uD83D\uDCCE", category: "other" },
  { type: "statement", label: "Statement", icon: "\u2139", category: "other" },
];

export function getTypeInfo(type: QuestionType): QuestionTypeInfo {
  return QUESTION_TYPES.find((t) => t.type === type) ?? QUESTION_TYPES[0];
}
