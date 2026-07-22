import { Sparkle } from "lucide-react";

export function Logo({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#1c1a17] to-black shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_6px_16px_-6px_rgb(0_0_0/0.5)]">
        <div className="absolute inset-0 rounded-[11px] ring-1 ring-gold/25" />
        <Sparkle className="size-4 fill-gold text-gold" strokeWidth={1.5} />
      </div>
      {!iconOnly && (
        <span className="overflow-hidden text-[15px] font-semibold whitespace-nowrap tracking-tight text-foreground">
          SDR<span className="text-gold">.</span>ai
        </span>
      )}
    </div>
  );
}
