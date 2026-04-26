interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="border border-border rounded-xl p-5 bg-card">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function formatTime(seconds: number): string {
  if (seconds === 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function completionLabel(rate: number): string {
  if (rate >= 70) return "Above average";
  if (rate >= 40) return "Average";
  return "Below average";
}

interface Props {
  total: number;
  completedCount: number;
  completionRate: number;
  avgTime: number;
}

export function StatsStrip({ total, completedCount, completionRate, avgTime }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label="Total Responses"
        value={String(total)}
        sub={total > 0 ? `${completedCount} completed` : "No responses yet"}
      />
      <StatCard
        label="Completion Rate"
        value={total === 0 ? "—" : `${completionRate}%`}
        sub={total > 0 ? completionLabel(completionRate) : undefined}
      />
      <StatCard
        label="Avg. Completion Time"
        value={formatTime(avgTime)}
        sub={avgTime > 0 ? "per response" : undefined}
      />
    </div>
  );
}
