"use client";

import { useLayoutEffect, useRef, useCallback } from "react";

interface Props {
  value: string;
  onCommit: (next: string) => void;
  placeholder?: string;
  className?: string;
  /**
   * When true, Shift+Enter and Cmd/Ctrl+Enter insert a newline; plain Enter commits.
   * When false (default), any Enter commits.
   */
  multiline?: boolean;
  ariaLabel?: string;
}

/**
 * Inline contentEditable text input.
 *
 * Behavior:
 *   • Enter commits (Shift/Cmd+Enter inserts a newline when multiline).
 *   • Escape cancels (restores the last-committed value).
 *   • Blur commits, but only when content actually changed — silent on no-op.
 *
 * The DOM is reconciled by hand (not by React's children) so external prop
 * updates never clobber the caret while the user is typing.
 */
export function EditableText({
  value,
  onCommit,
  placeholder,
  className,
  multiline = false,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  // Reconcile external value into the DOM. Skip when this element holds focus
  // so we never clobber an in-progress edit. useLayoutEffect avoids a paint
  // with stale content on initial mount.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (document.activeElement === node) return;
    if (node.textContent !== value) node.textContent = value;
  }, [value]);

  const handleBlur = useCallback(() => {
    const next = ref.current?.textContent ?? "";
    if (next !== value) onCommit(next);
  }, [value, onCommit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (e.key === "Enter") {
        const insertsNewline = multiline && (e.shiftKey || e.metaKey || e.ctrlKey);
        if (!insertsNewline) {
          e.preventDefault();
          ref.current?.blur();
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (ref.current) ref.current.textContent = value;
        ref.current?.blur();
      }
    },
    [multiline, value],
  );

  // Keep clicks/mousedown inside the editable from triggering parent button
  // handlers (e.g., selecting a choice) or starting a drag (Ranking items).
  const stopPropagation = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <span
      ref={ref}
      aria-label={ariaLabel}
      aria-placeholder={placeholder}
      data-placeholder={placeholder}
      data-empty={value.length === 0 ? "true" : undefined}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      className={`editable-text outline-none rounded-sm focus:bg-accent/5 transition-colors ${className ?? ""}`}
    />
  );
}
