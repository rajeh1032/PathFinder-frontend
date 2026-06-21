import React from "react"
import { AlertTriangle, X } from "lucide-react"

export function MaintenanceBanner({ enabled, message }: { enabled: boolean; message?: string }) {
  const [open, setOpen] = React.useState(true)
  if (!enabled || !open) return null
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-700 dark:text-amber-300 px-6 py-2 flex items-center gap-3 text-sm">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="flex-1">{message || "Maintenance window in progress — some actions may be delayed."}</span>
      <button onClick={() => setOpen(false)} className="opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  )
}

export function RateLimitBanner({ visible, onRetry }: { visible: boolean; onRetry?: () => void }) {
  if (!visible) return null
  return (
    <div className="bg-red-500/10 border-b border-red-500/30 text-red-700 dark:text-red-300 px-6 py-2 flex items-center gap-3 text-sm">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="flex-1">Rate limit exceeded — AI features are temporarily throttled.</span>
      {onRetry && <button onClick={onRetry} className="underline font-medium">Retry</button>}
    </div>
  )
}
