import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { submissionSchema } from "@/shared/lib/validation/forms";

const RPC_ERROR_STATUS: Record<string, number> = {
  submission_not_found: 404,
  form_mismatch: 403,
  already_completed: 400,
};

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

  if (!parsed.data.formId) {
    return NextResponse.json({ error: "formId is required" }, { status: 400 });
  }

  // Direct SELECT on submissions is blocked by RLS for anonymous respondents,
  // so we delegate validation (existence, form match, completion) to the
  // SECURITY DEFINER RPC and translate its raised exceptions to HTTP statuses.
  const completedAt =
    parsed.data.completed === true ? new Date().toISOString() : null;

  const { error: rpcError } = await supabase.rpc("update_submission", {
    p_submission_id: submissionId,
    p_form_id: parsed.data.formId,
    p_answers: parsed.data.answers,
    p_completed_at: completedAt,
  });

  if (rpcError) {
    const status = RPC_ERROR_STATUS[rpcError.message] ?? 500;
    return NextResponse.json({ error: rpcError.message }, { status });
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
