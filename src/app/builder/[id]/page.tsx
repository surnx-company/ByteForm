import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { SaveableFormBuilder } from "./client";
import type { Form } from "@/types/form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBuilderPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: dbForm } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!dbForm) {
    notFound();
  }

  const form: Form = {
    id: dbForm.id,
    userId: dbForm.user_id,
    title: dbForm.title,
    slug: dbForm.slug,
    welcomeScreen: dbForm.welcome_screen as Form["welcomeScreen"],
    thankYouScreen: dbForm.thank_you_screen as Form["thankYouScreen"],
    questions: dbForm.questions as Form["questions"],
    isPublished: dbForm.is_published,
    createdAt: dbForm.created_at,
    updatedAt: dbForm.updated_at,
  };

  return <SaveableFormBuilder initialForm={form} />;
}
