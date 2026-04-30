import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { submissionSchema } from "@/shared/lib/validation/forms";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await params;
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

  // We need the form_id for the RPC.
  // Respondents don't have auth, so we fetch the submission's form_id first.
  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("form_id, completed_at")
    .eq("id", submissionId)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (submission.completed_at) {
    return NextResponse.json(
      { error: "Submission already completed" },
      { status: 400 }
    );
  }

  // If completed is true in the body (or some other signal), set completed_at.
  // The client can pass a 'completed' flag or we can just infer it.
  // In the two-phase flow, the client calls this when they finish.
  const isFinal = (raw as { completed?: boolean }).completed === true;
  const completedAt = isFinal ? new Date().toISOString() : null;

  const { error: rpcError } = await supabase.rpc("update_submission", {
    p_submission_id: submissionId,
    p_form_id: submission.form_id,
    p_answers: parsed.data.answers,
    p_completed_at: completedAt,
  });

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
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

  // Fetch the submission to get its parent form_id
  const { data: submission } = await supabase
    .from("submissions")
    .select("form_id")
    .eq("id", id)
    .single();

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify the parent form belongs to the authenticated user
  const { data: form } = await supabase
    .from("forms")
    .select("id")
    .eq("id", submission.form_id)
    .eq("user_id", user.id)
    .single();

  if (!form) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("submissions").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
