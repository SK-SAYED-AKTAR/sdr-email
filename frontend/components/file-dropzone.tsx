"use client";

import { useRef, useState } from "react";
import { FileUp, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function FileDropzone({
  accept,
  supportedLabel,
  multiple = false,
  onFiles,
  className,
}: {
  accept: string;
  supportedLabel: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  className?: string;
}) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length) onFiles(multiple ? files : [files[0]]);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
        dragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <UploadCloud className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Drag & drop your file{multiple ? "s" : ""} here</p>
        <p className="text-xs text-muted-foreground">{supportedLabel}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
        <FileUp className="size-4" />
        Browse files
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
