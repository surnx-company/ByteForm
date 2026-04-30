"use client";

import { useCallback, useState } from "react";
import type { Form } from "@/shared/types/form";
import { FormView } from "./FormView";

interface Props {
  form: Form;
}

const FALLBACK_ERROR =
  "We couldn't send your responses. Check your connection and try again.";

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body && typeof body.error === "string") return body.error;
  } catch {
    // body wasn't JSON — fall through
  }
  return FALLBACK_ERROR;
}

export function PublicFormShell({ form }: Props) {
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const handleStart = useCallback(async () => {
    if (submissionId) return;

    try {
      const res = await fetch(`/api/forms/${form.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: {},
          startedAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmissionId(data.id);
      }
    } catch (err) {
      console.error("Failed to start submission tracking:", err);
    }
  }, [form.id, submissionId]);

  const handleSubmit = useCallback(
    async (answers: Record<string, unknown>) => {
      let res: Response;
      try {
        // Use the PATCH endpoint if we have a submissionId, otherwise fallback to legacy POST
        if (submissionId) {
          res = await fetch(`/api/submissions/${submissionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              answers,
              completed: true,
            }),
          });
        } else {
          res = await fetch(`/api/forms/${form.id}/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              answers,
              startedAt: new Date().toISOString(),
            }),
          });
        }
      } catch {
        throw new Error(FALLBACK_ERROR);
      }

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }
    },
    [form.id, submissionId]
  );

  return (
    <div className="h-screen w-screen">
      <FormView form={form} onStart={handleStart} onSubmit={handleSubmit} />
    </div>
  );
}
