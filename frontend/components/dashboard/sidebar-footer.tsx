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
        "flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/65 outline-none transition-colors duration-200 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:ring-3 focus-visible:ring-sidebar-ring/50",
        collapsed && "justify-center px-0"
      )}
    >
      <LogOut className="size-[18px] shrink-0" />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );

  return (
    <div className="flex flex-col gap-1 border-t border-sidebar-border pt-2">
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
