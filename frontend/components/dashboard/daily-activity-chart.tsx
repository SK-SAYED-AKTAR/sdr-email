"use client";

import { useMemo } from "react";

import type { DailyActivity } from "@/lib/stats";

export function DailyActivityChart({ data }: { data: DailyActivity[] }) {
  const max = useMemo(() => Math.max(1, ...data.flatMap((d) => [d.added, d.sent])), [data]);
  const hasData = data.some((d) => d.added > 0 || d.sent > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/50" />
          Prospects added
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success" />
          Emails sent
        </span>
      </div>

      {hasData ? (
        <div className="flex h-40 items-end gap-1.5 sm:gap-2">
          {data.map((day, i) => (
            <div key={day.date} className="flex h-full flex-1 flex-col items-center gap-1.5">
              <div className="flex h-full w-full items-end justify-center gap-0.5">
                <div
                  className="w-full max-w-3 rounded-t-sm bg-muted-foreground/40"
                  style={{ height: `${(day.added / max) * 100}%` }}
                  title={`${formatDay(day.date)}: ${day.added} added`}
                />
                <div
                  className="w-full max-w-3 rounded-t-sm bg-success"
                  style={{ height: `${(day.sent / max) * 100}%` }}
                  title={`${formatDay(day.date)}: ${day.sent} sent`}
                />
              </div>
              <span className="text-[0.65rem] whitespace-nowrap text-muted-foreground">
                {i % 3 === 0 || i === data.length - 1 ? formatDay(day.date) : ""}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          No activity in the last 14 days yet.
        </div>
      )}
    </div>
  );
}

function formatDay(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
