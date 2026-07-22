"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ExternalLink, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loading-button";
import { StatusBadge } from "@/components/dashboard/send-email/status-badge";
import { formatDateTime, getDomain } from "@/lib/format";
import type { Prospect } from "@/lib/prospects";

export function EmailPreviewModal({
  prospect,
  open,
  onOpenChange,
}: {
  prospect: Prospect | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [regenerating, setRegenerating] = useState(false);

  if (!prospect) return null;

  function handleRegenerate() {
    setRegenerating(true);
    setTimeout(() => {
      setRegenerating(false);
      toast("Coming soon");
    }, 600);
  }

  const hasEmail = !!prospect.email_body;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="gap-1 border-b p-5">
          <div className="flex items-start justify-between gap-3 pr-6">
            <DialogTitle className="text-lg">{prospect.subject || "No subject yet"}</DialogTitle>
            <StatusBadge status={prospect.status} />
          </div>
          <DialogDescription className="sr-only">
            Generated email preview for {prospect.first_name} {prospect.last_name} at {prospect.company_name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-b px-5 py-4 text-sm sm:grid-cols-4">
          <Field label="Recipient" value={`${prospect.first_name} ${prospect.last_name}`} sub={prospect.email} />
          <Field label="Company" value={prospect.company_name} />
          <Field
            label="Website"
            value={
              prospect.company_website ? (
                <a
                  href={prospect.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-foreground hover:underline"
                >
                  {getDomain(prospect.company_website)}
                  <ExternalLink className="size-3" />
                </a>
              ) : (
                "—"
              )
            }
          />
          <Field
            label="Generated"
            value={prospect.generated_at ? formatDateTime(prospect.generated_at) : "—"}
          />
        </div>

        <div className="overflow-y-auto px-5 py-6">
          {hasEmail ? (
            <div className="space-y-4 text-[0.925rem] leading-relaxed whitespace-pre-wrap text-foreground">
              {prospect.email_body}
            </div>
          ) : prospect.status === "FAILED" ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Generation failed</p>
              {prospect.failure_reason && <p className="max-w-sm">{prospect.failure_reason}</p>}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
              <Sparkles className="size-5" />
              <p>Still generating — check back in a moment.</p>
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 border-t p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <LoadingButton loading={regenerating} disabled={!hasEmail} onClick={handleRegenerate}>
            Regenerate Email
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="space-y-0.5 overflow-hidden">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate font-medium text-foreground">{value}</p>
      {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
