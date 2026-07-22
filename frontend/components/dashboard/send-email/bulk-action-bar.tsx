"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Send, X } from "lucide-react";
import { toast } from "sonner";

import { LoadingButton } from "@/components/loading-button";
import { SendConfirmDialog } from "@/components/dashboard/send-email/send-confirm-dialog";
import { ApiError } from "@/lib/api";
import { bulkRegenerateProspects, bulkSendProspects } from "@/lib/prospects";

export function BulkActionBar({
  selectedIds,
  onClear,
  onRegenerated,
  onSent,
}: {
  selectedIds: string[];
  onClear: () => void;
  onRegenerated?: () => void;
  onSent?: () => void;
}) {
  const [regenerating, setRegenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const count = selectedIds.length;

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const { accepted, skipped } = await bulkRegenerateProspects(selectedIds);
      if (accepted.length > 0) {
        toast.success(
          skipped.length > 0
            ? `Regenerating ${accepted.length} email${accepted.length === 1 ? "" : "s"} — ${skipped.length} already in progress.`
            : `Regenerating ${accepted.length} email${accepted.length === 1 ? "" : "s"}...`
        );
        onRegenerated?.();
        onClear();
      } else {
        toast.error("Those emails are already generating.");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't start regeneration. Please try again.");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleSend() {
    setSending(true);
    try {
      const { results } = await bulkSendProspects(selectedIds);
      const sent = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success);
      if (sent > 0) {
        toast.success(`Sent ${sent} email${sent === 1 ? "" : "s"}.`);
      }
      if (failed.length > 0) {
        toast.error(
          sent > 0
            ? `${failed.length} failed to send: ${failed[0].error}`
            : `Sending failed: ${failed[0].error}`
        );
      }
      onSent?.();
      onClear();
      setConfirmOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
          >
            <div className="flex items-center gap-3 rounded-xl bg-foreground px-4 py-2.5 text-background shadow-lg ring-1 ring-foreground/10">
              <button
                type="button"
                onClick={onClear}
                aria-label="Clear selection"
                className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-background/70 transition-colors hover:bg-background/10 hover:text-background"
              >
                <X className="size-3.5" />
              </button>
              <span className="text-sm font-medium whitespace-nowrap">
                {count} email{count === 1 ? "" : "s"} selected
              </span>
              <div className="h-4 w-px bg-background/20" />
              <LoadingButton
                size="sm"
                variant="secondary"
                className="bg-background/10 text-background hover:bg-background/20"
                loading={regenerating}
                onClick={handleRegenerate}
              >
                <RefreshCw />
                {count > 1 ? "Bulk Regenerate" : "Regenerate Email"}
              </LoadingButton>
              <LoadingButton
                size="sm"
                variant="secondary"
                className="bg-background/10 text-background hover:bg-background/20"
                loading={sending}
                onClick={() => setConfirmOpen(true)}
              >
                <Send />
                {count > 1 ? "Bulk Send" : "Send Email"}
              </LoadingButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SendConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} count={count} sending={sending} onConfirm={handleSend} />
    </>
  );
}
