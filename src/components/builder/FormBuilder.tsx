"use client";

import { useFormBuilder } from "@/hooks/useFormBuilder";
import { QuestionTypeMenu } from "./QuestionTypeMenu";
import { QuestionList } from "./QuestionList";
import {
  QuestionEditor,
  WelcomeScreenEditor,
  ThankYouScreenEditor,
} from "./QuestionEditor";
import { FormView } from "@/components/form/FormView";

export function FormBuilder() {
  const builder = useFormBuilder();
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
  } = builder;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-4">
          <a href="/" className="text-lg font-bold tracking-tight">
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
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {form.questions.length} question{form.questions.length !== 1 ? "s" : ""}
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — question list */}
        <div className="w-80 border-r border-border flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <QuestionTypeMenu onAdd={addQuestion} />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {/* Welcome screen item */}
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

            {/* Thank you screen item */}
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
          <div className="px-4 py-2 border-b border-border flex items-center gap-2">
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
                  Select a question to edit its properties,
                  or click the Welcome/Thank You screens.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
