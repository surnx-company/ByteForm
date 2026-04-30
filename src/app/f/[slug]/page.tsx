import { createClient } from "@/shared/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicFormShell } from "@/features/runtime";
import type { Form } from "@/shared/types/form";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: dbForm } = await supabase
    .from("forms")
    .select("id, title, is_published")
    .eq("slug", slug)
    .single();

  if (!dbForm || !dbForm.is_published) {
    return { robots: { index: false, follow: false } };
  }

  const title = dbForm.title || "Fill in this form";

  return {
    title,
    description: `Fill in "${title}" — powered by ByteForm.`,
    openGraph: {
      title,
      description: `Fill in "${title}" — powered by ByteForm.`,
    },
    // Form pages are user-generated content — noindex by default to
    // avoid indexing potentially private or one-off forms.
    robots: { index: false, follow: false },
  };
}

export default async function PublicFormPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: dbForm } = await supabase
    .from("forms")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
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
    redirectUrl: dbForm.redirect_url ?? undefined,
    createdAt: dbForm.created_at,
    updatedAt: dbForm.updated_at,
  };

  return <PublicFormShell form={form} />;
}
