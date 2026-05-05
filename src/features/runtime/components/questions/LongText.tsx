"use client";

import { useRef, useEffect } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit: () => void;
}

export function LongText({ value, onChange, placeholder, onSubmit }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [value]);

  return (
    <div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder || "Type your answer here..."}
        rows={3}
        className="w-full bg-transparent border-b-2 border-fg-dim focus:border-accent
          text-xl md:text-2xl font-light py-3 outline-none transition-colors
          duration-200 placeholder:text-fg-dim/50 caret-accent resize-none
          overflow-hidden"
      />
      <p className="text-fg-dim text-sm mt-2">
        <kbd className="px-1.5 py-0.5 bg-bg-card rounded text-xs border border-border">Shift</kbd>
        {" + "}
        <kbd className="px-1.5 py-0.5 bg-bg-card rounded text-xs border border-border">Enter</kbd>
        {" for new line"}
      </p>
    </div>
  );
}
