"use client";

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
} from "@/components/dashboard/navigation-provider";

function SidebarBody({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden px-3 py-5">
      <Link
        href="/dashboard"
        aria-label="SDR Email home"
        className={cn("flex items-center", collapsed && "justify-center")}
      >
        <Logo iconOnly={collapsed} />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
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

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative hidden h-full shrink-0 border-r border-sidebar-border bg-sidebar md:block"
      >
        <SidebarBody collapsed={collapsed} />
        <CollapseButton className="absolute -right-3 top-6 rounded-full border border-sidebar-border bg-background shadow-sm hover:bg-muted hover:text-foreground" />
      </motion.aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] gap-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
