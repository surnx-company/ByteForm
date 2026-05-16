"use client";

import { useEffect, useRef, useState } from "react";
import type { Choice } from "@/shared/types/form";
import { EditableText } from "@/features/builder/components/EditableText";

interface Props {
  choices: Choice[];
  value: string[]; // ordered array of choice values, most important first
  onChange: (value: string[]) => void;
  onSubmit: () => void;
  onEditChoiceLabel?: (choiceId: string, label: string) => void;
}

export function Ranking({ choices, value, onChange, onEditChoiceLabel }: Props) {
  // Build the ordered list from value.
  // Falls back to choices default order if values don't fully resolve
  // (handles: first render, items added/removed, label edits that change slugs).
  const orderedChoices = (() => {
    if (value.length === choices.length) {
      const resolved = value
        .map((v) => choices.find((c) => c.value === v))
        .filter((c): c is Choice => Boolean(c));
      if (resolved.length === choices.length) return resolved;
    }
    return choices;
  })();

  // Re-sync value whenever choices change (add, remove, or label/slug edits).
  // We use a ref to track the previous key so the effect has a stable deps array.
  const prevChoicesKeyRef = useRef("");
  const choicesKey = choices.map((c) => c.value).join("|");
  useEffect(() => {
    if (choicesKey === prevChoicesKeyRef.current) return;
    prevChoicesKeyRef.current = choicesKey;
    if (choices.length === 0) return;
    const allPresent =
      value.length === choices.length &&
      value.every((v) => choices.some((c) => c.value === v));
    if (!allPresent) {
      onChange(choices.map((c) => c.value));
    }
  });

  // ── Drag state ─────────────────────────────────────────────────────────────
  const dragIndexRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...orderedChoices];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next.map((c) => c.value));
  }

  function moveUp(i: number) {
    if (i === 0) return;
    reorder(i, i - 1);
  }

  function moveDown(i: number) {
    if (i === orderedChoices.length - 1) return;
    reorder(i, i + 1);
  }

  return (
    <div className="space-y-2 w-full">
      {/* Helper text */}
      <p className="text-xs text-fg-muted mb-3 select-none">
        Drag to reorder, or use the arrows — 1 is most important.
      </p>

      {orderedChoices.map((choice, i) => (
        <div
          key={choice.id}
          draggable
          onDragStart={() => {
            dragIndexRef.current = i;
            setDragging(i);
          }}
          onDragEnd={() => {
            if (dragOver !== null && dragIndexRef.current !== null) {
              reorder(dragIndexRef.current, dragOver);
            }
            dragIndexRef.current = null;
            setDragging(null);
            setDragOver(null);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(i);
          }}
          onDragLeave={() => setDragOver(null)}
          className={`
            flex items-center gap-3 px-4 py-3.5 rounded-xl border
            transition-all duration-150 select-none cursor-grab active:cursor-grabbing
            ${dragging === i
              ? "opacity-40 scale-[0.98] border-accent bg-accent/5"
              : dragOver === i
                ? "border-accent bg-accent/5 shadow-sm"
                : "border-border bg-bg-card/60 hover:border-fg-dim hover:bg-bg-card"
            }
          `}
        >
          {/* Position badge */}
          <span
            className={`
              flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
              text-xs font-semibold transition-colors duration-150
              ${dragOver === i
                ? "bg-accent text-white"
                : "bg-accent/10 text-accent"
              }
            `}
          >
            {i + 1}
          </span>

          {/* Drag handle — hidden on mobile */}
          <span className="hidden sm:flex flex-col gap-[3px] flex-shrink-0 opacity-30">
            {[0, 1, 2].map((r) => (
              <span key={r} className="flex gap-[3px]">
                {[0, 1].map((c) => (
                  <span key={c} className="w-[3px] h-[3px] rounded-full bg-fg" />
                ))}
              </span>
            ))}
          </span>

          {/* Label */}
          {onEditChoiceLabel ? (
            <EditableText
              value={choice.label}
              onCommit={(label) => onEditChoiceLabel(choice.id, label)}
              placeholder={`Item ${i + 1}`}
              ariaLabel={`Item ${i + 1} label`}
              className="flex-1 text-fg text-base leading-snug px-1 -mx-1"
            />
          ) : (
            <span className="flex-1 text-fg text-base leading-snug">{choice.label}</span>
          )}

          {/* Up / Down buttons — always visible, bigger on mobile */}
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => moveUp(i)}
              disabled={i === 0}
              aria-label={`Move ${choice.label} up`}
              className={`
                p-1 rounded transition-colors
                ${i === 0
                  ? "text-fg-dim/30 cursor-not-allowed"
                  : "text-fg-muted hover:text-accent hover:bg-accent/8"
                }
              `}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 9L7 5L11 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => moveDown(i)}
              disabled={i === orderedChoices.length - 1}
              aria-label={`Move ${choice.label} down`}
              className={`
                p-1 rounded transition-colors
                ${i === orderedChoices.length - 1
                  ? "text-fg-dim/30 cursor-not-allowed"
                  : "text-fg-muted hover:text-accent hover:bg-accent/8"
                }
              `}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
