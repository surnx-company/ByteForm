"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useFormBuilder } from "@/hooks/useFormBuilder";
import { QuestionTypeMenu } from "@/components/builder/QuestionTypeMenu";
import { QuestionList } from "@/components/builder/QuestionList";
import {
  QuestionEditor,
  WelcomeScreenEditor,
  ThankYouScreenEditor,
} from "@/components/builder/QuestionEditor";
import { FormView } from "@/components/form/FormView";
import type { Form } from "@/types/form";

interface Props {
  initialForm: Form;
}

export function SaveableFormBuilder({ initialForm }: Props) {
  const builder = useFormBuilder(initialForm);
  const {
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
  } = builder;

  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [saving, setSaving] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);

  const saveForm = useCallback(async () => {
    setSaving(true);
    try {
      await fetch(`/api/forms/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          welcomeScreen: form.welcomeScreen,
          thankYouScreen: form.thankYouScreen,
          questions: form.questions,
          isPublished: form.isPublished,
        }),
      });
    } catch {
      // Silent fail for auto-save
    } finally {
      setSaving(false);
    }
  }, [form]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(saveForm, 1500);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [form.title, form.welcomeScreen, form.thankYouScreen, form.questions, saveForm]);

  const togglePublish = useCallback(async () => {
    const next = !form.isPublished;
    setPublished(next);
    setPublishBusy(true);
    try {
      await fetch(`/api/forms/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          welcomeScreen: form.welcomeScreen,
          thankYouScreen: form.thankYouScreen,
          questions: form.questions,
          isPublished: next,
        }),
      });
    } catch {
      setPublished(!next);
    } finally {
      setPublishBusy(false);
    }
  }, [form, setPublished]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-lg font-bold tracking-tight">
            byte<span className="text-[#4f46e5]">form</span>
          </a>
          <div className="h-5 w-px bg-border" />
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateFormTitle(e.target.value)}
            className="bg-transparent text-sm font-medium text-foreground border-none
              focus:ring-0 px-0 py-0 w-48"
            placeholder="Form title..."
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            {saving ? "Saving..." : "Auto-saved"}
          </span>
          <span
            className={`flex items-center gap-1.5 text-xs font-medium ${
              form.isPublished ? "text-emerald-500" : "text-muted-foreground"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                form.isPublished ? "bg-emerald-500" : "bg-muted-foreground"
              }`}
            />
            {form.isPublished ? "Published" : "Draft"}
          </span>
          {form.isPublished && (
            <a
              href={`/f/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border
                text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              View live
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M9 3L3 9M9 3H5M9 3V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
          <a
            href={`/dashboard/${form.id}/responses`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border
              text-xs font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Responses
          </a>
          <button
            type="button"
            onClick={togglePublish}
            disabled={publishBusy}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
              transition-colors disabled:opacity-60 disabled:cursor-not-allowed
              ${
                form.isPublished
                  ? "border border-border text-foreground hover:bg-secondary"
                  : "bg-[#4f46e5] hover:bg-[#6366f1] text-white"
              }`}
          >
            {publishBusy
              ? form.isPublished
                ? "Publishing..."
                : "Unpublishing..."
              : form.isPublished
              ? "Unpublish"
              : "Publish"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — question list */}
        <div className="w-80 border-r border-border flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-border">
            <QuestionTypeMenu onAdd={addQuestion} />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <button
              onClick={() => {
                setEditingScreen("welcome");
                setSelectedId(null);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left mb-1
                transition-colors border text-sm
                ${editingScreen === "welcome"
                  ? "border-ring bg-secondary"
                  : "border-transparent hover:bg-secondary/50"
                }
              `}
            >
              <span className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-[10px]">
                {"\uD83D\uDC4B"}
              </span>
              <span className="text-foreground">Welcome Screen</span>
            </button>

            <QuestionList
              questions={form.questions}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                setEditingScreen(null);
              }}
              onDelete={deleteQuestion}
              onDuplicate={duplicateQuestion}
              onReorder={reorderQuestions}
            />

            <button
              onClick={() => {
                setEditingScreen("thankyou");
                setSelectedId(null);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left mt-1
                transition-colors border text-sm
                ${editingScreen === "thankyou"
                  ? "border-ring bg-secondary"
                  : "border-transparent hover:bg-secondary/50"
                }
              `}
            >
              <span className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-[10px]">
                {"\u2705"}
              </span>
              <span className="text-foreground">Thank You Screen</span>
            </button>
          </div>
        </div>

        {/* Center panel — live preview */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-2 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Live Preview
            </span>
          </div>
          <div className="flex-1 relative bg-bg overflow-hidden">
            <div className="absolute inset-0">
              <FormView form={form} key={JSON.stringify(form)} />
            </div>
          </div>
        </div>

        {/* Right panel — editor */}
        <div className="w-80 border-l border-border flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              {editingScreen === "welcome"
                ? "Welcome Screen"
                : editingScreen === "thankyou"
                ? "Thank You Screen"
                : selectedQuestion
                ? "Edit Question"
                : "Properties"}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {editingScreen === "welcome" && (
              <WelcomeScreenEditor
                screen={form.welcomeScreen}
                onUpdate={updateWelcomeScreen}
              />
            )}
            {editingScreen === "thankyou" && (
              <ThankYouScreenEditor
                screen={form.thankYouScreen}
                onUpdate={updateThankYouScreen}
              />
            )}
            {selectedQuestion && !editingScreen && (
              <QuestionEditor
                question={selectedQuestion}
                allQuestions={form.questions}
                onUpdate={updateQuestion}
              />
            )}
            {!selectedQuestion && !editingScreen && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  Select a question to edit its properties.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
