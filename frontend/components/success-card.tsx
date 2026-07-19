"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function SuccessCard({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success"
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Check className="size-8" strokeWidth={3} />
        </motion.div>
      </motion.div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-success">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
