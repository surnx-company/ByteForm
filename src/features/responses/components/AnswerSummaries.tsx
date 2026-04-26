import type { AnswerSummary } from "../hooks/useResponsesAnalytics";

// ─── Yes / No ─────────────────────────────────────────────────────────────────

function YesNoCard({ summary }: { summary: AnswerSummary }) {
  const yes = summary.yesCount ?? 0;
  const no = summary.noCount ?? 0;
  const yesRate = summary.total > 0 ? Math.round((yes / summary.total) * 100) : 0;
  const noRate = 100 - yesRate;

  return (
    <div className="border border-border rounded-xl p-5 bg-card">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
        {summary.title}
      </p>
      <div className="space-y-2">
        <BarRow label="Yes" count={yes} rate={yesRate} primary />
        <BarRow label="No" count={no} rate={noRate} primary={false} />
      </div>
      <p className="text-xs text-muted-foreground mt-3">{summary.total} responses</p>
    </div>
  );
}

// ─── Multiple choice / Dropdown / Checkboxes ──────────────────────────────────

function ChoiceCard({ summary }: { summary: AnswerSummary }) {
  const counts = summary.choiceCounts ?? {};
  const labels =
    summary.choices && summary.choices.length > 0
      ? summary.choices
      : Object.keys(counts);
  const max = Math.max(...Object.values(counts), 1);

  return (
    <div className="border border-border rounded-xl p-5 bg-card">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
        {summary.title}
      </p>
      <div className="space-y-2">
        {labels.map((label) => {
          const count = counts[label] ?? 0;
          const rate = Math.round((count / (summary.total || 1)) * 100);
          const barWidth = Math.round((count / max) * 100);
          return (
            <BarRow
              key={label}
              label={label}
              count={count}
              rate={rate}
              barWidthOverride={barWidth}
              primary
            />
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-3">{summary.total} responses</p>
    </div>
  );
}

// ─── Rating / Star ────────────────────────────────────────────────────────────

function ScaleCard({ summary }: { summary: AnswerSummary }) {
  const dist = summary.distribution ?? [];
  const max = Math.max(...dist, 1);
  const min = summary.min ?? 1;

  return (
    <div className="border border-border rounded-xl p-5 bg-card">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        {summary.title}
      </p>
      <div className="flex items-baseline gap-1.5 mb-4">
        <span className="text-3xl font-bold text-foreground">{summary.average}</span>
        <span className="text-sm text-muted-foreground">/ {summary.max}</span>
      </div>
      {/* Bar chart: one column per scale value */}
      <div className="flex items-end gap-1 h-14">
        {dist.map((count, idx) => {
          const heightPct = max > 0 ? Math.round((count / max) * 100) : 0;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
              {/* Dynamic height is data-driven, not a design token */}
              <div
                className="w-full rounded-sm bg-accent"
                style={{ height: `${heightPct}%`, minHeight: count > 0 ? 3 : 0 }}
              />
              <span className="text-[10px] text-muted-foreground">{idx + min}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-3">{summary.total} responses</p>
    </div>
  );
}

// ─── Shared bar row ───────────────────────────────────────────────────────────

interface BarRowProps {
  label: string;
  count: number;
  rate: number;
  barWidthOverride?: number;
  primary: boolean;
}

function BarRow({ label, count, rate, barWidthOverride, primary }: BarRowProps) {
  const width = barWidthOverride ?? rate;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1 gap-2">
        <span className="text-foreground truncate">{label}</span>
        <span className="text-muted-foreground shrink-0">
          {count} ({rate}%)
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            primary ? "bg-accent" : "bg-muted-foreground/40"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface Props {
  summaries: AnswerSummary[];
}

export function AnswerSummaries({ summaries }: Props) {
  if (summaries.length === 0) return null;

  return (
    <section>
      <h3 className="text-sm font-semibold text-foreground mb-3">Answer Insights</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.map((summary) => {
          if (summary.kind === "yes_no") return <YesNoCard key={summary.questionId} summary={summary} />;
          if (summary.kind === "choice") return <ChoiceCard key={summary.questionId} summary={summary} />;
          if (summary.kind === "scale") return <ScaleCard key={summary.questionId} summary={summary} />;
          return null;
        })}
      </div>
    </section>
  );
}
