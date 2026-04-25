"use client";

import { useState } from "react";
import type { QuestionType } from "@/types/form";
import { QUESTION_TYPES } from "@/lib/question-types";

interface Props {
  onAdd: (type: QuestionType) => void;
}

export function QuestionTypeMenu({ onAdd }: Props) {
  const [open, setOpen] = useState(false);

  const categories = [
    { key: "text", label: "Text" },
    { key: "choice", label: "Choice" },
    { key: "rating", label: "Rating" },
    { key: "other", label: "Other" },
  ] as const;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white
          text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Add question
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 rounded-lg border border-border
            bg-card shadow-xl z-50 overflow-hidden">
            {categories.map((cat) => {
              const types = QUESTION_TYPES.filter((t) => t.category === cat.key);
              return (
                <div key={cat.key}>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {cat.label}
                  </div>
                  {types.map((t) => (
                    <button
                      key={t.type}
                      onClick={() => {
                        onAdd(t.type);
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground
                        hover:bg-secondary transition-colors text-left"
                    >
                      <span className="w-6 h-6 rounded bg-secondary flex items-center justify-center
                        text-xs font-medium text-muted-foreground">
                        {t.icon}
                      </span>
                      {t.label}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
