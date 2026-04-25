"use client";

import { v4 as uuid } from "uuid";
import type { Question, QuestionType, WelcomeScreen, ThankYouScreen } from "@/types/form";
import { QUESTION_TYPES } from "@/lib/question-types";

interface QuestionEditorProps {
  question: Question;
  allQuestions: Question[];
  onUpdate: (id: string, updates: Partial<Question>) => void;
}

interface WelcomeEditorProps {
  screen: WelcomeScreen;
  onUpdate: (updates: Partial<WelcomeScreen>) => void;
}

interface ThankYouEditorProps {
  screen: ThankYouScreen;
  onUpdate: (updates: Partial<ThankYouScreen>) => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{children}</label>;
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm
        text-foreground placeholder:text-muted-foreground focus:border-ring
        focus:ring-1 focus:ring-ring transition-colors"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm
        text-foreground placeholder:text-muted-foreground focus:border-ring
        focus:ring-1 focus:ring-ring transition-colors resize-none"
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative w-9 h-5 rounded-full transition-colors duration-200
          ${checked ? "bg-accent" : "bg-input"}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white
            transition-transform duration-200
            ${checked ? "translate-x-4" : "translate-x-0"}
          `}
        />
      </button>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}

function ChoicesEditor({
  choices,
  onChange,
}: {
  choices: Question["choices"];
  onChange: (choices: Question["choices"]) => void;
}) {
  if (!choices) return null;

  return (
    <div>
      <FieldLabel>Choices</FieldLabel>
      <div className="space-y-2">
        {choices.map((choice, i) => (
          <div key={choice.id} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-5 text-center">{i + 1}</span>
            <input
              type="text"
              value={choice.label}
              onChange={(e) => {
                const newChoices = [...choices];
                newChoices[i] = {
                  ...choice,
                  label: e.target.value,
                  value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                };
                onChange(newChoices);
              }}
              className="flex-1 px-3 py-1.5 rounded-md border border-input bg-background text-sm
                text-foreground focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
            />
            <button
              onClick={() => onChange(choices.filter((c) => c.id !== choice.id))}
              disabled={choices.length <= 1}
              className="p-1 rounded text-muted-foreground hover:text-destructive
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() =>
          onChange([
            ...choices,
            {
              id: uuid(),
              label: `Option ${choices.length + 1}`,
              value: `option_${choices.length + 1}`,
            },
          ])
        }
        className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        + Add choice
      </button>
    </div>
  );
}

function ConditionalLogicEditor({
  question,
  allQuestions,
  onUpdate,
}: {
  question: Question;
  allQuestions: Question[];
  onUpdate: (id: string, updates: Partial<Question>) => void;
}) {
  const logic = question.conditionalLogic;
  const availableQuestions = allQuestions.filter(
    (q) => q.id !== question.id && ["multiple_choice", "yes_no", "dropdown", "short_text", "number", "rating"].includes(q.type)
  );

  if (availableQuestions.length === 0) return null;

  return (
    <div>
      <FieldLabel>Conditional Logic</FieldLabel>
      <Toggle
        checked={!!logic}
        onChange={(enabled) => {
          if (enabled) {
            onUpdate(question.id, {
              conditionalLogic: {
                questionId: availableQuestions[0].id,
                operator: "equals",
                value: "",
              },
            });
          } else {
            onUpdate(question.id, { conditionalLogic: undefined });
          }
        }}
        label="Show only if..."
      />
      {logic && (
        <div className="mt-3 space-y-2 pl-12">
          <select
            value={logic.questionId}
            onChange={(e) =>
              onUpdate(question.id, {
                conditionalLogic: { ...logic, questionId: e.target.value },
              })
            }
            className="w-full px-3 py-1.5 rounded-md border border-input bg-background text-sm
              text-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          >
            {availableQuestions.map((q, i) => (
              <option key={q.id} value={q.id}>
                Q{allQuestions.indexOf(q) + 1}: {q.title || "Untitled"}
              </option>
            ))}
          </select>
          <select
            value={logic.operator}
            onChange={(e) =>
              onUpdate(question.id, {
                conditionalLogic: { ...logic, operator: e.target.value as typeof logic.operator },
              })
            }
            className="w-full px-3 py-1.5 rounded-md border border-input bg-background text-sm
              text-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          >
            <option value="equals">equals</option>
            <option value="not_equals">does not equal</option>
            <option value="contains">contains</option>
            <option value="greater_than">greater than</option>
            <option value="less_than">less than</option>
          </select>
          <TextInput
            value={logic.value}
            onChange={(value) =>
              onUpdate(question.id, {
                conditionalLogic: { ...logic, value },
              })
            }
            placeholder="Value..."
          />
        </div>
      )}
    </div>
  );
}

export function QuestionEditor({ question, allQuestions, onUpdate }: QuestionEditorProps) {
  const hasChoices = ["multiple_choice", "checkboxes", "dropdown"].includes(question.type);

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Type</FieldLabel>
        <select
          value={question.type}
          onChange={(e) => {
            const newType = e.target.value as QuestionType;
            const updates: Partial<Question> = { type: newType };
            if (["multiple_choice", "checkboxes", "dropdown"].includes(newType) && !question.choices) {
              updates.choices = [
                { id: uuid(), label: "Option 1", value: "option_1" },
                { id: uuid(), label: "Option 2", value: "option_2" },
              ];
            }
            if (newType === "rating") {
              updates.min = question.min ?? 0;
              updates.max = question.max ?? 10;
            }
            if (newType === "star_rating") {
              updates.max = question.max ?? 5;
            }
            onUpdate(question.id, updates);
          }}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm
            text-foreground focus:border-ring focus:ring-1 focus:ring-ring"
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.type} value={t.type}>
              {t.icon} {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel>Question</FieldLabel>
        <TextArea
          value={question.title}
          onChange={(title) => onUpdate(question.id, { title })}
          placeholder="Your question..."
          rows={2}
        />
      </div>

      <div>
        <FieldLabel>Description (optional)</FieldLabel>
        <TextArea
          value={question.description ?? ""}
          onChange={(description) => onUpdate(question.id, { description: description || undefined })}
          placeholder="Add more context..."
          rows={2}
        />
      </div>

      {question.type !== "statement" && question.type !== "yes_no" && (
        <div>
          <FieldLabel>Placeholder (optional)</FieldLabel>
          <TextInput
            value={question.placeholder ?? ""}
            onChange={(placeholder) => onUpdate(question.id, { placeholder: placeholder || undefined })}
            placeholder="Placeholder text..."
          />
        </div>
      )}

      {hasChoices && (
        <ChoicesEditor
          choices={question.choices}
          onChange={(choices) => onUpdate(question.id, { choices })}
        />
      )}

      {question.type === "rating" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Min</FieldLabel>
            <input
              type="number"
              value={question.min ?? 0}
              onChange={(e) => onUpdate(question.id, { min: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm
                text-foreground focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <FieldLabel>Max</FieldLabel>
            <input
              type="number"
              value={question.max ?? 10}
              onChange={(e) => onUpdate(question.id, { max: parseInt(e.target.value) || 10 })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm
                text-foreground focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      )}

      {question.type === "star_rating" && (
        <div>
          <FieldLabel>Number of stars</FieldLabel>
          <input
            type="number"
            value={question.max ?? 5}
            min={3}
            max={10}
            onChange={(e) => onUpdate(question.id, { max: parseInt(e.target.value) || 5 })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm
              text-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>
      )}

      <Toggle
        checked={question.required}
        onChange={(required) => onUpdate(question.id, { required })}
        label="Required"
      />

      <ConditionalLogicEditor
        question={question}
        allQuestions={allQuestions}
        onUpdate={onUpdate}
      />
    </div>
  );
}

export function WelcomeScreenEditor({ screen, onUpdate }: WelcomeEditorProps) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Title</FieldLabel>
        <TextArea
          value={screen.title}
          onChange={(title) => onUpdate({ title })}
          placeholder="Welcome title..."
          rows={2}
        />
      </div>
      <div>
        <FieldLabel>Description</FieldLabel>
        <TextArea
          value={screen.description ?? ""}
          onChange={(description) => onUpdate({ description: description || undefined })}
          placeholder="Add a description..."
        />
      </div>
      <div>
        <FieldLabel>Button text</FieldLabel>
        <TextInput
          value={screen.buttonText}
          onChange={(buttonText) => onUpdate({ buttonText })}
          placeholder="Start"
        />
      </div>
    </div>
  );
}

export function ThankYouScreenEditor({ screen, onUpdate }: ThankYouEditorProps) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Title</FieldLabel>
        <TextArea
          value={screen.title}
          onChange={(title) => onUpdate({ title })}
          placeholder="Thank you title..."
          rows={2}
        />
      </div>
      <div>
        <FieldLabel>Description</FieldLabel>
        <TextArea
          value={screen.description ?? ""}
          onChange={(description) => onUpdate({ description: description || undefined })}
          placeholder="Add a description..."
        />
      </div>
    </div>
  );
}
