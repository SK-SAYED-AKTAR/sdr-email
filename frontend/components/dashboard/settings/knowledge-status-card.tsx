"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { apiFetch, ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loading-button";
import { ErrorBanner } from "@/components/error-banner";
import { SuccessCard } from "@/components/success-card";
import { KnowledgeSummarySheet } from "@/components/dashboard/settings/knowledge-summary-sheet";
import type { SellerKnowledgeProfile } from "@/lib/seller-knowledge";

export function KnowledgeStatusCard({
  profile,
  onGenerated,
}: {
  profile: SellerKnowledgeProfile;
  onGenerated: () => void;
}) {
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const prevStatus = useRef(profile.status);

  useEffect(() => {
    if (prevStatus.current === "GENERATING" && profile.status === "COMPLETED") {
      setJustCompleted(true);
    }
    prevStatus.current = profile.status;
  }, [profile.status]);

  const generating = profile.status === "GENERATING";

  async function handleGenerate() {
    setStartError(null);
    setJustCompleted(false);
    setStarting(true);
    try {
      await apiFetch("/api/seller-knowledge/generate", { method: "POST" });
      onGenerated();
    } catch (err) {
      setStartError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>AI Knowledge Status</CardTitle>
          <CardDescription>What the AI currently understands about your company.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {startError && <ErrorBanner message={startError} />}
          {profile.status === "FAILED" && profile.failure_reason && (
            <ErrorBanner message={`Last generation attempt failed: ${profile.failure_reason}`} />
          )}

          {generating && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Loader2 className="size-6 animate-spin text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Generating company knowledge...</p>
                <p className="text-xs text-muted-foreground">This usually takes under a minute.</p>
              </div>
            </div>
          )}

          {!generating && !profile.knowledge && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Sparkles className="size-5" />
              </div>
              <p className="text-sm text-muted-foreground">No company knowledge has been generated yet.</p>
            </div>
          )}

          {!generating && profile.knowledge && (
            <div className="space-y-4">
              {justCompleted && (
                <SuccessCard
                  title="Generated successfully"
                  description={`${profile.sources_processed ?? 0} source${profile.sources_processed === 1 ? "" : "s"} analyzed · ${Math.round(
                    (profile.confidence ?? 0) * 100
                  )}% confidence`}
                />
              )}

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                <StatusItem
                  label="Last generated"
                  value={profile.generated_at ? formatDateTime(profile.generated_at) : "—"}
                />
                <StatusItem
                  label="Confidence"
                  value={profile.confidence != null ? `${Math.round(profile.confidence * 100)}%` : "—"}
                />
                <StatusItem label="Sources processed" value={profile.sources_processed?.toString() ?? "—"} />
                <StatusItem label="AI model" value={profile.model_name ?? "—"} />
                <StatusItem label="Prompt version" value={profile.prompt_version ?? "—"} />
              </dl>

              <Button variant="outline" size="sm" onClick={() => setSummaryOpen(true)}>
                View Knowledge Summary
              </Button>
            </div>
          )}

          <LoadingButton size="lg" className="w-full" loading={starting} disabled={generating} onClick={handleGenerate}>
            Generate Company Knowledge
          </LoadingButton>
        </CardContent>
      </Card>

      <KnowledgeSummarySheet open={summaryOpen} onOpenChange={setSummaryOpen} knowledge={profile.knowledge} />
    </>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium">{value}</dd>
    </div>
  );
}
