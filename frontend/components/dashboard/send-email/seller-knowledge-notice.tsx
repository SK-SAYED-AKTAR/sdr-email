import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SellerKnowledgeNotice() {
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-warning/20 bg-warning/10 px-4 py-3 text-sm sm:flex-row sm:items-center">
      <div className="flex items-start gap-2.5">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-warning" />
        <div>
          <p className="font-medium text-foreground">Set up your Company Knowledge first</p>
          <p className="text-muted-foreground">
            The AI needs to know what you sell before it can write emails that actually pitch something specific
            — otherwise every email comes out generic.
          </p>
        </div>
      </div>
      <Button size="sm" nativeButton={false} render={<Link href="/dashboard/settings" />} className="shrink-0">
        Set Up Company Knowledge
      </Button>
    </div>
  );
}
