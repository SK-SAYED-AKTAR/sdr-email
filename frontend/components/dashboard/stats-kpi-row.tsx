import Link from "next/link";
import { CheckCircle2, Send, Sparkles, Users } from "lucide-react";

import { StatTile } from "@/components/dashboard/stat-tile";
import type { StatsOverview } from "@/lib/stats";

export function StatsKpiRow({ stats }: { stats: StatsOverview }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatTile label="Total prospects" value={stats.total_prospects} icon={Users} />
      <StatTile
        label="Emails ready"
        value={stats.completed_count}
        icon={CheckCircle2}
        tone={stats.completed_count > 0 ? "success" : "default"}
        hint={stats.generating_count > 0 ? `${stats.generating_count} generating` : undefined}
      />
      <StatTile label="Emails sent" value={stats.sent_count} icon={Send} />
      {stats.has_seller_knowledge ? (
        <StatTile label="Company knowledge" value="Ready" icon={Sparkles} tone="success" />
      ) : (
        <Link
          href="/dashboard/settings"
          className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">Company knowledge</p>
            <Sparkles className="size-4 shrink-0 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-warning">Not set up</p>
          <p className="mt-1 text-xs text-muted-foreground">Tap to set it up</p>
        </Link>
      )}
    </div>
  );
}
