"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Form } from "@/types/form";
import { useFormEngine } from "@/hooks/useFormEngine";
import { QuestionRenderer } from "./QuestionRenderer";

interface Props {
  form: Form;
  onSubmit?: (answers: Record<string, unknown>) => void;
  jumpTo?: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const transition = {
  y: { type: "spring" as const, stiffness: 400, damping: 35 },
  opacity: { duration: 0.25 },
};

export function FormView({ form, onSubmit, jumpTo }: Props) {
  const engine = useFormEngine(form, jumpTo);
  const {
    stage,
    currentIndex,
    answers,
    direction,
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
  } = engine;

  const handleSubmit = useCallback(() => {
    if (stage === "questions" && currentIndex === totalVisible - 1 && canAdvance) {
      onSubmit?.(answers);
    }
    goNext();
  }, [stage, currentIndex, totalVisible, canAdvance, goNext, onSubmit, answers]);

  // For auto-advancing question types (multiple choice, yes/no, rating, star)
  // These bypass canAdvance since they've already set a valid answer
  const handleAutoAdvance = useCallback(() => {
    if (stage === "questions" && currentIndex === totalVisible - 1) {
      onSubmit?.(answers);
    }
    goNextForce();
  }, [stage, currentIndex, totalVisible, goNextForce, onSubmit, answers]);

  // Global keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA";

      if (stage === "welcome" && e.key === "Enter") {
        e.preventDefault();
        startForm();
        return;
      }

      if (stage !== "questions") return;

      if (e.key === "Enter" && !e.shiftKey && !isInput) {
        e.preventDefault();
        handleSubmit();
      }

      if (e.key === "Backspace" && !isInput) {
        e.preventDefault();
        goPrev();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stage, startForm, handleSubmit, goPrev]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg text-fg">
      {/* Progress bar */}
      {stage === "questions" && (
        <div className="absolute top-0 left-0 right-0 z-50 h-1 bg-border">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        {/* Welcome Screen */}
        {stage === "welcome" && (
          <motion.div
            key="welcome"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="h-full flex items-center justify-center px-6"
          >
            <div className="max-w-2xl w-full text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-4xl md:text-6xl font-bold tracking-tight"
              >
                {form.welcomeScreen.title}
              </motion.h1>
              {form.welcomeScreen.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="mt-6 text-lg md:text-xl text-fg-muted leading-relaxed"
                >
                  {form.welcomeScreen.description}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-10"
              >
                <button
                  onClick={startForm}
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-lg
                    bg-accent hover:bg-accent-hover text-white text-lg font-medium
                    transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    shadow-lg shadow-accent/20"
                >
                  {form.welcomeScreen.buttonText}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  >
                    <path
                      d="M4 10H16M16 10L11 5M16 10L11 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <p className="mt-4 text-fg-dim text-sm">
                  press{" "}
                  <kbd className="px-2 py-0.5 bg-bg-card rounded border border-border text-xs font-mono">
                    Enter
                  </kbd>
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Questions */}
        {stage === "questions" && currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="h-full flex items-center justify-center px-6"
          >
            <div className="max-w-2xl w-full">
              {/* Question number */}
              <div className="flex items-center gap-2 mb-8">
                <span className="text-accent font-medium">
                  {currentIndex + 1}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-accent">
                  <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-fg-dim text-sm">
                  {currentIndex + 1} of {totalVisible}
                </span>
              </div>

              {/* Question title */}
              <h2 className="text-2xl md:text-3xl font-semibold leading-snug mb-2">
                {currentQuestion.title}
                {currentQuestion.required && (
                  <span className="text-error ml-1">*</span>
                )}
              </h2>

              {/* Description */}
              {currentQuestion.description && (
                <p className="text-fg-muted text-lg mb-8">
                  {currentQuestion.description}
                </p>
              )}

              {/* Question body */}
              <div className={currentQuestion.description ? "" : "mt-8"}>
                <QuestionRenderer
                  question={currentQuestion}
                  value={answers[currentQuestion.id] ?? null}
                  onChange={(val) => setAnswer(currentQuestion.id, val)}
                  onSubmit={handleSubmit}
                  onAutoAdvance={handleAutoAdvance}
                />
              </div>

              {/* Navigation hints */}
              <div className="mt-10 flex items-center gap-4">
                {currentQuestion.type !== "statement" &&
                  currentQuestion.type !== "yes_no" &&
                  currentQuestion.type !== "multiple_choice" && (
                  <button
                    onClick={handleSubmit}
                    disabled={!canAdvance}
                    className={`
                      group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                      text-sm font-medium transition-all duration-200
                      ${
                        canAdvance
                          ? "bg-accent hover:bg-accent-hover text-white hover:scale-[1.02] active:scale-[0.98]"
                          : "bg-fg-dim/20 text-fg-dim cursor-not-allowed"
                      }
                    `}
                  >
                    OK
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                <span className="text-fg-dim text-sm">
                  press{" "}
                  <kbd className="px-1.5 py-0.5 bg-bg-card rounded border border-border text-xs font-mono">
                    Enter
                  </kbd>
                  {" "}{"\u21B5"}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Thank You Screen */}
        {stage === "thankYou" && (
          <motion.div
            key="thankyou"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="h-full flex items-center justify-center px-6"
          >
            <div className="max-w-2xl w-full text-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full
                  bg-success/10 mb-8"
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-success"
                >
                  <motion.path
                    d="M5 13L9 17L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </svg>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold tracking-tight"
              >
                {form.thankYouScreen.title}
              </motion.h1>

              {form.thankYouScreen.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.5 }}
                  className="mt-6 text-lg md:text-xl text-fg-muted leading-relaxed"
                >
                  {form.thankYouScreen.description}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom navigation */}
      {stage === "questions" && (
        <div className="absolute bottom-6 right-6 flex items-center gap-2 z-50">
          <button
            onClick={goPrev}
            disabled={isFirst}
            className={`
              p-2.5 rounded-lg border transition-all duration-200
              ${
                isFirst
                  ? "border-border/50 text-fg-dim/30 cursor-not-allowed"
                  : "border-border text-fg-muted hover:text-fg hover:border-fg-dim hover:bg-bg-card"
              }
            `}
            aria-label="Previous question"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 12L8 4M8 4L4 8M8 4L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canAdvance}
            className={`
              p-2.5 rounded-lg border transition-all duration-200
              ${
                canAdvance
                  ? "border-border text-fg-muted hover:text-fg hover:border-fg-dim hover:bg-bg-card"
                  : "border-border/50 text-fg-dim/30 cursor-not-allowed"
              }
            `}
            aria-label="Next question"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 4L8 12M8 12L12 8M8 12L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
