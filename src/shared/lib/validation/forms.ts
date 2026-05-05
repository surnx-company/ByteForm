import { z } from "zod";
import type { Question, QuestionType } from "@/shared/types/form";

const QUESTION_TYPES: [QuestionType, ...QuestionType[]] = [
  "short_text",
  "long_text",
  "multiple_choice",
  "checkboxes",
  "dropdown",
  "yes_no",
  "rating",
  "star_rating",
  "email",
  "number",
  "date",
  "file_upload",
  "statement",
];

const choiceSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  value: z.string(),
});

const conditionalLogicSchema = z.object({
  questionId: z.string().min(1),
  operator: z.enum([
    "equals",
    "not_equals",
    "contains",
    "greater_than",
    "less_than",
  ]),
  value: z.string(),
});

const questionSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(QUESTION_TYPES),
    title: z.string(),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    required: z.boolean(),
    choices: z.array(choiceSchema).optional(),
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
    maxFileSize: z.number().positive().optional(),
    acceptedFileTypes: z.array(z.string()).optional(),
    conditionalLogic: conditionalLogicSchema.optional(),
  })
  .superRefine((q, ctx) => {
    if (
      (q.type === "multiple_choice" ||
        q.type === "checkboxes" ||
        q.type === "dropdown") &&
      (!q.choices || q.choices.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["choices"],
        message: `${q.type} questions require at least one choice`,
      });
    }
    if (q.min !== undefined && q.max !== undefined && q.min > q.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["min"],
        message: "min cannot be greater than max",
      });
    }
  });

const welcomeScreenSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  buttonText: z.string(),
});

const thankYouScreenSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, digits, or hyphens");

// Accepts a valid absolute URL or an empty string (to clear the redirect).
const redirectUrlSchema = z
  .string()
  .refine(
    (val) => val === "" || /^https?:\/\/.+/.test(val),
    { message: "Must be a valid URL starting with http:// or https://" }
  );

const formBaseShape = {
  title: z.string().min(1).max(200),
  slug: slugSchema,
  welcomeScreen: welcomeScreenSchema,
  thankYouScreen: thankYouScreenSchema,
  questions: z.array(questionSchema).max(500),
  redirectUrl: redirectUrlSchema,
};

export const createFormSchema = z
  .object({
    title: formBaseShape.title.optional(),
    slug: formBaseShape.slug.optional(),
    welcomeScreen: formBaseShape.welcomeScreen.optional(),
    thankYouScreen: formBaseShape.thankYouScreen.optional(),
    questions: formBaseShape.questions.optional(),
  })
  .strict();

export const updateFormSchema = z
  .object({
    ...formBaseShape,
    isPublished: z.boolean().optional(),
  })
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, {
    message: "request body must contain at least one field",
  });

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const answerValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.null(),
]);

export const submissionSchema = z
  .object({
    answers: z.record(z.string(), answerValueSchema),
    startedAt: z.string().datetime({ offset: true }).optional(),
    completed: z.boolean().optional(),
  })
  .strict();

export type SubmissionPayload = z.infer<typeof submissionSchema>;
export type AnswerInput = z.infer<typeof answerValueSchema>;

export interface AnswerIssue {
  questionId: string;
  message: string;
}

function isEmpty(value: AnswerInput): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

export function validateAnswersAgainstQuestions(
  questions: Question[],
  answers: Record<string, AnswerInput>
): AnswerIssue[] {
  const issues: AnswerIssue[] = [];
  const known = new Set(questions.map((q) => q.id));

  for (const id of Object.keys(answers)) {
    if (!known.has(id)) {
      issues.push({ questionId: id, message: "unknown question id" });
    }
  }

  for (const q of questions) {
    if (q.type === "statement") continue;
    const value = answers[q.id];
    const empty = value === undefined || isEmpty(value);

    if (empty) {
      if (q.required) {
        issues.push({ questionId: q.id, message: "required" });
      }
      continue;
    }

    switch (q.type) {
      case "short_text":
      case "long_text":
      case "dropdown":
      case "multiple_choice":
      case "yes_no":
      case "date":
        if (typeof value !== "string") {
          issues.push({ questionId: q.id, message: "must be a string" });
        }
        break;
      case "email":
        if (typeof value !== "string" || !emailRegex.test(value)) {
          issues.push({ questionId: q.id, message: "must be a valid email" });
        }
        break;
      case "number":
      case "rating":
      case "star_rating": {
        const n = typeof value === "number" ? value : Number(value);
        if (!Number.isFinite(n)) {
          issues.push({ questionId: q.id, message: "must be a number" });
          break;
        }
        if (q.min !== undefined && n < q.min) {
          issues.push({ questionId: q.id, message: `must be >= ${q.min}` });
        }
        if (q.max !== undefined && n > q.max) {
          issues.push({ questionId: q.id, message: `must be <= ${q.max}` });
        }
        break;
      }
      case "checkboxes":
        if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
          issues.push({ questionId: q.id, message: "must be an array of strings" });
        }
        break;
      case "file_upload":
        if (typeof value !== "string") {
          issues.push({ questionId: q.id, message: "must be a file reference string" });
        }
        break;
    }

    if (
      (q.type === "multiple_choice" || q.type === "dropdown") &&
      typeof value === "string" &&
      q.choices &&
      !q.choices.some((c) => c.value === value)
    ) {
      issues.push({ questionId: q.id, message: "value not in choices" });
    }

    if (
      q.type === "checkboxes" &&
      Array.isArray(value) &&
      q.choices &&
      value.some((v) => !q.choices!.some((c) => c.value === v))
    ) {
      issues.push({ questionId: q.id, message: "value not in choices" });
    }
  }

  return issues;
}
