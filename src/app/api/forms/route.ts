import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createFormSchema } from "@/lib/validation/forms";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: forms, error } = await supabase
    .from("forms")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(forms);
}

export async function POST(request: Request) {
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

  const parsed = createFormSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const body = parsed.data;

  const { data, error } = await supabase
    .from("forms")
    .insert({
      user_id: user.id,
      title: body.title || "Untitled Form",
      slug: body.slug || `form-${Date.now()}`,
      welcome_screen: body.welcomeScreen || { title: "Welcome", buttonText: "Start" },
      thank_you_screen: body.thankYouScreen || { title: "Thank you!" },
      questions: body.questions || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
