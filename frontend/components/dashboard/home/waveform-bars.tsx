"use client";

import { motion } from "framer-motion";

const BAR_COUNT = 18;

export function WaveformBars({ active = true }: { active?: boolean }) {
  return (
    <div className="flex h-11 items-end gap-[3px]">
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const base = 30 + Math.abs(Math.sin(i * 0.7)) * 60;
        return (
          <motion.span
            key={i}
            className="w-full max-w-1.5 flex-1 rounded-full bg-gradient-to-t from-gold/40 to-gold"
            style={{ height: `${base}%` }}
            animate={
              active
                ? {
                    height: [`${base}%`, `${Math.max(15, base - 35)}%`, `${base}%`],
                  }
                : undefined
            }
            transition={{
              duration: 1.6 + (i % 4) * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.06,
            }}
          />
        );
      })}
    </div>
  );
}
