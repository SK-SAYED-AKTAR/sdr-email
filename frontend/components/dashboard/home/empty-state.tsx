"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileSpreadsheet, Search, Sparkles, UploadCloud, Users } from "lucide-react";

const STEPS = [
  { icon: UploadCloud, label: "Upload a CSV of prospects" },
  { icon: Search, label: "AI researches each one" },
  { icon: Sparkles, label: "Personalized emails get drafted" },
];

export function EmptyState() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[28px] border border-dashed border-black/[0.08] bg-card px-6 py-16 text-center dark:border-white/10"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(212_175_55/0.08),transparent_60%)]" />

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center gap-6">
        <div className="relative flex size-24 items-center justify-center">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-gold/30"
          />
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-gold/20 to-gold/5 ring-1 ring-gold/25"
          >
            <UploadCloud className="size-7 text-gold-strong" strokeWidth={1.5} />
          </motion.div>
          <motion.span
            animate={{ y: [0, -5, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="absolute -top-1 -right-1 flex size-8 items-center justify-center rounded-xl bg-card shadow-luxury ring-1 ring-black/[0.04]"
          >
            <FileSpreadsheet className="size-4 text-foreground/70" strokeWidth={1.75} />
          </motion.span>
          <motion.span
            animate={{ y: [0, 5, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute -bottom-1 -left-2 flex size-7 items-center justify-center rounded-xl bg-card shadow-luxury ring-1 ring-black/[0.04]"
          >
            <Users className="size-3.5 text-foreground/70" strokeWidth={1.75} />
          </motion.span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-medium tracking-tight text-foreground">No prospects yet</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Upload a CSV of leads and your AI agent will research each one and draft personalized outreach —
            automatically.
          </p>
        </div>

        <Link
          href="/dashboard/send-email"
          className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background shadow-luxury transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <UploadCloud className="size-4" strokeWidth={1.75} />
          Upload your first CSV
        </Link>

        <div className="flex w-full flex-col gap-2 pt-4 sm:flex-row sm:justify-center sm:gap-6">
          {STEPS.map((step) => {
            const StepIcon = step.icon;
            return (
              <div key={step.label} className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-strong">
                  <StepIcon className="size-3.5" strokeWidth={1.75} />
                </span>
                {step.label}
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
