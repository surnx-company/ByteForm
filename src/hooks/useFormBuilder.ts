"use client";

import { useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import type { Form, Question, QuestionType, WelcomeScreen, ThankYouScreen } from "@/types/form";

const DEFAULT_WELCOME: WelcomeScreen = {
  title: "Welcome",
  description: "We'd love to hear from you. It only takes a few minutes.",
  buttonText: "Start",
};

const DEFAULT_THANKYOU: ThankYouScreen = {
  title: "Thank you!",
  description: "Your response has been recorded.",
};

function createQuestion(type: QuestionType): Question {
  const base: Question = {
    id: uuid(),
    type,
    title: "",
    required: false,
  };

  switch (type) {
    case "multiple_choice":
    case "checkboxes":
    case "dropdown":
      return {
        ...base,
        choices: [
          { id: uuid(), label: "Option 1", value: "option_1" },
          { id: uuid(), label: "Option 2", value: "option_2" },
          { id: uuid(), label: "Option 3", value: "option_3" },
        ],
      };
    case "rating":
      return { ...base, min: 0, max: 10 };
    case "star_rating":
      return { ...base, max: 5 };
    case "file_upload":
      return { ...base, maxFileSize: 10 };
    default:
      return base;
  }
}

export function useFormBuilder(initialForm?: Form) {
  const [form, setForm] = useState<Form>(
    initialForm ?? {
      id: uuid(),
      userId: "",
      title: "Untitled Form",
      slug: "",
      welcomeScreen: DEFAULT_WELCOME,
      thankYouScreen: DEFAULT_THANKYOU,
      questions: [],
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingScreen, setEditingScreen] = useState<"welcome" | "thankyou" | null>(null);

  const selectedQuestion = form.questions.find((q) => q.id === selectedId) ?? null;

  const addQuestion = useCallback((type: QuestionType) => {
    const q = createQuestion(type);
    setForm((f) => ({
      ...f,
      questions: [...f.questions, q],
      updatedAt: new Date().toISOString(),
    }));
    setSelectedId(q.id);
    setEditingScreen(null);
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setForm((f) => ({
      ...f,
      questions: f.questions.filter((q) => q.id !== id),
      updatedAt: new Date().toISOString(),
    }));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const duplicateQuestion = useCallback((id: string) => {
    setForm((f) => {
      const idx = f.questions.findIndex((q) => q.id === id);
      if (idx === -1) return f;
      const original = f.questions[idx];
      const copy: Question = {
        ...JSON.parse(JSON.stringify(original)),
        id: uuid(),
        title: original.title ? `${original.title} (copy)` : "",
      };
      // Re-generate choice IDs
      if (copy.choices) {
        copy.choices = copy.choices.map((c) => ({ ...c, id: uuid() }));
      }
      const newQuestions = [...f.questions];
      newQuestions.splice(idx + 1, 0, copy);
      return {
        ...f,
        questions: newQuestions,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const reorderQuestions = useCallback((oldIndex: number, newIndex: number) => {
    setForm((f) => {
      const newQuestions = [...f.questions];
      const [removed] = newQuestions.splice(oldIndex, 1);
      newQuestions.splice(newIndex, 0, removed);
      return {
        ...f,
        questions: newQuestions,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateWelcomeScreen = useCallback((updates: Partial<WelcomeScreen>) => {
    setForm((f) => ({
      ...f,
      welcomeScreen: { ...f.welcomeScreen, ...updates },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateThankYouScreen = useCallback((updates: Partial<ThankYouScreen>) => {
    setForm((f) => ({
      ...f,
      thankYouScreen: { ...f.thankYouScreen, ...updates },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateFormTitle = useCallback((title: string) => {
    setForm((f) => ({ ...f, title, updatedAt: new Date().toISOString() }));
  }, []);

  const setPublished = useCallback((isPublished: boolean) => {
    setForm((f) => ({ ...f, isPublished, updatedAt: new Date().toISOString() }));
  }, []);

  return {
    form,
    selectedId,
    setSelectedId,
    selectedQuestion,
    editingScreen,
    setEditingScreen,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
    updateWelcomeScreen,
    updateThankYouScreen,
    updateFormTitle,
    setPublished,
  };
}
