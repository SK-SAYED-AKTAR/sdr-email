"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

import { Label } from "@/components/ui/label";

export function InlineSavedField({
  label,
  hint,
  saved,
  children,
}: {
  label: string;
  hint?: string;
  saved?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>
          {label} {hint && <span className="font-normal text-muted-foreground">({hint})</span>}
        </Label>
        <AnimatePresence>
          {saved && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-xs text-success"
            >
              <Check className="size-3" /> Saved
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {children}
    </div>
  );
}
