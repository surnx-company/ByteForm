import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import {
  submissionSchema,
  validateAnswersAgainstQuestions,
} from "@/shared/lib/validation/forms";
import type { Question } from "@/shared/types/form";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify form ownership
  const { data: form } = await supabase
    .from("forms")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!form) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("form_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(submissions);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Handle both old single-phase (if answers present) and new two-phase (if answers missing)
  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // If answers are provided, this is a legacy or final single-phase submission.
  // However, we want to move towards two-phase.
  // For now, if answers are empty, we treat it as "start".
  const hasAnswers = Object.keys(parsed.data.answers).length > 0;

  if (!hasAnswers) {
    // Phase 1: Start submission
    const { data: submissionId, error: rpcError } = await supabase.rpc(
      "start_submission",
      {
        p_form_id: id,
        p_started_at: parsed.data.startedAt ?? new Date().toISOString(),
      }
    );

    if (rpcError) {
      const status = rpcError.message === "form_not_published" ? 403 : 500;
      return NextResponse.json({ error: rpcError.message }, { status });
    }

    return NextResponse.json({ id: submissionId }, { status: 201 });
  }

  // Legacy/Single-phase path (optional: we could deprecate this and force two-phase)
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("questions, is_published")
    .eq("id", id)
    .single();

  if (formError || !form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  if (form.is_published === false) {
    return NextResponse.json(
      { error: "Form is not accepting submissions" },
      { status: 403 }
    );
  }

  const questions = (form.questions ?? []) as Question[];
  const issues = validateAnswersAgainstQuestions(questions, parsed.data.answers);
  if (issues.length > 0) {
    return NextResponse.json(
      { error: "Invalid answers", issues },
      { status: 400 }
    );
  }

  const completedAt = new Date().toISOString();
  const { data: submissionId, error: insertError } = await supabase.rpc(
    "start_submission",
    {
      p_form_id: id,
      p_started_at: parsed.data.startedAt ?? completedAt,
    }
  );

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { error: updateError } = await supabase.rpc("update_submission", {
    p_submission_id: submissionId,
    p_form_id: id,
    p_answers: parsed.data.answers,
    p_completed_at: completedAt,
  });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: submissionId }, { status: 201 });
}
