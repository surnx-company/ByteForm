"use client";

import Link from "next/link";
import { UserMenu } from "@/shared/components/UserMenu";
import type { Form } from "@/shared/types/form";

interface Props {
  form: Form;
  onExportCsv: () => void;
  hasSubmissions: boolean;
}

export function ResponsesHeader({ form, onExportCsv, hasSubmissions }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: logo + breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.svg" alt="ByteForm" className="h-7 w-7" />
            <span className="font-serif text-[17px] tracking-tight hidden sm:block">
              Byte<span className="text-accent">Form</span>
            </span>
          </Link>

          <span className="text-muted-foreground text-base shrink-0 select-none">›</span>

          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            Dashboard
          </Link>

          <span className="text-muted-foreground text-base shrink-0 select-none">›</span>

          <span className="text-sm font-medium text-foreground truncate">{form.title}</span>
        </div>

        {/* Right: actions + user */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/builder/${form.id}`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
              text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M9.5 2L12 4.5L4.5 12H2V9.5L9.5 2Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Edit form
          </Link>

          <button
            onClick={onExportCsv}
            disabled={!hasSubmissions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border
              text-sm text-muted-foreground hover:text-foreground hover:bg-secondary
              transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M12 8.5V11C12 11.55 11.55 12 11 12H3C2.45 12 2 11.55 2 11V8.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M7 2V8.5M7 8.5L4.5 6M7 8.5L9.5 6"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Export CSV
          </button>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
