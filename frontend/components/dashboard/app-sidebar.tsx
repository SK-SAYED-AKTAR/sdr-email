"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CollapseButton } from "@/components/dashboard/collapse-button";
import { SidebarItem } from "@/components/dashboard/sidebar-item";
import { SidebarFooter } from "@/components/dashboard/sidebar-footer";
import { NAV_ITEMS } from "@/components/dashboard/nav-items";
import {
  useNavigation,
  SIDEBAR_EXPANDED_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_MARGIN,
} from "@/components/dashboard/navigation-provider";

function SidebarBody({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden px-3.5 py-5">
      <Link
        href="/dashboard"
        aria-label="SDR Email home"
        className={cn("flex items-center px-1", collapsed && "justify-center px-0")}
      >
        <Logo iconOnly={collapsed} />
      </Link>

      <nav className="flex flex-1 flex-col gap-1.5">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      <SidebarFooter collapsed={collapsed} onNavigate={onNavigate} />
    </div>
  );
}

export function AppSidebar() {
  const { collapsed, mobileOpen, setMobileOpen } = useNavigation();
  const [hovering, setHovering] = useState(false);

  const expanded = !collapsed || hovering;

  return (
    <>
      <motion.aside
        onMouseEnter={() => collapsed && setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        animate={{ width: expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        style={{ top: SIDEBAR_MARGIN, bottom: SIDEBAR_MARGIN, left: SIDEBAR_MARGIN }}
        className={cn(
          "glass-panel fixed z-40 hidden flex-col rounded-[26px] shadow-luxury md:flex",
          collapsed && hovering && "shadow-[0_30px_70px_-20px_rgb(0_0_0/0.25)]"
        )}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-black/[0.03]" />
        <SidebarBody collapsed={!expanded} />
        <CollapseButton className="absolute -right-3 top-7 border border-sidebar-border/70 bg-card shadow-md hover:bg-muted" />
      </motion.aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] gap-0 border-none bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
