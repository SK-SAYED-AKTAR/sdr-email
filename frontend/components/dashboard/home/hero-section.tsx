"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, Sparkles, UploadCloud } from "lucide-react";

import { BackgroundScene } from "@/components/dashboard/home/background-scene";

function useGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export function HeroSection({
  name,
  hasSellerKnowledge,
  aiActive,
}: {
  name: string;
  hasSellerKnowledge: boolean;
  aiActive: boolean;
}) {
  const greeting = useGreeting();

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="relative isolate overflow-hidden rounded-[32px] border border-black/[0.04] bg-gradient-to-br from-card via-card to-secondary/40 p-8 shadow-luxury sm:p-10 lg:p-12 dark:border-white/[0.06]"
    >
      <BackgroundScene />

      <div className="relative z-10 flex flex-col gap-8">
        <motion.div variants={item} className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-gold-strong uppercase">
            <span className="relative flex size-1.5">
              <span
                className={`absolute inline-flex size-full rounded-full bg-gold ${aiActive ? "animate-ping opacity-60" : ""}`}
              />
              <span className="relative inline-flex size-full rounded-full bg-gold" />
            </span>
            {aiActive ? "AI Agent Active" : "AI Agent Standing By"}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </span>
        </motion.div>

        <div className="max-w-2xl space-y-4">
          <motion.h1
            variants={item}
            className="text-4xl leading-[1.08] font-medium tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]"
          >
            {greeting},{" "}
            <span className="gold-text-gradient font-semibold">{name}</span>
          </motion.h1>
          <motion.p variants={item} className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            {hasSellerKnowledge
              ? "Your AI sales agent is researching prospects and drafting outreach around the clock."
              : "Set up your Company Knowledge and your AI agent will start writing outreach that actually pitches something specific."}
          </motion.p>
        </div>

        <motion.div variants={item} className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/dashboard/send-email"
            className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-luxury transition-transform duration-200 will-change-transform hover:scale-[1.02] active:scale-[0.99]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <UploadCloud className="size-4" strokeWidth={1.75} />
            Upload Prospects
          </Link>
          <Link
            href={hasSellerKnowledge ? "/dashboard/analytics" : "/dashboard/settings"}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/[0.08] bg-white/50 px-5 py-3 text-sm font-medium text-foreground backdrop-blur-md transition-all duration-200 hover:border-gold/40 hover:bg-gold/8 dark:border-white/10 dark:bg-white/5"
          >
            <Sparkles className="size-4 text-gold-strong" strokeWidth={1.75} />
            {hasSellerKnowledge ? "View Analytics" : "Improve Company Knowledge"}
            <ArrowUpRight className="size-3.5 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
