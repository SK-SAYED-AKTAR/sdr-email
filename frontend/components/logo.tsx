import { Mail } from "lucide-react";

export function Logo({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Mail className="size-4" />
      </div>
      {!iconOnly && (
        <span className="overflow-hidden text-sm font-semibold whitespace-nowrap tracking-tight">
          SDR Email
        </span>
      )}
    </div>
  );
}
