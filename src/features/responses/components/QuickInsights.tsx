import type { DropOffItem } from "../hooks/useResponsesAnalytics";

interface Props {
  dropOff: DropOffItem[];
  total: number;
  completionRate: number;
}

export function QuickInsights({ dropOff, total, completionRate }: Props) {
  if (dropOff.length === 0 || total === 0) return null;

  const rates = dropOff.map((d) => d.rate);
  const avgReach = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);

  // Biggest drop-off: question where rate drops most vs previous
  let biggestDrop = dropOff[0];
  let biggestDropDelta = 0;
  for (let i = 1; i < dropOff.length; i++) {
    const delta = dropOff[i - 1].rate - dropOff[i].rate;
    if (delta > biggestDropDelta) {
      biggestDropDelta = delta;
      biggestDrop = dropOff[i];
    }
  }

  // Top question: highest answer rate
  const topQuestion = [...dropOff].sort((a, b) => b.rate - a.rate)[0];

  const insights: { label: string; value: string; sub: string; tone: "neutral" | "warn" | "good" }[] = [
    {
      label: "Avg. question reach",
      value: `${avgReach}%`,
      sub: "of respondents answer a typical question",
      tone: avgReach >= 70 ? "good" : avgReach >= 40 ? "neutral" : "warn",
    },
    {
      label: "Biggest drop-off",
      value: truncate(biggestDrop.title, 28),
      sub: biggestDropDelta > 0
        ? `−${biggestDropDelta}pp from previous question`
        : "No significant drop between questions",
      tone: biggestDropDelta >= 20 ? "warn" : "neutral",
    },
    {
      label: "Most answered",
      value: truncate(topQuestion.title, 28),
      sub: `${topQuestion.rate}% of respondents answered`,
      tone: "good",
    },
  ];

  return (
    <section>
      <h3 className="text-sm font-semibold text-foreground mb-3">Form Health</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {insights.map((ins) => (
          <div key={ins.label} className="border border-border rounded-xl bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              {ins.label}
            </p>
            <p
              className={`text-xl font-bold leading-tight mb-1 ${
                ins.tone === "good"
                  ? "text-green-700"
                  : ins.tone === "warn"
                  ? "text-amber-600"
                  : "text-foreground"
              }`}
            >
              {ins.value}
            </p>
            <p className="text-xs text-muted-foreground leading-snug">{ins.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max).trimEnd() + "…";
}
