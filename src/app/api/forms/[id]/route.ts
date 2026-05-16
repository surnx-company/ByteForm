import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { updateFormSchema } from "@/shared/lib/validation/forms";
import { captureServerEvent } from "@/shared/lib/analytics/posthog-server";
import { AnalyticsEvent } from "@/shared/lib/analytics/events";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
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

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateFormSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const body = parsed.data;
  const update: Record<string, unknown> = {};
  if (body.title !== undefined) update.title = body.title;
  if (body.slug !== undefined) update.slug = body.slug;
  if (body.welcomeScreen !== undefined) update.welcome_screen = body.welcomeScreen;
  if (body.thankYouScreen !== undefined) update.thank_you_screen = body.thankYouScreen;
  if (body.questions !== undefined) update.questions = body.questions;
  if (body.isPublished !== undefined) update.is_published = body.isPublished;
  if (body.redirectUrl !== undefined) {
    // Store empty string as null so the DB column stays clean
    update.redirect_url = body.redirectUrl === "" ? null : body.redirectUrl;
  }

  // Read the prior state so we can fire publish/unpublish events only on
  // actual transitions, not on every PUT that happens to include the flag.
  const { data: previous } = await supabase
    .from("forms")
    .select("is_published")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const { data, error } = await supabase
    .from("forms")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (
    previous &&
    body.isPublished !== undefined &&
    previous.is_published !== data.is_published
  ) {
    await captureServerEvent({
      distinctId: user.id,
      event: data.is_published
        ? AnalyticsEvent.FormPublished
        : AnalyticsEvent.FormUnpublished,
      properties: { form_id: data.id },
    });
  }

  return NextResponse.json(data);
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

  const { error } = await supabase
    .from("forms")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
