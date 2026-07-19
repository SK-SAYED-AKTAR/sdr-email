"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export function LoadingOverlay({ show, label }: { show: boolean; label?: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/80 backdrop-blur-sm"
        >
          <Loader2 className="size-6 animate-spin text-primary" />
          {label && <p className="text-sm text-muted-foreground">{label}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
