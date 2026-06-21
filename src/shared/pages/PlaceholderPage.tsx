import React from "react"
import { Construction } from "lucide-react"

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
        <Construction className="w-8 h-8" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-[var(--muted-foreground)] mt-2 max-w-md">
          This section is currently under construction. Please check back later.
        </p>
      </div>
    </div>
  )
}
