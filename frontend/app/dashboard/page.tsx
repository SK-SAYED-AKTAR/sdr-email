import { PageHeader } from "@/components/dashboard/page-header";
import { ContentContainer } from "@/components/dashboard/content-container";

export default function DashboardHomePage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Welcome Back"
        subtitle="Welcome to your AI Sales Intelligence Platform."
      />
    </ContentContainer>
  );
}
