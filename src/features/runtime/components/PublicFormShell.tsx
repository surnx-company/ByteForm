"use client";

import { useCallback, useRef } from "react";
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
  const startedAt = useRef<string | null>(null);

  const handleStart = useCallback(() => {
    if (!startedAt.current) {
      startedAt.current = new Date().toISOString();
    }
  }, []);

  const handleSubmit = useCallback(
    async (answers: Record<string, unknown>) => {
      let res: Response;
      try {
        res = await fetch(`/api/forms/${form.id}/submissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers,
            startedAt: startedAt.current ?? new Date().toISOString(),
          }),
        });
      } catch {
        throw new Error(FALLBACK_ERROR);
      }

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }
    },
    [form.id]
  );

  return (
    <div className="h-screen w-screen">
      <FormView form={form} onStart={handleStart} onSubmit={handleSubmit} />
    </div>
  );
}
