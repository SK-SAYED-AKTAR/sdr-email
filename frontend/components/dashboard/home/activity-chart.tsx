"use client";

import { useMemo, useRef, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";

import type { DailyActivity } from "@/lib/stats";

const WIDTH = 700;
const HEIGHT = 220;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

function formatDay(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ActivityChart({ data }: { data: DailyActivity[] }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  const hasData = data.some((d) => d.added > 0 || d.sent > 0);

  const { addedPath, sentLine, sentArea, points } = useMemo(() => {
    const max = Math.max(1, ...data.flatMap((d) => [d.added, d.sent]));
    const stepX = data.length > 1 ? WIDTH / (data.length - 1) : WIDTH;
    const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

    const toY = (v: number) => PAD_TOP + plotHeight - (v / max) * plotHeight;

    const pts = data.map((d, i) => ({
      x: i * stepX,
      addedY: toY(d.added),
      sentY: toY(d.sent),
      day: d,
    }));

    const addedPath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.addedY.toFixed(1)}`).join(" ");
    const sentLine = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.sentY.toFixed(1)}`).join(" ");
    const sentArea = `${sentLine} L${pts[pts.length - 1]?.x ?? 0},${HEIGHT - PAD_BOTTOM} L0,${HEIGHT - PAD_BOTTOM} Z`;

    return { addedPath, sentLine, sentArea, points: pts, max };
  }, [data]);

  function handleMove(e: MouseEvent<SVGSVGElement>) {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const stepX = points.length > 1 ? WIDTH / (points.length - 1) : WIDTH;
    const idx = Math.max(0, Math.min(points.length - 1, Math.round(px / stepX)));
    setHover(idx);
  }

  const hoveredPoint = hover !== null ? points[hover] : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-foreground/30" />
          Prospects added
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-gold" />
          Emails sent
        </span>
      </div>

      {hasData ? (
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            width="100%"
            height={HEIGHT}
            preserveAspectRatio="none"
            className="overflow-visible"
            onMouseMove={handleMove}
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id="sentFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
              </linearGradient>
            </defs>

            {[0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                x1={0}
                x2={WIDTH}
                y1={PAD_TOP + (HEIGHT - PAD_TOP - PAD_BOTTOM) * f}
                y2={PAD_TOP + (HEIGHT - PAD_TOP - PAD_BOTTOM) * f}
                stroke="currentColor"
                strokeWidth={1}
                className="text-black/[0.05] dark:text-white/[0.06]"
              />
            ))}

            <motion.path
              d={sentArea}
              fill="url(#sentFill)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            />
            <motion.path
              d={addedPath}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground/25"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d={sentLine}
              fill="none"
              stroke="var(--gold-strong)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            />

            {hoveredPoint && (
              <g>
                <line
                  x1={hoveredPoint.x}
                  x2={hoveredPoint.x}
                  y1={PAD_TOP}
                  y2={HEIGHT - PAD_BOTTOM}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  className="text-foreground/20"
                />
                <circle cx={hoveredPoint.x} cy={hoveredPoint.sentY} r={4} fill="var(--gold-strong)" stroke="var(--card)" strokeWidth={2} />
                <circle cx={hoveredPoint.x} cy={hoveredPoint.addedY} r={3.5} className="fill-foreground/40" stroke="var(--card)" strokeWidth={2} />
              </g>
            )}

            {points.map((p, i) =>
              i % Math.max(1, Math.floor(points.length / 6)) === 0 || i === points.length - 1 ? (
                <text
                  key={p.day.date}
                  x={p.x}
                  y={HEIGHT - 6}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {formatDay(p.day.date)}
                </text>
              ) : null
            )}
          </svg>

          {hoveredPoint && (
            <div
              className="glass-panel-strong pointer-events-none absolute top-0 flex -translate-x-1/2 flex-col gap-1 rounded-xl px-3 py-2 text-xs shadow-luxury"
              style={{ left: `${(hoveredPoint.x / WIDTH) * 100}%` }}
            >
              <p className="font-medium text-foreground">{formatDay(hoveredPoint.day.date)}</p>
              <p className="text-gold-strong">{hoveredPoint.day.sent} sent</p>
              <p className="text-muted-foreground">{hoveredPoint.day.added} added</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          No activity in the last 14 days yet.
        </div>
      )}
    </div>
  );
}
