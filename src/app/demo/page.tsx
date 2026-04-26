"use client";

import { FormView } from "@/components/form/FormView";
import { demoForm } from "@/lib/demo-form";

export default function DemoPage() {
  function handleSubmit(answers: Record<string, unknown>) {
    console.log("Form submitted:", answers);
  }

  return (
    <div className="h-screen w-screen">
      <FormView form={demoForm} onSubmit={handleSubmit} />
    </div>
  );
}
