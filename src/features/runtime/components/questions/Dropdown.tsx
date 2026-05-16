"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Choice } from "@/shared/types/form";
import { EditableText } from "@/features/builder/components/EditableText";

interface Props {
  choices: Choice[];
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  onEditChoiceLabel?: (choiceId: string, label: string) => void;
}

export function Dropdown({ choices, value, onChange, onSubmit, placeholder, onEditChoiceLabel }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = choices.find((c) => c.value === value)?.label;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !isOpen && value) {
        e.preventDefault();
        onSubmit();
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightIndex(choices.findIndex((c) => c.value === value));
        } else if (highlightIndex >= 0) {
          onChange(choices[highlightIndex].value);
          setIsOpen(false);
        }
        return;
      }

      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightIndex((i) => Math.min(i + 1, choices.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightIndex((i) => Math.max(i - 1, 0));
        }
      }
    },
    [isOpen, value, highlightIndex, choices, onChange, onSubmit]
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-md" onKeyDown={handleKeyDown}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-5 py-4 rounded-lg
          border text-left text-xl transition-all duration-200
          ${isOpen ? "border-accent bg-bg-card" : "border-border bg-bg-card/50 hover:border-fg-dim"}
        `}
      >
        <span className={selectedLabel ? "text-fg" : "text-fg-dim/50"}>
          {selectedLabel || placeholder || "Select an option..."}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 rounded-lg border border-border bg-bg-card
          shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {choices.map((choice, i) => (
            <button
              key={choice.id}
              onClick={
                onEditChoiceLabel
                  ? undefined
                  : () => {
                      onChange(choice.value);
                      setIsOpen(false);
                    }
              }
              className={`
                w-full px-5 py-3 text-left text-lg transition-colors duration-100
                ${choice.value === value ? "text-accent bg-accent-glow" : "text-fg"}
                ${highlightIndex === i ? "bg-border/50" : "hover:bg-border/30"}
              `}
            >
              {onEditChoiceLabel ? (
                <EditableText
                  value={choice.label}
                  onCommit={(label) => onEditChoiceLabel(choice.id, label)}
                  placeholder={`Option ${i + 1}`}
                  ariaLabel={`Option ${i + 1} label`}
                  className="block px-1 -mx-1"
                />
              ) : (
                choice.label
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
