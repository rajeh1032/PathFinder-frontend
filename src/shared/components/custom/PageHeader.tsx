import React from "react"
import { cn } from "@/shared/components/ui/utils"

export type PageHeaderProps = {
  title: string
  description?: string
  /** Right-aligned actions, for example buttons. */
  actions?: React.ReactNode
  className?: string
}

/** Standard page title block: heading, optional description, and actions. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{title}</h1>
        {description && <p className="text-sm text-[var(--muted-foreground)]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
