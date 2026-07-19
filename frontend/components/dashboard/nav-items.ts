import { House, Send, ChartColumn, Settings, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/dashboard/send-email", label: "Send Email", icon: Send },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartColumn },
];

export const SETTINGS_ITEM: NavItem = {
  href: "/dashboard/settings",
  label: "Settings",
  icon: Settings,
};
