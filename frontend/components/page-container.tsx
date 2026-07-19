import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--primary),transparent_95%),var(--background)_60%)] p-4">
      {children}
    </div>
  );
}
