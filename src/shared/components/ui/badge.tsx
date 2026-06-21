import * as React from "react"
import { cn } from "./button"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "match"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)] shadow hover:bg-[var(--primary)]/80": variant === "default",
          "border-transparent bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80": variant === "secondary",
          "border-transparent bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow hover:bg-[var(--destructive)]/80": variant === "destructive",
          "border-transparent bg-[var(--success)] text-[var(--success-foreground)] shadow hover:bg-[var(--success)]/80": variant === "success",
          "border-transparent bg-amber-500 text-white shadow hover:bg-amber-500/80": variant === "warning",
          "border-transparent bg-[var(--match)] text-[var(--match-foreground)] shadow hover:bg-[var(--match)]/80": variant === "match",
          "text-[var(--foreground)] border-[var(--border)]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
