"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { ContentContainer } from "@/components/dashboard/content-container";
import { Button } from "@/components/ui/button";
import { UploadCsvDialog } from "@/components/dashboard/send-email/upload-csv-dialog";
import { TableToolbar } from "@/components/dashboard/send-email/table-toolbar";
import { EmailTable } from "@/components/dashboard/send-email/email-table";
import { EmailPreviewModal } from "@/components/dashboard/send-email/email-preview-modal";
import { BulkActionBar } from "@/components/dashboard/send-email/bulk-action-bar";
import { EmptyState, NoResultsState } from "@/components/dashboard/send-email/empty-state";
import { TableLoadingSkeleton } from "@/components/dashboard/send-email/loading-skeleton";
import { SellerKnowledgeNotice } from "@/components/dashboard/seller-knowledge-notice";
import { ErrorBanner } from "@/components/error-banner";
import { useProspects } from "@/hooks/use-prospects";
import { apiFetch } from "@/lib/api";
import type { Prospect } from "@/lib/prospects";
import type { SellerKnowledgeProfile } from "@/lib/seller-knowledge";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export default function SendEmailPage() {
  const router = useRouter();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewProspect, setPreviewProspect] = useState<Prospect | null>(null);
  const [sellerKnowledge, setSellerKnowledge] = useState<SellerKnowledgeProfile | null>(null);

  useEffect(() => {
    apiFetch<SellerKnowledgeProfile>("/api/seller-knowledge")
      .then(setSellerKnowledge)
      .catch(() => {});
  }, []);

  const needsSellerKnowledge = sellerKnowledge !== null && !sellerKnowledge.knowledge;

  function handleUploadClick() {
    if (needsSellerKnowledge) {
      toast("Set up your Company Knowledge first so the AI knows what to pitch.");
      router.push("/dashboard/settings");
      return;
    }
    setUploadOpen(true);
  }

  const {
    data,
    loading,
    error,
    page,
    setPage,
    searchInput,
    setSearchInput,
    status,
    setStatus,
    sort,
    order,
    toggleSort,
    refetch,
  } = useProspects();

  useEffect(() => {
    setSelected(new Set());
  }, [page, status, sort, order]);

  const isFiltered = searchInput.trim() !== "" || status !== "all";

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (!data) return;
    setSelected((prev) => {
      const pageIds = data.items.map((p) => p.id);
      const allSelected = pageIds.every((id) => prev.has(id));
      const next = new Set(prev);
      pageIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }

  function clearFilters() {
    setSearchInput("");
    setStatus("all");
  }

  return (
    <ContentContainer>
      <div className="space-y-10">
        <PageHeader
          title="Send Email"
          subtitle="Email sending functionality will be available soon."
          actions={
            <>
              <Button
                variant="outline"
                nativeButton={false}
                render={<a href={`${BACKEND_URL}/api/csv/sample`} download />}
              >
                <Download className="size-4" />
                Download Sample CSV
              </Button>
              <Button onClick={handleUploadClick}>
                <UploadCloud className="size-4" />
                Upload CSV
              </Button>
            </>
          }
        />

        {needsSellerKnowledge && <SellerKnowledgeNotice />}

        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Generated Emails</h2>
            <p className="text-sm text-muted-foreground">
              Review every AI-generated email before it goes out.
            </p>
          </div>

          {error && <ErrorBanner message={error} />}

          {!error && (
            <>
              <TableToolbar
                search={searchInput}
                onSearchChange={setSearchInput}
                status={status}
                onStatusChange={setStatus}
              />

              {loading && !data ? (
                <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
                  <TableLoadingSkeleton />
                </div>
              ) : data && data.items.length > 0 ? (
                <EmailTable
                  data={data}
                  sort={sort}
                  order={order}
                  onToggleSort={toggleSort}
                  page={page}
                  onPageChange={setPage}
                  selected={selected}
                  onToggleRow={toggleRow}
                  onToggleAll={toggleAll}
                  onPreview={setPreviewProspect}
                />
              ) : (
                <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
                  {isFiltered ? (
                    <NoResultsState onClear={clearFilters} />
                  ) : (
                    <EmptyState onUploadClick={handleUploadClick} />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <UploadCsvDialog
        open={uploadOpen}
        onOpenChange={(next) => {
          setUploadOpen(next);
          if (!next) refetch();
        }}
      />

      <EmailPreviewModal
        prospect={previewProspect}
        open={previewProspect !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewProspect(null);
        }}
        onUpdated={refetch}
      />

      <BulkActionBar
        selectedIds={Array.from(selected)}
        onClear={() => setSelected(new Set())}
        onRegenerated={refetch}
        onSent={refetch}
      />
    </ContentContainer>
  );
}
