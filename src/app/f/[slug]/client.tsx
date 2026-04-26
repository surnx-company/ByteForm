"use client";

import { useRef } from "react";
import { FormView } from "@/components/form/FormView";
import type { Form } from "@/types/form";

interface Props {
  form: Form;
}

export function PublicFormClient({ form }: Props) {
  const startedAt = useRef(new Date().toISOString());

  async function handleSubmit(answers: Record<string, unknown>) {
    try {
      await fetch(`/api/forms/${form.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          startedAt: startedAt.current,
        }),
      });
    } catch {
      // Silently fail — don't disrupt the respondent experience
    }
  }

  return (
    <div className="h-screen w-screen">
      <FormView form={form} onSubmit={handleSubmit} />
    </div>
  );
}
