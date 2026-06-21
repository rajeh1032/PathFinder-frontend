import React from "react"
import { cn } from "@/shared/components/ui/utils"

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral"

export type StatusBadgeProps = {
  children: React.ReactNode
  tone?: StatusTone
  className?: string
}

const toneClass: Record<StatusTone, string> = {
  success: "bg-[var(--success)]/10 text-[var(--success)]",
  warning: "bg-amber-500/10 text-amber-600",
  danger: "bg-[var(--destructive)]/10 text-[var(--destructive)]",
  info: "bg-[var(--primary)]/10 text-[var(--primary)]",
  neutral: "bg-[var(--muted)] text-[var(--muted-foreground)]",
}

/** Small pill that communicates a status with a semantic tone. */
export function StatusBadge({ children, tone = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
