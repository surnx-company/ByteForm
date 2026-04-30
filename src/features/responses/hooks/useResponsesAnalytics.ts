import { useMemo } from "react";
import type { Form, Question, QuestionType } from "@/shared/types/form";
import type { Database } from "@/shared/types/database";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];

// ─── Public types ────────────────────────────────────────────────────────────

export interface DropOffItem {
  questionId: string;
  title: string;
  answered: number;
  rate: number;
}

export type AnswerSummaryKind = "yes_no" | "choice" | "scale";

export interface AnswerSummary {
  questionId: string;
  title: string;
  kind: AnswerSummaryKind;
  total: number;
  // yes_no
  yesCount?: number;
  noCount?: number;
  // choice (multiple_choice, dropdown, checkboxes)
  choices?: string[];
  choiceCounts?: Record<string, number>;
  // scale (rating, star_rating)
  average?: number;
  distribution?: number[]; // index = (value - min)
  min?: number;
  max?: number;
}

export interface ResponsesAnalytics {
  total: number;
  completedCount: number;
  completionRate: number;
  avgTime: number;
  dropOff: DropOffItem[];
  answerSummaries: AnswerSummary[];
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

const SUMMARIZABLE: QuestionType[] = [
  "yes_no",
  "multiple_choice",
  "dropdown",
  "checkboxes",
  "rating",
  "star_rating",
];

function isAnswered(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function buildDropOff(
  questions: Question[],
  submissions: Submission[],
  total: number
): DropOffItem[] {
  return questions.map((q) => {
    const answered = submissions.filter((s) => {
      const val = (s.answers as Record<string, unknown>)[q.id];
      return isAnswered(val);
    }).length;
    return {
      questionId: q.id,
      title: q.title || "Untitled",
      answered,
      rate: total > 0 ? Math.round((answered / total) * 100) : 0,
    };
  });
}

function buildYesNoSummary(question: Question, answers: unknown[]): AnswerSummary {
  const yesValues = new Set(["yes", "Yes", "YES", "true"]);
  const yesCount = answers.filter((v) => yesValues.has(String(v))).length;
  return {
    questionId: question.id,
    title: question.title || "Untitled",
    kind: "yes_no",
    total: answers.length,
    yesCount,
    noCount: answers.length - yesCount,
  };
}

function buildChoiceSummary(question: Question, answers: unknown[]): AnswerSummary {
  const choices = question.choices?.map((c) => c.label) ?? [];
  const choiceCounts: Record<string, number> = Object.fromEntries(
    choices.map((label) => [label, 0])
  );

  for (const val of answers) {
    const items = Array.isArray(val) ? val : [val];
    for (const item of items) {
      const label = String(item);
      choiceCounts[label] = (choiceCounts[label] ?? 0) + 1;
    }
  }

  return {
    questionId: question.id,
    title: question.title || "Untitled",
    kind: "choice",
    total: answers.length,
    choices,
    choiceCounts,
  };
}

function buildScaleSummary(question: Question, answers: unknown[]): AnswerSummary {
  const min = question.min ?? 1;
  const max = question.max ?? (question.type === "star_rating" ? 5 : 10);
  const nums = answers.map(Number).filter((n) => !isNaN(n));

  const average =
    nums.length > 0
      ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
      : 0;

  const distribution = Array<number>(max - min + 1).fill(0);
  for (const n of nums) {
    const idx = Math.round(n) - min;
    if (idx >= 0 && idx < distribution.length) distribution[idx]++;
  }

  return {
    questionId: question.id,
    title: question.title || "Untitled",
    kind: "scale",
    total: nums.length,
    average,
    distribution,
    min,
    max,
  };
}

function buildAnswerSummary(
  question: Question,
  submissions: Submission[]
): AnswerSummary | null {
  if (!SUMMARIZABLE.includes(question.type)) return null;

  const answers = submissions
    .map((s) => (s.answers as Record<string, unknown>)[question.id])
    .filter(isAnswered);

  if (answers.length === 0) return null;

  if (question.type === "yes_no") return buildYesNoSummary(question, answers);
  if (
    question.type === "multiple_choice" ||
    question.type === "dropdown" ||
    question.type === "checkboxes"
  )
    return buildChoiceSummary(question, answers);
  if (question.type === "rating" || question.type === "star_rating")
    return buildScaleSummary(question, answers);

  return null;
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useResponsesAnalytics(
  form: Form,
  submissions: Submission[]
): ResponsesAnalytics {
  return useMemo(() => {
    const total = submissions.length;

    if (total === 0) {
      return {
        total: 0,
        completedCount: 0,
        completionRate: 0,
        avgTime: 0,
        dropOff: [],
        answerSummaries: [],
      };
    }

    const completedCount = submissions.filter((s) => s.completed_at).length;
    const completionRate = Math.round((completedCount / total) * 100);

    const times = submissions
      .filter((s) => s.completed_at && s.started_at)
      .map((s) => {
        const start = new Date(s.started_at).getTime();
        const end = new Date(s.completed_at!).getTime();
        return (end - start) / 1000;
      });

    const avgTime =
      times.length > 0
        ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
        : 0;

    const dropOff = buildDropOff(form.questions, submissions, total);

    const answerSummaries = form.questions
      .map((q) => buildAnswerSummary(q, submissions))
      .filter((s): s is AnswerSummary => s !== null);

    return { total, completedCount, completionRate, avgTime, dropOff, answerSummaries };
  }, [form.questions, submissions]);
}
