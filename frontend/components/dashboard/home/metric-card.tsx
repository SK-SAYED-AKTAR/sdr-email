"use client";

import type { LucideIcon } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  visual,
  delay = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  trend?: { value: number; positive: boolean } | null;
  visual?: ReactNode;
  delay?: number;
}) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowBackground = useMotionTemplate`radial-gradient(220px circle at ${glowX}% ${glowY}%, rgb(212 175 55 / 0.14), transparent 70%)`;

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 6);
    rotateX.set((0.5 - py) * 6);
    glowX.set(px * 100);
    glowY.set(py * 100);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 900 }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX: springX, rotateY: springY }}
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="group relative overflow-hidden rounded-[24px] border border-black/[0.04] bg-card p-6 shadow-luxury transition-shadow duration-300 hover:shadow-gold-lg dark:border-white/[0.06]"
      >
        <motion.div
          style={{ background: glowBackground }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <div className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-gold/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 ring-1 ring-gold/20">
              <Icon className="size-[18px] text-gold-strong" strokeWidth={1.75} />
            </span>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
          </div>
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-semibold ${
                trend.positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              }`}
            >
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
          )}
        </div>

        <div className="relative z-10 mt-5 flex items-end justify-between gap-3">
          <div>
            <div className="text-[2.1rem] leading-none font-semibold tracking-tight text-foreground">{value}</div>
            {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
          </div>
        </div>

        {visual && <div className="relative z-10 mt-4">{visual}</div>}
      </motion.div>
    </motion.div>
  );
}
