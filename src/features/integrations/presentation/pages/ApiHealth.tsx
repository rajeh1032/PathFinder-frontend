import React, { useState } from "react"
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

type Status = "healthy" | "degraded" | "down"
type Service = {
  id: string; name: string; status: Status; lastSuccess: string; lastFailure: string; error?: string; latencyMs: number
}

const initial: Service[] = [
  { id: "gemini", name: "Gemini API (chat / completions)", status: "healthy", lastSuccess: "2026-05-31 09:42", lastFailure: "2026-05-30 14:01", latencyMs: 820 },
  { id: "gemini-emb", name: "Gemini Embeddings", status: "degraded", lastSuccess: "2026-05-31 09:38", lastFailure: "2026-05-31 09:39", error: "Intermittent 429 rate limits", latencyMs: 1450 },
  { id: "adzuna", name: "Adzuna Jobs", status: "healthy", lastSuccess: "2026-05-31 09:30", lastFailure: "2026-05-28 22:15", latencyMs: 410 },
  { id: "jsearch", name: "JSearch (RapidAPI)", status: "down", lastSuccess: "2026-05-30 23:00", lastFailure: "2026-05-31 09:41", error: "Connection timeout (10s)", latencyMs: 0 },
  { id: "remotive", name: "Remotive Jobs", status: "healthy", lastSuccess: "2026-05-31 09:12", lastFailure: "—", latencyMs: 290 },
]

const statusBadge: Record<Status, { label: string; cls: string; icon: React.ReactNode }> = {
  healthy: { label: "Healthy", cls: "bg-emerald-500/10 text-emerald-600", icon: <CheckCircle2 className="h-4 w-4" /> },
  degraded: { label: "Degraded", cls: "bg-amber-500/10 text-amber-600", icon: <AlertTriangle className="h-4 w-4" /> },
  down: { label: "Down", cls: "bg-red-500/10 text-red-600", icon: <XCircle className="h-4 w-4" /> },
}

export function ApiHealth() {
  const [services, setServices] = useState<Service[]>(initial)
  const [retrying, setRetrying] = useState<string | null>(null)

  const retry = (s: Service) => {
    setRetrying(s.id)
    setTimeout(() => {
      const ok = Math.random() > 0.3
      setServices(prev => prev.map(x => x.id === s.id ? {
        ...x, status: ok ? "healthy" : "down",
        lastSuccess: ok ? new Date().toISOString().replace("T", " ").slice(0, 16) : x.lastSuccess,
        lastFailure: ok ? x.lastFailure : new Date().toISOString().replace("T", " ").slice(0, 16),
        error: ok ? undefined : "Connection refused",
        latencyMs: ok ? 200 + Math.round(Math.random() * 400) : 0,
      } : x))
      setRetrying(null)
      toast[ok ? "success" : "error"](ok ? `${s.name} is healthy` : `${s.name} still failing`)
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API Health</h1>
        <p className="text-[var(--muted-foreground)]">Monitor external integrations and connection status.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map(s => (
          <Card key={s.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">{s.name}</CardTitle>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Avg latency: {s.latencyMs > 0 ? `${s.latencyMs}ms` : "—"}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${statusBadge[s.status].cls}`}>
                {statusBadge[s.status].icon}{statusBadge[s.status].label}
              </span>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Last success" value={s.lastSuccess} />
              <Row label="Last failure" value={s.lastFailure} />
              {s.error && (
                <div className="rounded-md bg-red-500/10 text-red-700 dark:text-red-300 px-3 py-2 text-xs flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{s.error}</span>
                </div>
              )}
              <Button
                variant="outline" size="sm" className="w-full"
                onClick={() => retry(s)} disabled={retrying === s.id}
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-2 ${retrying === s.id ? "animate-spin" : ""}`} />
                Retry connection
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">{label}</span><span className="font-medium">{value}</span></div>
}
