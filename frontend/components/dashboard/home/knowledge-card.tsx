"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, Building2, Quote, Sparkles } from "lucide-react";

import { fetchSellerKnowledge, type SellerKnowledgeProfile } from "@/lib/seller-knowledge";
import { formatRelativeDate } from "@/lib/format";
import { PipelineRing } from "@/components/dashboard/home/pipeline-ring";
import { AnimatedCounter } from "@/components/dashboard/home/animated-counter";

function statusCopy(profile: SellerKnowledgeProfile) {
  switch (profile.status) {
    case "COMPLETED":
      return { title: "AI is ready to pitch", tone: "text-success" };
    case "GENERATING":
      return { title: "Learning your business…", tone: "text-warning" };
    case "FAILED":
      return { title: "Needs your attention", tone: "text-destructive" };
    default:
      return { title: "Not set up yet", tone: "text-muted-foreground" };
  }
}

export function KnowledgeCard() {
  const [profile, setProfile] = useState<SellerKnowledgeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    async function load() {
      try {
        const data = await fetchSellerKnowledge();
        setProfile(data);
        if (data.status === "GENERATING" && !interval) {
          interval = setInterval(load, 2000);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => interval && clearInterval(interval);
  }, []);

  if (loading || !profile) {
    return (
      <div className="h-[280px] animate-pulse rounded-[28px] bg-muted/50" />
    );
  }

  const confidence = profile.knowledge?.data.confidence ?? 0;
  const completeness = profile.status === "COMPLETED" ? Math.round(confidence * 100) : profile.status === "GENERATING" ? 55 : 0;
  const sourcesConnected =
    profile.documents.length + (profile.company_website ? 1 : 0) + (profile.product_website ? 1 : 0);
  const { title, tone } = statusCopy(profile);
  const pitch = profile.knowledge?.data.recommended_pitch || profile.knowledge?.data.company_summary;
  const industries = profile.knowledge?.data.primary_industries ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[28px] border border-black/[0.04] bg-gradient-to-br from-card to-secondary/30 p-7 shadow-luxury sm:p-9 dark:border-white/[0.06]"
    >
      <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-gold/8 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex shrink-0 flex-col items-center gap-3 lg:items-start">
          <PipelineRing
            size={148}
            strokeWidth={11}
            segments={[
              {
                value: completeness,
                color: profile.status === "FAILED" ? "var(--destructive)" : "var(--gold)",
                label: "Complete",
              },
              { value: 100 - completeness, color: "var(--muted)", label: "Remaining" },
            ]}
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                <AnimatedCounter value={completeness} formatter={(n) => `${Math.round(n)}`} />%
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">complete</span>
            </div>
          </PipelineRing>
          <span className={`text-sm font-medium ${tone}`}>{title}</span>
        </div>

        <div className="min-w-0 flex-1 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-gold-strong uppercase">
                <Sparkles className="size-3.5" strokeWidth={1.75} />
                Company Knowledge
              </div>
              <h2 className="text-2xl font-medium tracking-tight text-foreground">
                {profile.company_name || "Your company profile"}
              </h2>
            </div>
            <Link
              href="/dashboard/settings"
              className="group inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
            >
              Improve Knowledge
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {pitch ? (
            <div className="relative rounded-2xl bg-black/[0.025] p-4 pl-5 dark:bg-white/[0.03]">
              <Quote className="absolute -top-1 left-1 size-6 -scale-x-100 text-gold/25" strokeWidth={1.5} />
              <p className="line-clamp-2 pl-4 text-sm leading-relaxed text-foreground/80 italic">{pitch}</p>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Connect your website or upload a deck and the AI will learn your positioning, ICP, and pitch — then
              write outreach that sounds like you.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoChip icon={Building2} label="Sources connected" value={`${sourcesConnected}`} />
            <InfoChip
              icon={BadgeCheck}
              label="Industries mapped"
              value={industries.length ? `${industries.length}` : "—"}
            />
            <InfoChip
              icon={Sparkles}
              label="Last updated"
              value={profile.generated_at ? formatRelativeDate(profile.generated_at) : "Never"}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/[0.04] bg-card/60 px-3.5 py-3 dark:border-white/[0.05]">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gold/10">
        <Icon className="size-4 text-gold-strong" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
        <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
