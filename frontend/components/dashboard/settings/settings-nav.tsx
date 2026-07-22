"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard/settings", label: "Company Knowledge" },
  { href: "/dashboard/settings/account", label: "Account" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-6 border-b border-border">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative pb-3 text-sm font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {active && <span className="absolute inset-x-0 -bottom-px h-px bg-primary" />}
          </Link>
        );
      })}
    </div>
  );
}
