"use client";

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ExternalLink, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/loading-button";
import { InlineSavedField } from "@/components/inline-saved-field";
import { StatusBadge } from "@/components/dashboard/send-email/status-badge";
import { ApiError } from "@/lib/api";
import { formatDateTime, getDomain } from "@/lib/format";
import { updateProspectOutreach, type Prospect } from "@/lib/prospects";

type EditableField = "subject" | "email_body";

export function EmailPreviewModal({
  prospect,
  open,
  onOpenChange,
  onUpdated,
}: {
  prospect: Prospect | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}) {
  const [regenerating, setRegenerating] = useState(false);
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [savedField, setSavedField] = useState<EditableField | null>(null);

  useEffect(() => {
    setSubject(prospect?.subject ?? "");
    setEmailBody(prospect?.email_body ?? "");
  }, [prospect?.id, open]);

  if (!prospect) return null;

  const hasEmail = !!prospect.email_body;

  async function commitField(field: EditableField, original: string) {
    if (!prospect) return;
    const nextSubject = subject.trim();
    const nextBody = emailBody.trim();
    const changed = field === "subject" ? nextSubject !== original.trim() : nextBody !== original.trim();
    if (!changed) return;

    if (!nextSubject || !nextBody) {
      toast.error(field === "subject" ? "Subject can't be empty." : "Email body can't be empty.");
      return;
    }

    try {
      const updated = await updateProspectOutreach(prospect.id, {
        subject: nextSubject,
        email_body: nextBody,
      });
      setSubject(updated.subject ?? "");
      setEmailBody(updated.email_body ?? "");
      onUpdated?.();
      setSavedField(field);
      setTimeout(() => setSavedField((f) => (f === field ? null : f)), 1500);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save your edit. Please try again.");
    }
  }

  function handleRegenerate() {
    setRegenerating(true);
    setTimeout(() => {
      setRegenerating(false);
      toast("Coming soon");
    }, 600);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="gap-1 border-b p-5">
          <DialogTitle className="sr-only">{subject || "Email preview"}</DialogTitle>
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onBlur={() => commitField("subject", prospect.subject ?? "")}
                disabled={!hasEmail}
                placeholder="Subject"
                aria-label="Email subject"
                className="w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 -mx-2 py-0.5 font-heading text-lg font-medium text-foreground outline-none transition-colors hover:bg-muted/50 focus:border-input focus:bg-background focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
              />
              <AnimatePresence>
                {savedField === "subject" && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex shrink-0 items-center gap-1 text-xs text-success"
                  >
                    <Check className="size-3" /> Saved
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
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
            <InlineSavedField label="Email Body" saved={savedField === "email_body"}>
              <Textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                onBlur={() => commitField("email_body", prospect.email_body ?? "")}
                rows={14}
                aria-label="Email body"
                className="text-[0.925rem] leading-relaxed"
              />
            </InlineSavedField>
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
