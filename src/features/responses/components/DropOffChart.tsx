import type { DropOffItem } from "../hooks/useResponsesAnalytics";

interface Props {
  dropOff: DropOffItem[];
  total: number;
}

export function DropOffChart({ dropOff, total }: Props) {
  if (dropOff.length === 0 || total === 0) return null;

  return (
    <div className="border border-border rounded-xl p-5 bg-card">
      <h3 className="text-sm font-semibold text-foreground mb-4">Question Drop-off</h3>
      <div className="space-y-3">
        {dropOff.map((item, i) => (
          <div key={item.questionId} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="text-sm text-foreground truncate">{item.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {item.answered}/{total} ({item.rate}%)
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                {/* Dynamic width — runtime value, not a design token */}
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${item.rate}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
