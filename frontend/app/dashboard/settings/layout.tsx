import type { ReactNode } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { ContentContainer } from "@/components/dashboard/content-container";
import { SettingsNav } from "@/components/dashboard/settings/settings-nav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <ContentContainer>
      <div className="space-y-6">
        <PageHeader title="Settings" subtitle="Manage your account and application preferences." />
        <SettingsNav />
        {children}
      </div>
    </ContentContainer>
  );
}
