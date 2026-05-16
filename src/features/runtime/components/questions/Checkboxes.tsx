"use client";

import { useEffect, useCallback } from "react";
import type { Choice } from "@/shared/types/form";
import { EditableText } from "@/features/builder/components/EditableText";

interface Props {
  choices: Choice[];
  value: string[];
  onChange: (value: string[]) => void;
  onSubmit: () => void;
  onEditChoiceLabel?: (choiceId: string, label: string) => void;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function Checkboxes({ choices, value, onChange, onSubmit, onEditChoiceLabel }: Props) {
  const toggle = useCallback(
    (val: string) => {
      onChange(
        value.includes(val)
          ? value.filter((v) => v !== val)
          : [...value, val]
      );
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      const idx = LETTERS.indexOf(e.key.toUpperCase());
      if (idx >= 0 && idx < choices.length) {
        toggle(choices[idx].value);
      }
    },
    [choices, toggle]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div>
      <div className="space-y-3">
        {choices.map((choice, i) => {
          const selected = value.includes(choice.value);
          return (
            <button
              key={choice.id}
              onClick={onEditChoiceLabel ? undefined : () => toggle(choice.value)}
              className={`
                group w-full flex items-center gap-4 px-5 py-4 rounded-lg
                border text-left transition-all duration-200
                ${
                  selected
                    ? "border-accent bg-accent-glow text-fg"
                    : "border-border bg-bg-card/50 text-fg hover:border-fg-dim hover:bg-bg-card"
                }
              `}
            >
              <span
                className={`
                  flex-shrink-0 w-8 h-8 rounded flex items-center justify-center
                  text-sm font-medium transition-all duration-200
                  ${
                    selected
                      ? "bg-accent text-white"
                      : "bg-bg-card border border-border group-hover:border-fg-dim"
                  }
                `}
              >
                {selected ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8L6.5 11.5L13 4.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  LETTERS[i]
                )}
              </span>
              {onEditChoiceLabel ? (
                <EditableText
                  value={choice.label}
                  onCommit={(label) => onEditChoiceLabel(choice.id, label)}
                  placeholder={`Option ${i + 1}`}
                  ariaLabel={`Option ${i + 1} label`}
                  className="text-lg flex-1 px-1 -mx-1"
                />
              ) : (
                <span className="text-lg">{choice.label}</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-fg-dim text-sm mt-4">
        Choose as many as you like, then press{" "}
        <kbd className="px-1.5 py-0.5 bg-bg-card rounded text-xs border border-border">Enter</kbd>
      </p>
    </div>
  );
}
