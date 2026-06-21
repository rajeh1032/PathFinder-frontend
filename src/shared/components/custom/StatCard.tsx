import React from "react"
import { cn } from "@/shared/components/ui/utils"

export type StatCardProps = {
  label: string
  value: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  /** Optional trend, for example "+12%". */
  trend?: string
  trendTone?: "positive" | "negative" | "neutral"
  className?: string
}

const trendToneClass: Record<NonNullable<StatCardProps["trendTone"]>, string> = {
  positive: "text-[var(--success)]",
  negative: "text-[var(--destructive)]",
  neutral: "text-[var(--muted-foreground)]",
}

/** Compact metric card for dashboards and overviews. */
export function StatCard({ label, value, icon: Icon, trend, trendTone = "neutral", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">{label}</p>
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-[var(--foreground)]">{value}</p>
      {trend && <p className={cn("mt-1 text-xs font-medium", trendToneClass[trendTone])}>{trend}</p>}
    </div>
  )
}
