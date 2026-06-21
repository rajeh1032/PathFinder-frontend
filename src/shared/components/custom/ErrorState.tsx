import { AlertTriangle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/components/ui/utils"

export type ErrorStateProps = {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

/** Error placeholder with an optional retry action. */
export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center justify-center gap-3 py-16 text-center", className)}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--destructive)]/10 text-[var(--destructive)]">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <p className="font-medium text-[var(--foreground)]">{title}</p>
        <p className="max-w-md text-sm text-[var(--muted-foreground)]">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
