/**
 * Generates a URL slug from a form title with a short random suffix
 * to guarantee uniqueness even if two forms share the same name.
 *
 * "Customer Feedback Q1" → "customer-feedback-q1-k4p2"
 * "Untitled Form"        → "untitled-form-k4p2"
 */
export function generateSlug(title: string): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "untitled-form";

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
