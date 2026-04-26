"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Form, Answers, AnswerValue, Question } from "@/types/form";

export type FormStage = "welcome" | "questions" | "thankYou";

interface FormEngine {
  stage: FormStage;
  currentIndex: number;
  answers: Answers;
  direction: 1 | -1;
  visibleQuestions: Question[];
  totalVisible: number;
  progress: number;
  currentQuestion: Question | undefined;
  startForm: () => void;
  goNext: () => void;
  goNextForce: () => void;
  goPrev: () => void;
  setAnswer: (questionId: string, value: AnswerValue) => void;
  canAdvance: boolean;
  isFirst: boolean;
  isLast: boolean;
}

function evaluateCondition(
  question: Question,
  answers: Answers
): boolean {
  const logic = question.conditionalLogic;
  if (!logic) return true;

  const answer = answers[logic.questionId];
  if (answer === undefined || answer === null) return false;

  const answerStr = String(answer);
  switch (logic.operator) {
    case "equals":
      return answerStr === logic.value;
    case "not_equals":
      return answerStr !== logic.value;
    case "contains":
      return answerStr.includes(logic.value);
    case "greater_than":
      return Number(answer) > Number(logic.value);
    case "less_than":
      return Number(answer) < Number(logic.value);
    default:
      return true;
  }
}

function validateAnswer(question: Question, value: AnswerValue): boolean {
  if (!question.required) return true;

  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;

  if (question.type === "email" && typeof value === "string") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  return true;
}

export function useFormEngine(form: Form, jumpTo?: string): FormEngine {
  const [stage, setStage] = useState<FormStage>("welcome");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [direction, setDirection] = useState<1 | -1>(1);

  const visibleQuestions = useMemo(
    () => form.questions.filter((q) => evaluateCondition(q, answers)),
    [form.questions, answers]
  );

  // Sync preview to the builder's selected question / screen
  useEffect(() => {
    if (!jumpTo) return;
    if (jumpTo === "welcome") {
      setStage("welcome");
    } else if (jumpTo === "thankyou") {
      setStage("thankYou");
    } else {
      const idx = visibleQuestions.findIndex((q) => q.id === jumpTo);
      if (idx !== -1) {
        setStage("questions");
        setCurrentIndex(idx);
        setDirection(1);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpTo]);

  const totalVisible = visibleQuestions.length;
  const currentQuestion = visibleQuestions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalVisible - 1;

  const progress = totalVisible > 0
    ? ((currentIndex + 1) / totalVisible) * 100
    : 0;

  const canAdvance = useMemo(() => {
    if (!currentQuestion) return true;
    if (currentQuestion.type === "statement") return true;
    const value = answers[currentQuestion.id];
    return validateAnswer(currentQuestion, value ?? null);
  }, [currentQuestion, answers]);

  const startForm = useCallback(() => {
    setStage("questions");
    setCurrentIndex(0);
    setDirection(1);
  }, []);

  const advance = useCallback(() => {
    setDirection(1);
    if (isLast) {
      setStage("thankYou");
    } else {
      setCurrentIndex((i) => Math.min(i + 1, totalVisible - 1));
    }
  }, [isLast, totalVisible]);

  const goNext = useCallback(() => {
    if (!canAdvance) return;
    advance();
  }, [canAdvance, advance]);

  const goNextForce = useCallback(() => {
    advance();
  }, [advance]);

  const goPrev = useCallback(() => {
    if (isFirst) return;
    setDirection(-1);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, [isFirst]);

  const setAnswer = useCallback((questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  return {
    stage,
    currentIndex,
    answers,
    direction,
    visibleQuestions,
    totalVisible,
    progress,
    currentQuestion,
    startForm,
    goNext,
    goNextForce,
    goPrev,
    setAnswer,
    canAdvance,
    isFirst,
    isLast,
  };
}
