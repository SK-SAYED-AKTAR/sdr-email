"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { ContentContainer } from "@/components/dashboard/content-container";
import { StatsKpiRow } from "@/components/dashboard/stats-kpi-row";
import { StatusBreakdownBar } from "@/components/dashboard/status-breakdown-bar";
import { DailyActivityChart } from "@/components/dashboard/daily-activity-chart";
import { fetchStatsOverview, type StatsOverview } from "@/lib/stats";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<StatsOverview | null>(null);

  useEffect(() => {
    fetchStatsOverview()
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <ContentContainer>
      <div className="space-y-8">
        <PageHeader title="Analytics" subtitle="How your outreach pipeline is performing." />

        {stats ? (
          <>
            <StatsKpiRow stats={stats} />

            <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
              <h2 className="text-sm font-semibold text-foreground">Activity, last 14 days</h2>
              <p className="mt-0.5 mb-4 text-sm text-muted-foreground">
                Prospects added to the pipeline vs. emails actually sent.
              </p>
              <DailyActivityChart data={stats.daily_activity} />
            </div>

            <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
              <h2 className="text-sm font-semibold text-foreground">Pipeline status</h2>
              <p className="mt-0.5 mb-4 text-sm text-muted-foreground">Where every generated email currently stands.</p>
              <StatusBreakdownBar
                completed={stats.completed_count}
                generating={stats.generating_count}
                failed={stats.failed_count}
              />
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        )}
      </div>
    </ContentContainer>
  );
}
