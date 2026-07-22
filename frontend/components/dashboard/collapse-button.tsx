"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { useNavigation } from "@/components/dashboard/navigation-provider";

export function CollapseButton({ className }: { className?: string }) {
  const { collapsed, toggleCollapsed } = useNavigation();

  return (
    <button
      type="button"
      onClick={toggleCollapsed}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-sidebar-foreground/50 outline-none transition-all duration-200 hover:scale-105 hover:text-gold-strong focus-visible:ring-3 focus-visible:ring-sidebar-ring/50",
        className
      )}
    >
      {collapsed ? <PanelLeftOpen className="size-3.5" strokeWidth={1.75} /> : <PanelLeftClose className="size-3.5" strokeWidth={1.75} />}
    </button>
  );
}
