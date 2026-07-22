"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";

export function Sparkline({
  data,
  color = "var(--gold)",
  height = 44,
  strokeWidth = 2,
  fill = true,
  delay = 0,
}: {
  data: number[];
  color?: string;
  height?: number;
  strokeWidth?: number;
  fill?: boolean;
  delay?: number;
}) {
  const gradientId = useId();
  const width = 100;

  const { linePath, areaPath } = useMemo(() => {
    const points = data.length > 1 ? data : [0, ...data];
    const max = Math.max(1, ...points);
    const min = Math.min(0, ...points);
    const range = Math.max(1, max - min);
    const stepX = width / (points.length - 1 || 1);

    const coords = points.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return [x, y];
    });

    const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
    const area = `${line} L${width},${height} L0,${height} Z`;

    return { linePath: line, areaPath: area };
  }, [data, height]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && (
        <motion.path
          d={areaPath}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.3 }}
        />
      )}
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}
