"use client";

import { useState, useCallback } from "react";
import type { Form } from "@/shared/types/form";
import type { Database } from "@/shared/types/database";
import { ResponsesHeader } from "./ResponsesHeader";
import { StatsStrip } from "./StatsStrip";
import { DropOffChart } from "./DropOffChart";
import { AnswerSummaries } from "./AnswerSummaries";
import { ResponsesTable } from "./ResponsesTable";
import { ResponseDetailPanel } from "./ResponseDetailPanel";
import { useResponsesAnalytics } from "../hooks/useResponsesAnalytics";
import { exportCsv } from "../utils/exportCsv";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];

interface Props {
  form: Form;
  submissions: Submission[];
}

export function ResponsesClient({ form, submissions: initialSubmissions }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

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
    exportCsv(form, submissions);
  }, [form, submissions]);

  const hasSubmissions = submissions.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <ResponsesHeader
        form={form}
        onExportCsv={handleExportCsv}
        hasSubmissions={hasSubmissions}
      />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <StatsStrip
          total={analytics.total}
          completedCount={analytics.completedCount}
          completionRate={analytics.completionRate}
          avgTime={analytics.avgTime}
        />

        {hasSubmissions && (
          <>
            <DropOffChart dropOff={analytics.dropOff} total={analytics.total} />
            <AnswerSummaries summaries={analytics.answerSummaries} />
          </>
        )}

        <ResponsesTable
          form={form}
          submissions={submissions}
          onSelect={setSelectedSubmission}
          onDelete={handleDelete}
        />
      </main>

      <ResponseDetailPanel
        submission={selectedSubmission}
        form={form}
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
}
