import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicFormClient } from "./client";
import type { Form } from "@/types/form";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicFormPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: dbForm } = await supabase
    .from("forms")
    .select("*")
    .eq("slug", slug)
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
    createdAt: dbForm.created_at,
    updatedAt: dbForm.updated_at,
  };

  return <PublicFormClient form={form} />;
}
