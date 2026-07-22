"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ErrorBanner } from "@/components/error-banner";
import { SuccessCard } from "@/components/success-card";
import { FileDropzone } from "@/components/file-dropzone";

type UploadResult = { id: string; filename: string; row_count: number };

type ProspectProgress = {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  status: string;
  failure_reason: string | null;
};

type UploadProgress = {
  id: string;
  filename: string;
  total: number;
  counts: Record<string, number>;
  prospects: ProspectProgress[];
};

type Phase = "idle" | "uploading" | "processing" | "done";

const STAGES: { key: string; label: string }[] = [
  { key: "RESEARCHING", label: "Researching companies" },
  { key: "ANALYZING_OPPORTUNITY", label: "Analyzing business opportunity" },
  { key: "GENERATING_EMAIL", label: "Generating emails" },
];

async function countCsvRows(file: File): Promise<number> {
  const text = await file.text();
  const lines = text.split(/\r\n|\n|\r/).filter((line) => line.trim().length > 0);
  return Math.max(lines.length - 1, 0);
}

function stageState(progress: UploadProgress, stageIndex: number): "done" | "active" | "pending" {
  const stageKeys = STAGES.map((s) => s.key);
  const beforeOrAt = stageKeys.slice(0, stageIndex + 1);
  const stillToPass = beforeOrAt.reduce((sum, key) => sum + (progress.counts[key] ?? 0), 0);
  const pendingCount = progress.counts.PENDING ?? 0;

  if (progress.counts[stageKeys[stageIndex]] > 0) return "active";
  if (stillToPass + pendingCount === 0) return "done";
  return "pending";
}

export function UploadCsvDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upload, setUpload] = useState<UploadResult | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  useEffect(() => {
    if (!open) {
      setPhase("idle");
      setFile(null);
      setRowCount(null);
      setError(null);
      setUpload(null);
      setProgress(null);
    }
  }, [open]);

  useEffect(() => {
    if (phase !== "processing" || !upload) return;

    const interval = setInterval(async () => {
      try {
        const data = await apiFetch<UploadProgress>(`/api/csv/uploads/${upload.id}/progress`);
        setProgress(data);
        const done = (data.counts.COMPLETED ?? 0) + (data.counts.FAILED ?? 0);
        if (done === data.total) {
          setPhase("done");
        }
      } catch {
        // transient network hiccup while polling — try again on the next tick
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [phase, upload]);

  const handleFile = useCallback(async (selected: File) => {
    setError(null);

    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a .csv file.");
      return;
    }

    setFile(selected);
    setRowCount(await countCsvRows(selected));
    setPhase("uploading");

    try {
      const formData = new FormData();
      formData.append("file", selected);
      const result = await apiFetch<UploadResult>("/api/csv/upload", { method: "POST", body: formData });
      setUpload(result);
      setPhase("processing");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setPhase("idle");
    }
  }, []);

  const total = progress?.total ?? rowCount ?? 0;
  const done = progress ? (progress.counts.COMPLETED ?? 0) + (progress.counts.FAILED ?? 0) : 0;
  const failed = progress?.counts.FAILED ?? 0;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload prospect CSV</DialogTitle>
          <DialogDescription>
            {phase === "idle" && "Drag and drop your CSV, or browse to select one."}
            {phase === "uploading" && "Uploading your file..."}
            {phase === "processing" && "Researching prospects and generating outreach."}
            {phase === "done" && "Processing complete."}
          </DialogDescription>
        </DialogHeader>

        {phase === "idle" && (
          <div className="space-y-3">
            {error && <ErrorBanner message={error} />}
            <FileDropzone
              accept=".csv"
              supportedLabel="Supported file type: CSV"
              onFiles={(files) => handleFile(files[0])}
            />
          </div>
        )}

        {phase === "uploading" && file && (
          <div className="space-y-4 py-2">
            <div className="space-y-1 text-sm">
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {rowCount} row{rowCount === 1 ? "" : "s"} detected
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Uploading CSV...
            </div>
          </div>
        )}

        {(phase === "processing" || phase === "done") && progress && (
          <div className="space-y-4 py-2">
            <div className="space-y-1 text-sm">
              <p className="font-medium">{progress.filename}</p>
              <p className="text-xs text-muted-foreground">
                {progress.total} row{progress.total === 1 ? "" : "s"}
              </p>
            </div>

            <Progress value={percent} />

            <ul className="space-y-2">
              {STAGES.map((stage, i) => {
                const state = stageState(progress, i);
                return (
                  <li key={stage.key} className="flex items-center gap-2 text-sm">
                    {state === "done" && <div className="size-1.5 shrink-0 rounded-full bg-success" />}
                    {state === "active" && <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />}
                    {state === "pending" && <div className="size-1.5 shrink-0 rounded-full bg-border" />}
                    <span
                      className={cn(
                        state === "pending" ? "text-muted-foreground" : "text-foreground",
                        state === "done" && "text-muted-foreground"
                      )}
                    >
                      {stage.label}
                    </span>
                  </li>
                );
              })}
            </ul>

            {phase === "done" && (
              <SuccessCard
                title="Completed"
                description={
                  failed > 0
                    ? `${done - failed} of ${total} processed successfully. ${failed} failed.`
                    : `All ${total} prospect${total === 1 ? "" : "s"} processed successfully.`
                }
              />
            )}

            {phase === "done" && failed > 0 && (
              <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-border bg-muted/30 p-2">
                {progress.prospects
                  .filter((p) => p.status === "FAILED")
                  .map((p) => (
                    <p key={p.id} className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{p.company_name}</span>
                      {p.failure_reason ? ` — ${p.failure_reason}` : ""}
                    </p>
                  ))}
              </div>
            )}

            {phase === "done" && (
              <Button className="w-full" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
