"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  NavigationProvider,
  useNavigation,
  sidebarContentOffset,
} from "@/components/dashboard/navigation-provider";

function ShellSkeleton() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className="m-3 hidden h-[calc(100vh-24px)] w-[272px] shrink-0 animate-pulse rounded-[26px] bg-muted/60 md:block" />
      <div className="flex-1 p-10">
        <div className="h-8 w-48 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { collapsed } = useNavigation();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar />
      <div
        className="flex min-w-0 flex-1 flex-col transition-[padding-left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:pl-(--sidebar-offset)"
        style={{ "--sidebar-offset": `${sidebarContentOffset(collapsed)}px` } as CSSProperties}
      >
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto pb-6">{children}</main>
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
        <Shell>{children}</Shell>
      </TooltipProvider>
    </NavigationProvider>
  );
}
