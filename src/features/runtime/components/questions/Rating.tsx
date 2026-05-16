"use client";

import { useEffect, useCallback } from "react";
import { EditableText } from "@/features/builder/components/EditableText";

export const RATING_DEFAULT_LOW_LABEL = "Not likely";
export const RATING_DEFAULT_HIGH_LABEL = "Very likely";

interface Props {
  value: number | null;
  onChange: (value: number) => void;
  onSubmit: () => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
  onEditLowLabel?: (label: string) => void;
  onEditHighLabel?: (label: string) => void;
}

export function Rating({
  value,
  onChange,
  onSubmit,
  min = 0,
  max = 10,
  lowLabel,
  highLabel,
  onEditLowLabel,
  onEditHighLabel,
}: Props) {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const editable = Boolean(onEditLowLabel || onEditHighLabel);
  const resolvedLow = lowLabel ?? RATING_DEFAULT_LOW_LABEL;
  const resolvedHigh = highLabel ?? RATING_DEFAULT_HIGH_LABEL;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= min && num <= max) {
        onChange(num);
      }
    },
    [min, max, onChange]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div>
      <div className="flex gap-1 sm:gap-2">
        {numbers.map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              onClick={
                editable
                  ? undefined
                  : () => {
                      onChange(n);
                      setTimeout(onSubmit, 300);
                    }
              }
              className={`
                flex-1 py-3 sm:py-4 rounded-lg border text-base sm:text-lg
                font-medium transition-all duration-200
                ${
                  selected
                    ? "border-accent bg-accent text-white scale-110"
                    : value !== null && n <= value
                    ? "border-accent/50 bg-accent-glow text-fg"
                    : "border-border bg-bg-card/50 text-fg-muted hover:border-fg-dim hover:text-fg"
                }
              `}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between mt-3 text-sm text-fg-dim">
        {onEditLowLabel ? (
          <EditableText
            value={resolvedLow}
            onCommit={(label) =>
              onEditLowLabel(label.trim() === "" ? RATING_DEFAULT_LOW_LABEL : label)
            }
            placeholder={RATING_DEFAULT_LOW_LABEL}
            ariaLabel="Low end label"
            className="px-1 -mx-1"
          />
        ) : (
          <span>{resolvedLow}</span>
        )}
        {onEditHighLabel ? (
          <EditableText
            value={resolvedHigh}
            onCommit={(label) =>
              onEditHighLabel(label.trim() === "" ? RATING_DEFAULT_HIGH_LABEL : label)
            }
            placeholder={RATING_DEFAULT_HIGH_LABEL}
            ariaLabel="High end label"
            className="px-1 -mx-1"
          />
        ) : (
          <span>{resolvedHigh}</span>
        )}
      </div>
    </div>
  );
}
