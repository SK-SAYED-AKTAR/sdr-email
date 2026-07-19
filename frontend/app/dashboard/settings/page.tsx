import { PageHeader } from "@/components/dashboard/page-header";
import { ContentContainer } from "@/components/dashboard/content-container";

export default function SettingsPage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and application preferences."
      />
    </ContentContainer>
  );
}
