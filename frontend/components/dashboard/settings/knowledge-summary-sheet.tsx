"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import type { SellerKnowledgeEnvelope } from "@/lib/seller-knowledge";

export function KnowledgeSummarySheet({
  open,
  onOpenChange,
  knowledge,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledge: SellerKnowledgeEnvelope | null;
}) {
  if (!knowledge) return null;
  const { data } = knowledge;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Knowledge Summary</SheetTitle>
          <SheetDescription>How the AI currently understands your company and product.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          <Section title="Company Summary" text={data.company_summary} />
          <Section title="Product Summary" text={data.product_summary} />
          <Section title="Core Features" items={data.core_features} />
          <Section title="Ideal Customer Profile" items={data.ideal_customer_profile} />
          <Section title="Business Problems Solved" items={data.business_problems_solved} />
          <Section title="Value Propositions" items={data.value_propositions} />
          <Section title="Competitive Advantages" items={data.competitive_advantages} />
          <Section title="Recommended Sales Pitch" text={data.recommended_pitch} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, text, items }: { title: string; text?: string; items?: string[] }) {
  const isEmpty = text
    ? !text.trim() || text.trim().toLowerCase() === "unknown"
    : !items || items.length === 0;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      {isEmpty ? (
        <p className="text-sm text-muted-foreground">Unknown</p>
      ) : text ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
      ) : (
        <ul className="space-y-1.5">
          {items!.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
