"use client";

import { useState } from "react";
import { FileText, Loader2, X } from "lucide-react";

import { apiFetch, ApiError } from "@/lib/api";
import { formatDate, formatFileSize } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileDropzone } from "@/components/file-dropzone";
import { ErrorBanner } from "@/components/error-banner";
import type { SellerKnowledgeProfile } from "@/lib/seller-knowledge";

export function KnowledgeSourcesCard({
  profile,
  disabled,
  onChange,
}: {
  profile: SellerKnowledgeProfile;
  disabled?: boolean;
  onChange: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: File[]) {
    setError(null);
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        await apiFetch("/api/seller-knowledge/documents", { method: "POST", body: formData });
      }
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      await apiFetch(`/api/seller-knowledge/documents/${id}`, { method: "DELETE" });
      onChange();
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Sources</CardTitle>
        <CardDescription>
          Upload a pitch deck, product brochure, documentation, one-pager, sales deck, or case study.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <ErrorBanner message={error} />}

        {!disabled && (
          <FileDropzone
            accept=".pdf,.docx,.txt,.md"
            supportedLabel="PDF, DOCX, TXT, or Markdown"
            multiple
            onFiles={handleFiles}
          />
        )}

        {uploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Uploading...
          </div>
        )}

        {profile.documents.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {profile.documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.file_size)} · {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(doc.id)}
                    disabled={removingId === doc.id}
                    aria-label={`Remove ${doc.filename}`}
                    className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {removingId === doc.id ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
