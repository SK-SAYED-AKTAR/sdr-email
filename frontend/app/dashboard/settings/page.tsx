"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import type { SellerKnowledgeProfile } from "@/lib/seller-knowledge";
import { CompanyInfoCard } from "@/components/dashboard/settings/company-info-card";
import { KnowledgeSourcesCard } from "@/components/dashboard/settings/knowledge-sources-card";
import { KnowledgeStatusCard } from "@/components/dashboard/settings/knowledge-status-card";

export default function CompanyKnowledgePage() {
  const [profile, setProfile] = useState<SellerKnowledgeProfile | null>(null);

  const refetch = useCallback(async () => {
    const data = await apiFetch<SellerKnowledgeProfile>("/api/seller-knowledge");
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (profile?.status !== "GENERATING") return;
    const interval = setInterval(refetch, 1500);
    return () => clearInterval(interval);
  }, [profile?.status, refetch]);

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const editingDisabled = profile.status === "GENERATING";

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight">Company Knowledge</h2>
        <p className="text-sm text-muted-foreground">
          Give the AI everything it needs to understand your company and product before it researches prospects.
        </p>
      </div>

      <CompanyInfoCard profile={profile} disabled={editingDisabled} onSaved={refetch} />
      <KnowledgeSourcesCard profile={profile} disabled={editingDisabled} onChange={refetch} />
      <KnowledgeStatusCard profile={profile} onGenerated={refetch} />
    </div>
  );
}
