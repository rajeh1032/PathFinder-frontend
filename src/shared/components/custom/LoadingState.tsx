import { Loader2 } from "lucide-react"
import { cn } from "@/shared/components/ui/utils"

export type LoadingStateProps = {
  label?: string
  className?: string
}

/** Centered spinner for async content regions. */
export function LoadingState({ label = "Loading...", className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center justify-center gap-3 py-16 text-[var(--muted-foreground)]", className)}
    >
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
