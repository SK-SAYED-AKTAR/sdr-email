"use client";

import type { ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { EmailRow } from "@/components/dashboard/send-email/email-row";
import { EmailCard } from "@/components/dashboard/send-email/email-card";
import type { Prospect, ProspectListResponse, SortField, SortOrder } from "@/lib/prospects";

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "client", label: "Client" },
  { field: "company", label: "Company" },
];

export function EmailTable({
  data,
  sort,
  order,
  onToggleSort,
  page,
  onPageChange,
  selected,
  onToggleRow,
  onToggleAll,
  onPreview,
}: {
  data: ProspectListResponse;
  sort: SortField;
  order: SortOrder;
  onToggleSort: (field: SortField) => void;
  page: number;
  onPageChange: (page: number) => void;
  selected: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  onPreview: (prospect: Prospect) => void;
}) {
  const pageIds = data.items.map((p) => p.id);
  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length;
  const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="max-h-[65vh] overflow-auto">
        <table className="hidden w-full text-left md:table">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border/60">
              <th className="w-10 py-3 pl-4">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={onToggleAll}
                  aria-label="Select all emails on this page"
                />
              </th>
              {COLUMNS.map((col) => (
                <SortableHeader
                  key={col.field}
                  label={col.label}
                  active={sort === col.field}
                  order={order}
                  onClick={() => onToggleSort(col.field)}
                />
              ))}
              <Th>Website</Th>
              <Th className="text-center">LinkedIn</Th>
              <Th className="text-center">Facebook</Th>
              <Th className="text-center">Twitter</Th>
              <Th>Subject</Th>
              <Th>Email Preview</Th>
              <SortableHeader
                label="Status"
                active={sort === "status"}
                order={order}
                onClick={() => onToggleSort("status")}
              />
              <SortableHeader
                label="Created"
                active={sort === "created_at"}
                order={order}
                onClick={() => onToggleSort("created_at")}
              />
              <Th>
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {data.items.map((prospect) => (
                <EmailRow
                  key={prospect.id}
                  prospect={prospect}
                  selected={selected.has(prospect.id)}
                  onToggleSelect={() => onToggleRow(prospect.id)}
                  onPreview={() => onPreview(prospect)}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        <div className="md:hidden">
          <AnimatePresence initial={false}>
            {data.items.map((prospect) => (
              <EmailCard
                key={prospect.id}
                prospect={prospect}
                selected={selected.has(prospect.id)}
                onToggleSelect={() => onToggleRow(prospect.id)}
                onPreview={() => onPreview(prospect)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border/60 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {data.total} email{data.total === 1 ? "" : "s"} · Page {data.total_pages ? page : 0} of{" "}
          {data.total_pages}
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page >= data.total_pages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn("py-3 pr-4 text-xs font-medium text-muted-foreground", className)}>{children}</th>
  );
}

function SortableHeader({
  label,
  active,
  order,
  onClick,
}: {
  label: string;
  active: boolean;
  order: SortOrder;
  onClick: () => void;
}) {
  return (
    <th className="py-3 pr-4">
      <button
        type="button"
        onClick={onClick}
        aria-label={`Sort by ${label}`}
        className={cn(
          "flex cursor-pointer items-center gap-1 text-xs font-medium whitespace-nowrap transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        {active ? (
          order === "asc" ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )
        ) : (
          <ArrowUpDown className="size-3 opacity-40" />
        )}
      </button>
    </th>
  );
}
