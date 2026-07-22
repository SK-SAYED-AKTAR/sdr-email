"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarItem } from "@/components/dashboard/sidebar-item";
import { SETTINGS_ITEM } from "@/components/dashboard/nav-items";

export function SidebarFooter({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await apiFetch("/api/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
  }

  const logoutButton = (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      aria-label="Log out"
      className={cn(
        "group relative flex h-11 w-full cursor-pointer items-center gap-3 rounded-2xl px-3.5 text-sm font-medium text-sidebar-foreground/55 outline-none transition-colors duration-200 hover:text-destructive disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:ring-3 focus-visible:ring-sidebar-ring/50",
        collapsed && "justify-center px-0"
      )}
    >
      <span className="absolute inset-0 rounded-2xl bg-destructive/0 transition-colors duration-200 group-hover:bg-destructive/8" />
      <LogOut className="relative z-10 size-[18px] shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" strokeWidth={1.75} />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 overflow-hidden whitespace-nowrap"
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );

  return (
    <div className="flex flex-col gap-1 border-t border-sidebar-border/70 pt-3">
      <SidebarItem item={SETTINGS_ITEM} collapsed={collapsed} onNavigate={onNavigate} />
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger render={logoutButton} />
          <TooltipContent side="right">Log out</TooltipContent>
        </Tooltip>
      ) : (
        logoutButton
      )}
    </div>
  );
}
