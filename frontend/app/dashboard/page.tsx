"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { fetchStatsOverview, type StatsOverview } from "@/lib/stats";
import { fetchCurrentUser } from "@/lib/user";
import { HeroSection } from "@/components/dashboard/home/hero-section";
import { MetricsGrid } from "@/components/dashboard/home/metrics-grid";
import { KnowledgeCard } from "@/components/dashboard/home/knowledge-card";
import { ActivityChart } from "@/components/dashboard/home/activity-chart";
import { EmptyState } from "@/components/dashboard/home/empty-state";

function nameFromEmail(email?: string | null) {
  if (!email) return "there";
  const handle = email.split("@")[0] ?? "there";
  return handle
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(" ");
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-6 py-8 md:px-10">
      <div className="h-72 animate-pulse rounded-[32px] bg-muted/50" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-[24px] bg-muted/50" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-[28px] bg-muted/50" />
    </div>
  );
}

export default function DashboardHomePage() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchStatsOverview()
      .then(setStats)
      .catch(() => {});
    fetchCurrentUser()
      .then((u) => setEmail(u.email))
      .catch(() => {});
  }, []);

  if (!stats) {
    return <DashboardSkeleton />;
  }

  const hasProspects = stats.total_prospects > 0;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-6 py-8 md:px-10">
      <HeroSection
        name={nameFromEmail(email)}
        hasSellerKnowledge={stats.has_seller_knowledge}
        aiActive={stats.has_seller_knowledge && (stats.generating_count > 0 || hasProspects)}
      />

      <KnowledgeCard />

      {hasProspects ? (
        <>
          <MetricsGrid stats={stats} />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[28px] border border-black/[0.04] bg-card p-6 shadow-luxury sm:p-8 dark:border-white/[0.06]"
          >
            <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-medium tracking-tight text-foreground">Activity, last 14 days</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prospects added to the pipeline vs. emails actually sent.
                </p>
              </div>
            </div>
            <ActivityChart data={stats.daily_activity} />
          </motion.div>
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
