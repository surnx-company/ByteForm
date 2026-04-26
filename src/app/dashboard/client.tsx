"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type FormRow = Database["public"]["Tables"]["forms"]["Row"];

interface Props {
  forms: FormRow[];
  userEmail: string;
}

export function DashboardClient({ forms: initialForms, userEmail }: Props) {
  const [forms, setForms] = useState(initialForms);
  const router = useRouter();
  const supabase = createClient();

  async function handleCreateForm() {
    const slug = `form-${Date.now().toString(36)}`;
    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Form", slug }),
    });
    if (res.ok) {
      const form = await res.json();
      router.push(`/builder/${form.id}`);
    }
  }

  async function handleDeleteForm(id: string) {
    const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });
    if (res.ok) {
      setForms((prev) => prev.filter((f) => f.id !== id));
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">
            byte<span className="text-[#4f46e5]">form</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Your forms</h1>
          <button
            onClick={handleCreateForm}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4f46e5]
              hover:bg-[#6366f1] text-white text-sm font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New form
          </button>
        </div>

        {forms.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center
              mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M9 15H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">No forms yet</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Create your first form and start collecting responses.
            </p>
            <button
              onClick={handleCreateForm}
              className="px-6 py-3 rounded-lg bg-[#4f46e5] hover:bg-[#6366f1]
                text-white text-sm font-medium transition-colors"
            >
              Create your first form
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <div
                key={form.id}
                className="group border border-border rounded-lg p-5 bg-card
                  hover:border-[#4f46e5]/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/builder/${form.id}`)}
              >
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {form.title}
                    </h3>
                    <span
                      className={`flex-shrink-0 inline-flex items-center px-1.5 py-0.5
                        rounded text-[10px] font-medium uppercase tracking-wider
                        ${
                          form.is_published
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-secondary text-muted-foreground"
                        }`}
                    >
                      {form.is_published ? "Live" : "Draft"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteForm(form.id);
                    }}
                    className="p-1 rounded text-muted-foreground hover:text-destructive
                      opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 4H12M5 4V2.5C5 2.22 5.22 2 5.5 2H8.5C8.78 2 9 2.22 9 2.5V4M10.5 4V11.5C10.5 12.05 10.05 12.5 9.5 12.5H4.5C3.95 12.5 3.5 12.05 3.5 11.5V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{(form.questions as unknown[]).length} questions</span>
                  <span>{"·"}</span>
                  <span>/{form.slug}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {form.is_published && (
                    <>
                      <a
                        href={`/f/${form.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-[#4f46e5] hover:underline"
                      >
                        View form
                      </a>
                      <span className="text-muted-foreground">{"·"}</span>
                    </>
                  )}
                  <a
                    href={`/dashboard/${form.id}/responses`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-[#4f46e5] hover:underline"
                  >
                    Responses
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
