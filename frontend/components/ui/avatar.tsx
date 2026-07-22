import { cn } from "@/lib/utils"

function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  return (
    <div
      data-slot="avatar"
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground",
        className
      )}
    >
      {initials || "?"}
    </div>
  )
}

export { Avatar }
