"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { NavItem } from "@/components/dashboard/nav-items";

export function SidebarItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === item.href;
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      className={cn(
        "group relative flex h-11 cursor-pointer items-center gap-3 rounded-2xl px-3.5 text-sm font-medium outline-none transition-colors duration-200",
        "focus-visible:ring-3 focus-visible:ring-sidebar-ring/50",
        collapsed && "justify-center px-0",
        active ? "text-gold-foreground" : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-pill"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/25 via-gold/12 to-transparent shadow-gold-sm ring-1 ring-gold/30"
        />
      )}
      {!active && (
        <span className="absolute inset-0 rounded-2xl bg-sidebar-accent/0 transition-colors duration-200 group-hover:bg-sidebar-accent/70" />
      )}
      <Icon
        className={cn(
          "relative z-10 size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
          active && "text-gold-strong drop-shadow-[0_0_6px_rgb(var(--gold-rgb)/0.5)]"
        )}
        strokeWidth={1.75}
      />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 overflow-hidden whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}
