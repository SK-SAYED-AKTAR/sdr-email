import { MailCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/format";
import type { Prospect } from "@/lib/prospects";

const STATUS_META: Record<Prospect["status"], { label: string; variant: "default" | "success" | "warning" | "destructive"; pulse?: boolean }> = {
  PENDING: { label: "Queued", variant: "default" },
  RESEARCHING: { label: "Researching", variant: "warning", pulse: true },
  ANALYZING_OPPORTUNITY: { label: "Analyzing", variant: "warning", pulse: true },
  GENERATING_EMAIL: { label: "Generating", variant: "warning", pulse: true },
  COMPLETED: { label: "Completed", variant: "success" },
  FAILED: { label: "Failed", variant: "destructive" },
};

export function StatusBadge({ status }: { status: Prospect["status"] }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant={meta.variant}>
      {meta.pulse && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75" />
          <span className={cn("relative inline-flex size-1.5 rounded-full bg-current")} />
        </span>
      )}
      {meta.label}
    </Badge>
  );
}

export function SentIndicator({ sentAt }: { sentAt: string | null }) {
  if (!sentAt) return null;
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span className="inline-flex items-center gap-1 text-xs text-muted-foreground" />}
      >
        <MailCheck className="size-3" />
        Sent
      </TooltipTrigger>
      <TooltipContent>Sent {formatRelativeDate(sentAt)}</TooltipContent>
    </Tooltip>
  );
}
