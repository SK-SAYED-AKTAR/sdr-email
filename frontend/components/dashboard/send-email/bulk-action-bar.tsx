"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function BulkActionBar({
  count,
  onClear,
}: {
  count: number;
  onClear: () => void;
}) {
  return (
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
            <ComingSoonButton icon={<RefreshCw />} label={count > 1 ? "Bulk Regenerate" : "Regenerate Emails"} />
            <ComingSoonButton icon={<Send />} label={count > 1 ? "Bulk Send" : "Send Emails"} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ComingSoonButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Tooltip>
      {/* The Button below is disabled (pointer-events-none), so the hover/focus
          target for the tooltip has to be this wrapping span instead. */}
      <TooltipTrigger
        render={<span tabIndex={0} className="inline-flex rounded-lg" />}
        onClick={() => toast("Coming soon")}
      >
        <Button
          size="sm"
          variant="secondary"
          className="bg-background/10 text-background hover:bg-background/20"
          disabled
        >
          {icon}
          {label}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Coming soon</TooltipContent>
    </Tooltip>
  );
}
