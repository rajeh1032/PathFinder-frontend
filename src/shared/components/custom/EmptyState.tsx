import React from "react"
import { Inbox } from "lucide-react"
import { cn } from "@/shared/components/ui/utils"

export type EmptyStateProps = {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
  className?: string
}

/** Friendly placeholder shown when a collection has no items. */
export function EmptyState({
  title = "Nothing here yet",
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-16 text-center", className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)]">
        <Icon className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <p className="font-medium text-[var(--foreground)]">{title}</p>
        {description && <p className="text-sm text-[var(--muted-foreground)]">{description}</p>}
      </div>
      {action}
    </div>
  )
}
