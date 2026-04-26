"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Question } from "@/types/form";
import { getTypeInfo } from "@/lib/question-types";

interface Props {
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const W = "#6B1A2A";
const B = "#1C1410";
const M = "#7A6A60";
const WA = (a: number) => `rgba(107,26,42,${a})`;

export function SortableQuestionItem({
  question,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isSelected ? WA(0.07) : "transparent",
    border: `0.5px solid ${isSelected ? WA(0.2) : "transparent"}`,
    color: B,
  };

  const typeInfo = getTypeInfo(question.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className="group flex items-start gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        style={{
          marginTop: 2, padding: 2, borderRadius: 4,
          color: M, background: "transparent", border: "none",
          cursor: "grab", touchAction: "none",
        }}
        aria-label="Drag to reorder"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <circle cx="4" cy="3" r="1" fill="currentColor" />
          <circle cx="10" cy="3" r="1" fill="currentColor" />
          <circle cx="4" cy="7" r="1" fill="currentColor" />
          <circle cx="10" cy="7" r="1" fill="currentColor" />
          <circle cx="4" cy="11" r="1" fill="currentColor" />
          <circle cx="10" cy="11" r="1" fill="currentColor" />
        </svg>
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 11, color: M, fontWeight: 500 }}>{index + 1}</span>
          <span style={{
            width: 16, height: 16, borderRadius: 4, flexShrink: 0,
            background: WA(0.06), border: `0.5px solid ${WA(0.12)}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, color: M,
          }}>
            {typeInfo.icon}
          </span>
          <span style={{ fontSize: 11, color: M }}>{typeInfo.label}</span>
          {question.required && (
            <span style={{ fontSize: 10, color: W, fontWeight: 500 }}>Required</span>
          )}
        </div>
        <p style={{
          fontSize: 13, color: B, margin: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {question.title || "Untitled question"}
        </p>
      </div>

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100"
        style={{ display: "flex", alignItems: "center", gap: 2, transition: "opacity 0.15s" }}>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          style={{
            padding: 4, borderRadius: 4, color: M,
            background: "transparent", border: "none", cursor: "pointer",
          }}
          title="Duplicate"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M10 4V2.5C10 1.67 9.33 1 8.5 1H2.5C1.67 1 1 1.67 1 2.5V8.5C1 9.33 1.67 10 2.5 10H4" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            padding: 4, borderRadius: 4, color: M,
            background: "transparent", border: "none", cursor: "pointer",
          }}
          title="Delete"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M2 4H12M5 4V2.5C5 2.22 5.22 2 5.5 2H8.5C8.78 2 9 2.22 9 2.5V4M10.5 4V11.5C10.5 12.05 10.05 12.5 9.5 12.5H4.5C3.95 12.5 3.5 12.05 3.5 11.5V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
