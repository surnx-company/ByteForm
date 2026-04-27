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

  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

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
  // No `.select()` after insert: respondents are anonymous and the SELECT
  // policy on `submissions` only allows form owners to read rows. Returning
  // the inserted row would force a SELECT check that anon users fail, which
  // surfaces as "new row violates row-level security policy" — even though
  // the INSERT itself was authorized. The client only needs the status code.
  const { error } = await supabase
    .from("submissions")
    .insert({
      form_id: id,
      answers: parsed.data.answers,
      started_at: parsed.data.startedAt ?? completedAt,
      completed_at: completedAt,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
