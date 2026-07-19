"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Logo } from "@/components/logo";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import {
  NavigationProvider,
  useNavigation,
  SIDEBAR_EXPANDED_WIDTH,
} from "@/components/dashboard/navigation-provider";

function MobileTopBar() {
  const { setMobileOpen } = useNavigation();

  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:hidden">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className="flex size-8 cursor-pointer items-center justify-center rounded-md text-foreground/70 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Menu className="size-[18px]" />
      </button>
      <Logo />
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div
        style={{ width: SIDEBAR_EXPANDED_WIDTH }}
        className="hidden h-full shrink-0 animate-pulse border-r border-sidebar-border bg-sidebar md:block"
      />
      <div className="flex-1 p-10">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    apiFetch("/api/me")
      .then(() => setChecking(false))
      .catch(() => router.replace("/login"));
  }, [router]);

  if (checking) {
    return <ShellSkeleton />;
  }

  return (
    <NavigationProvider>
      <TooltipProvider>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <MobileTopBar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </TooltipProvider>
    </NavigationProvider>
  );
}
