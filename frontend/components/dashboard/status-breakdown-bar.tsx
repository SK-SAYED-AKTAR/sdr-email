import { cn } from "@/lib/utils";

export function StatusBreakdownBar({
  completed,
  generating,
  failed,
}: {
  completed: number;
  generating: number;
  failed: number;
}) {
  const total = completed + generating + failed;

  const segments = [
    { label: "Completed", value: completed, bar: "bg-success", dot: "bg-success" },
    { label: "Generating", value: generating, bar: "bg-warning", dot: "bg-warning" },
    { label: "Failed", value: failed, bar: "bg-destructive", dot: "bg-destructive" },
  ].filter((s) => s.value > 0);

  if (total === 0) {
    return (
      <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
        No prospects yet — upload a CSV to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex h-6 w-full gap-0.5 overflow-hidden rounded-md bg-muted">
        {segments.map((s) => (
          <div
            key={s.label}
            className={cn("h-full", s.bar)}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", s.dot)} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-medium text-foreground">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
