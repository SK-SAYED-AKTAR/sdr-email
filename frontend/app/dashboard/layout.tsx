import type { ReactNode } from "react";
import { AppLayout } from "@/components/dashboard/app-layout";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
