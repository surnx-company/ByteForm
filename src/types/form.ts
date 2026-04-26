export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "yes_no"
  | "rating"
  | "star_rating"
  | "email"
  | "number"
  | "date"
  | "file_upload"
  | "statement";

export interface Choice {
  id: string;
  label: string;
  value: string;
}

export interface ConditionalLogic {
  questionId: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  choices?: Choice[];
  min?: number;
  max?: number;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  conditionalLogic?: ConditionalLogic;
}

export interface WelcomeScreen {
  title: string;
  description?: string;
  buttonText: string;
}

export interface ThankYouScreen {
  title: string;
  description?: string;
}

export interface Form {
  id: string;
  userId: string;
  title: string;
  slug: string;
  welcomeScreen: WelcomeScreen;
  thankYouScreen: ThankYouScreen;
  questions: Question[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Answers = Record<string, AnswerValue>;

export type AnswerValue = string | string[] | number | File | null;
