import { cn } from "@/lib/utils";
import type { StatusFilter } from "@/lib/prospects";
import { SearchBar } from "@/components/dashboard/send-email/search-bar";

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "generating", label: "Generating" },
  { key: "failed", label: "Failed" },
];

export function TableToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <SearchBar value={search} onChange={onSearchChange} />
      <div
        role="group"
        aria-label="Filter by status"
        className="flex w-fit items-center gap-1 rounded-lg bg-muted p-1"
      >
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => onStatusChange(filter.key)}
            aria-pressed={status === filter.key}
            className={cn(
              "cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
              status === filter.key
                ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
