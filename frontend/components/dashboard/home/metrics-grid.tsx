"use client";

import { GitBranch, Send, Sparkles, Users } from "lucide-react";

import type { StatsOverview } from "@/lib/stats";
import { MetricCard } from "@/components/dashboard/home/metric-card";
import { AnimatedCounter } from "@/components/dashboard/home/animated-counter";
import { Sparkline } from "@/components/dashboard/home/sparkline";
import { PipelineRing } from "@/components/dashboard/home/pipeline-ring";
import { WaveformBars } from "@/components/dashboard/home/waveform-bars";

function trendFor(series: number[]) {
  if (series.length < 4) return null;
  const mid = Math.floor(series.length / 2);
  const prev = series.slice(0, mid).reduce((a, b) => a + b, 0);
  const recent = series.slice(mid).reduce((a, b) => a + b, 0);
  if (prev === 0 && recent === 0) return null;
  if (prev === 0) return { value: 100, positive: true };
  const pct = Math.round(((recent - prev) / prev) * 100);
  return { value: pct, positive: pct >= 0 };
}

export function MetricsGrid({ stats }: { stats: StatsOverview }) {
  const addedSeries = stats.daily_activity.map((d) => d.added);
  const sentSeries = stats.daily_activity.map((d) => d.sent);
  const pipelineTotal = stats.completed_count + stats.generating_count + stats.failed_count;
  const completionPct = pipelineTotal > 0 ? Math.round((stats.completed_count / pipelineTotal) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        delay={0}
        icon={Users}
        label="Total Prospects"
        value={<AnimatedCounter value={stats.total_prospects} />}
        hint={`${stats.csv_upload_count} CSV upload${stats.csv_upload_count === 1 ? "" : "s"}`}
        trend={trendFor(addedSeries)}
        visual={<Sparkline data={addedSeries.length ? addedSeries : [0, 0]} delay={0.3} />}
      />

      <MetricCard
        delay={0.08}
        icon={Send}
        label="Emails Sent"
        value={<AnimatedCounter value={stats.sent_count} />}
        hint="Delivered via your connected inbox"
        trend={trendFor(sentSeries)}
        visual={<Sparkline data={sentSeries.length ? sentSeries : [0, 0]} color="var(--foreground)" delay={0.4} />}
      />

      <MetricCard
        delay={0.16}
        icon={Sparkles}
        label="AI Generated"
        value={<AnimatedCounter value={stats.completed_count} />}
        hint={stats.generating_count > 0 ? `${stats.generating_count} generating now` : "Ready to send"}
        visual={<WaveformBars active={stats.generating_count > 0} />}
      />

      <MetricCard
        delay={0.24}
        icon={GitBranch}
        label="Pipeline"
        value={<AnimatedCounter value={completionPct} formatter={(n) => `${Math.round(n)}%`} />}
        hint={
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            <LegendDot color="bg-gold" label={`${stats.completed_count} done`} />
            <LegendDot color="bg-warning" label={`${stats.generating_count} active`} />
            {stats.failed_count > 0 && <LegendDot color="bg-destructive" label={`${stats.failed_count} failed`} />}
          </span>
        }
        visual={
          <div className="flex justify-center pt-1">
            <PipelineRing
              size={76}
              strokeWidth={7}
              segments={[
                { value: stats.completed_count, color: "var(--gold)", label: "Completed" },
                { value: stats.generating_count, color: "var(--warning)", label: "Generating" },
                { value: stats.failed_count, color: "var(--destructive)", label: "Failed" },
              ]}
            >
              <GitBranch className="size-4 text-muted-foreground/60" strokeWidth={1.5} />
            </PipelineRing>
          </div>
        }
      />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`size-1.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
