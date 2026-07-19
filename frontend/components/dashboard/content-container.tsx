import type { ReactNode } from "react";

export function ContentContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">{children}</div>;
}
