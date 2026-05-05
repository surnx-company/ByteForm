import type { Form } from "@/shared/types/form";
import type { Database } from "@/shared/types/database";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];

const TEXT_TYPES = new Set(["short_text", "long_text", "email"]);
const MAX_SNIPPETS = 5;
const MAX_LENGTH = 160;

interface Props {
  form: Form;
  submissions: Submission[];
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max).trimEnd() + "…";
}

export function TextSnippets({ form, submissions }: Props) {
  const textQuestions = form.questions.filter((q) => TEXT_TYPES.has(q.type));

  if (textQuestions.length === 0 || submissions.length === 0) return null;

  const sections = textQuestions
    .map((q) => {
      const snippets = submissions
        .map((s) => {
          const val = (s.answers as Record<string, unknown>)[q.id];
          if (val === null || val === undefined) return null;
          const str = String(val).trim();
          return str.length > 0 ? str : null;
        })
        .filter((s): s is string => s !== null)
        .slice(0, MAX_SNIPPETS);

      return { question: q, snippets };
    })
    .filter((s) => s.snippets.length > 0);

  if (sections.length === 0) return null;

  return (
    <section>
      <h3 className="text-sm font-semibold text-foreground mb-3">Open-ended Responses</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(({ question, snippets }) => (
          <div
            key={question.id}
            className="border border-border rounded-xl bg-card p-5"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              {question.title || "Untitled"}
            </p>
            <ul className="space-y-2">
              {snippets.map((snippet, i) => (
                <li
                  key={i}
                  className="text-sm text-foreground bg-secondary/50 rounded-lg px-3 py-2 leading-relaxed border-l-2 border-accent/30"
                >
                  {truncate(snippet, MAX_LENGTH)}
                </li>
              ))}
            </ul>
            {submissions.filter((s) => {
              const val = (s.answers as Record<string, unknown>)[question.id];
              return val !== null && val !== undefined && String(val).trim().length > 0;
            }).length > MAX_SNIPPETS && (
              <p className="text-xs text-muted-foreground mt-3">
                +{submissions.filter((s) => {
                  const val = (s.answers as Record<string, unknown>)[question.id];
                  return val !== null && val !== undefined && String(val).trim().length > 0;
                }).length - MAX_SNIPPETS} more in Responses tab
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
