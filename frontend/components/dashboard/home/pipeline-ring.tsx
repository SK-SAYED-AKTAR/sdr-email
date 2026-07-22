"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export type RingSegment = {
  value: number;
  color: string;
  label: string;
};

export function PipelineRing({
  segments,
  size = 120,
  strokeWidth = 12,
  children,
}: {
  segments: RingSegment[];
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(1, segments.reduce((sum, s) => sum + s.value, 0));

  let cumulative = 0;

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-black/[0.05] dark:text-white/[0.06]"
        />
        {segments.map((segment, i) => {
          if (segment.value <= 0) return null;
          const fraction = segment.value / total;
          const dash = fraction * circumference;
          const offset = -cumulative * circumference;
          cumulative += fraction;

          return (
            <motion.circle
              key={segment.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              initial={{ strokeDashoffset: 0, opacity: 0 }}
              animate={{ strokeDashoffset: offset, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
