"use client";

import { useState, useCallback } from "react";
import type { Form } from "@/shared/types/form";
import type { Database } from "@/shared/types/database";
import { ResponsesHeader } from "./ResponsesHeader";
import { StatsStrip } from "./StatsStrip";
import { QuickInsights } from "./QuickInsights";
import { TextSnippets } from "./TextSnippets";
import { ResponsesTable } from "./ResponsesTable";
import { ResponseDetailPanel } from "./ResponseDetailPanel";
import { useResponsesAnalytics } from "../hooks/useResponsesAnalytics";
import { exportCsv } from "../utils/exportCsv";
import { exportXlsx } from "../utils/exportXlsx";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];
type Tab = "insights" | "responses";

interface Props {
  form: Form;
  submissions: Submission[];
}

export function ResponsesClient({ form, submissions: initialSubmissions }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(initialSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("insights");

  const analytics = useResponsesAnalytics(form, submissions);

  const handleDelete = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete submission");
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      if (selectedSubmission?.id === id) setSelectedSubmission(null);
    },
    [selectedSubmission]
  );

  const handleExportCsv = useCallback(() => {
    exportCsv(form, filteredSubmissions);
  }, [form, filteredSubmissions]);

  const handleExportXlsx = useCallback(() => {
    exportXlsx(form, filteredSubmissions);
  }, [form, filteredSubmissions]);

  const hasSubmissions = submissions.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <ResponsesHeader
        form={form}
        onExportCsv={handleExportCsv}
        onExportXlsx={handleExportXlsx}
        hasSubmissions={hasSubmissions}
        filteredCount={filteredSubmissions.length}
        totalCount={submissions.length}
      />

      <main className="px-6 py-8 space-y-6">
        {/* Tab switcher */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit">
          <TabButton active={activeTab === "insights"} onClick={() => setActiveTab("insights")}>
            Insights
          </TabButton>
          <TabButton active={activeTab === "responses"} onClick={() => setActiveTab("responses")}>
            Responses
            {hasSubmissions && (
              <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                {submissions.length}
              </span>
            )}
          </TabButton>
        </div>

        {/* Stats strip — always visible */}
        <StatsStrip
          total={analytics.total}
          completedCount={analytics.completedCount}
          completionRate={analytics.completionRate}
          avgTime={analytics.avgTime}
        />

        {/* Insights tab */}
        {activeTab === "insights" && (
          <div className="space-y-8">
            {hasSubmissions ? (
              <>
                <QuickInsights
                  dropOff={analytics.dropOff}
                  total={analytics.total}
                  completionRate={analytics.completionRate}
                />
                <TextSnippets form={form} submissions={submissions} />
              </>
            ) : (
              <InsightsEmptyState />
            )}
          </div>
        )}

        {/* Responses tab */}
        {activeTab === "responses" && (
          <ResponsesTable
            form={form}
            submissions={submissions}
            onSelect={setSelectedSubmission}
            onDelete={handleDelete}
            onFilteredChange={setFilteredSubmissions}
          />
        )}
      </main>

      <ResponseDetailPanel
        submission={selectedSubmission}
        form={form}
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Insights empty state ─────────────────────────────────────────────────────

function InsightsEmptyState() {
  return (
    <div className="border border-border rounded-xl bg-card text-center py-16">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M3 14l4-4 3 3 4-5 3 3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-foreground font-medium">No data yet</p>
      <p className="text-sm text-muted-foreground mt-1">
        Insights will appear here once you receive responses.
      </p>
    </div>
  );
}
