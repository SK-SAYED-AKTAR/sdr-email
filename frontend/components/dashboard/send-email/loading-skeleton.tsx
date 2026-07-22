import { Skeleton } from "@/components/ui/skeleton";

export function TableLoadingSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border/60">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="size-4 rounded-[5px]" />
          <div className="flex items-center gap-3" style={{ width: 180 }}>
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="hidden h-4 w-24 md:block" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-6 w-20 rounded-full lg:block" />
          <Skeleton className="hidden h-4 w-16 sm:block" />
        </div>
      ))}
    </div>
  );
}
