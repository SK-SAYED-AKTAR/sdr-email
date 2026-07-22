import { Mailbox, SearchX, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Mailbox className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">No generated emails yet.</p>
        <p className="text-sm text-muted-foreground">Upload a CSV to generate personalized outreach.</p>
      </div>
      <Button size="sm" className="mt-2" onClick={onUploadClick}>
        <UploadCloud className="size-4" />
        Upload CSV
      </Button>
    </div>
  );
}

export function NoResultsState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">No emails match your search.</p>
        <p className="text-sm text-muted-foreground">Try a different name, company, or filter.</p>
      </div>
      <Button size="sm" variant="outline" className="mt-2" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}
