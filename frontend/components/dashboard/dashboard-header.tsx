"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, LogOut, Menu, Search, Settings } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { fetchCurrentUser } from "@/lib/user";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigation } from "@/components/dashboard/navigation-provider";

const NOTIFICATIONS = [
  {
    id: "1",
    title: "Company Knowledge refreshed",
    detail: "The AI re-learned your product positioning from new sources.",
  },
  {
    id: "2",
    title: "12 emails generated",
    detail: "Fresh outreach drafts are ready for review.",
  },
  {
    id: "3",
    title: "Weekly digest ready",
    detail: "Your outreach performance summary is in.",
  },
];

function nameFromEmail(email?: string) {
  if (!email) return "there";
  const handle = email.split("@")[0] ?? "there";
  return handle
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(" ");
}

export function DashboardHeader() {
  const router = useRouter();
  const { setMobileOpen } = useNavigation();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then((u) => setEmail(u.email))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await apiFetch("/api/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
  }

  const displayName = nameFromEmail(email ?? undefined);

  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-3 px-4 md:px-8">
      <div className="glass-panel-strong flex h-14 w-full items-center gap-3 rounded-full px-3 shadow-luxury md:gap-4 md:px-4">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground/70 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden"
        >
          <Menu className="size-[18px]" strokeWidth={1.75} />
        </button>

        <div className="hidden shrink-0 md:block">
          <Logo iconOnly />
        </div>

        <label className="relative flex min-w-0 flex-1 items-center">
          <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground/70" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search prospects, campaigns, knowledge…"
            className="h-10 w-full min-w-0 rounded-full bg-black/[0.03] px-10 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:bg-black/[0.05] dark:bg-white/5 dark:focus:bg-white/8"
          />
          <kbd className="absolute right-3 hidden rounded-md border border-border/70 bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/70 sm:block">
            ⌘K
          </kbd>
        </label>

        <div className="hidden items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold-strong lg:flex">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-60" />
            <span className="relative inline-flex size-full rounded-full bg-gold" />
          </span>
          AI Agent Active
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Notifications"
                className="relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground/70 outline-none transition-colors hover:bg-black/[0.04] focus-visible:ring-3 focus-visible:ring-ring/50 dark:hover:bg-white/6"
              >
                <Bell className="size-[18px]" strokeWidth={1.75} />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-gold ring-2 ring-card" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-80 p-2.5">
            <div className="px-2 py-2 text-sm font-semibold text-foreground">Notifications</div>
            <div className="flex flex-col gap-1">
              {NOTIFICATIONS.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex cursor-pointer gap-3 rounded-xl px-2.5 py-3 hover:bg-muted/60"
                >
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-gold" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Account menu"
                className="shrink-0 cursor-pointer rounded-full outline-none ring-offset-2 transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Avatar name={displayName} className="bg-gradient-to-br from-[#221a08] to-black text-gold ring-2 ring-gold/20" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-64">
            <div className="flex flex-col gap-0.5 px-2.5 py-2.5">
              <span className="text-sm font-semibold text-foreground">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground">{email ?? "…"}</span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/settings" />} className="cursor-pointer">
              <Settings />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout} className="cursor-pointer">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
