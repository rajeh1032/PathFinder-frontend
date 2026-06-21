import React, { useMemo, useState } from "react"
import { Search, AlertTriangle, CheckCircle2, XCircle, Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { DetailsModal, ConfirmDeleteDialog, RowActions, EmptyState, useCrud } from "@/shared/components/crud"
import { exportCsv } from "@/shared/lib/csv"

type Log = { id: string; time: string; model: string; endpoint: string; feature: string; tokensIn: number; tokensOut: number; latency: string; status: "ok" | "warn" | "error"; cost: string; errorMessage?: string }

const initial: Log[] = [
  { id: "AI-9842", time: "2026-05-31 09:18:24", model: "claude-opus-4-7", endpoint: "/v1/messages", feature: "Career Chat", tokensIn: 4120, tokensOut: 820, latency: "1.4s", status: "ok", cost: "$0.082" },
  { id: "AI-9841", time: "2026-05-31 09:18:11", model: "claude-sonnet-4-6", endpoint: "/v1/messages", feature: "CV Analysis", tokensIn: 8240, tokensOut: 1240, latency: "2.1s", status: "ok", cost: "$0.061" },
  { id: "AI-9840", time: "2026-05-31 09:17:55", model: "claude-haiku-4-5", endpoint: "/v1/messages", feature: "Job Match", tokensIn: 2120, tokensOut: 320, latency: "0.6s", status: "ok", cost: "$0.012" },
  { id: "AI-9839", time: "2026-05-31 09:17:40", model: "claude-opus-4-7", endpoint: "/v1/messages", feature: "Cover Letter", tokensIn: 3210, tokensOut: 920, latency: "1.8s", status: "warn", cost: "$0.071", errorMessage: "Slow response (>1.5s threshold)" },
  { id: "AI-9838", time: "2026-05-31 09:17:22", model: "claude-sonnet-4-6", endpoint: "/v1/messages", feature: "Interview", tokensIn: 5240, tokensOut: 1810, latency: "3.2s", status: "ok", cost: "$0.092" },
  { id: "AI-9837", time: "2026-05-31 09:16:48", model: "claude-opus-4-7", endpoint: "/v1/messages", feature: "Career Chat", tokensIn: 1820, tokensOut: 0, latency: "0.3s", status: "error", cost: "$0.000", errorMessage: "Rate limit exceeded (429)" },
]

const StatusIcon = ({ s }: { s: string }) =>
  s === "ok" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
  s === "warn" ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <XCircle className="h-4 w-4 text-red-500" />

export function AiLogs() {
  const c = useCrud<Log>(initial)
  const [q, setQ] = useState("")
  const filtered = useMemo(() => c.items.filter(l => !q || l.id.toLowerCase().includes(q.toLowerCase()) || l.feature.toLowerCase().includes(q.toLowerCase()) || l.model.toLowerCase().includes(q.toLowerCase())), [c.items, q])

  const clearAll = () => {
    if (filtered.length === 0) return
    c.setItems([]); toast.success("Logs cleared")
  }

  const del = () => {
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(x => x.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Log entry deleted")
    }, 150)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Logs</h1>
          <p className="text-[var(--muted-foreground)]">Token usage, latency, and errors per AI request.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { exportCsv("ai-logs.csv", c.items); toast.success("Exported AI logs CSV") }}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          <Button variant="outline" onClick={clearAll}>Clear Logs</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Requests Today", value: "24,890", sub: "+8% vs yesterday" },
          { label: "Tokens Today", value: "18.2M", sub: "+11%" },
          { label: "Avg. Latency", value: "1.4s", sub: "stable" },
          { label: "Error Rate", value: "0.4%", sub: "-0.1%" },
        ].map(s => (
          <div key={s.label} className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
            <p className="text-sm text-[var(--muted-foreground)]">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search logs..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No log entries" description={q ? "Try a different search." : "Logs will appear here as AI requests run."} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Status</TableHead><TableHead>ID</TableHead><TableHead>Time</TableHead><TableHead>Model</TableHead><TableHead>Feature</TableHead><TableHead>Tokens</TableHead><TableHead>Latency</TableHead><TableHead>Cost</TableHead><TableHead className="w-[50px]" /></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(l => (
                <TableRow key={l.id}>
                  <TableCell><StatusIcon s={l.status} /></TableCell>
                  <TableCell className="font-mono text-xs">{l.id}</TableCell>
                  <TableCell className="text-xs text-[var(--muted-foreground)] font-mono">{l.time}</TableCell>
                  <TableCell className="text-xs font-mono">{l.model}</TableCell>
                  <TableCell><Badge variant="secondary">{l.feature}</Badge></TableCell>
                  <TableCell className="text-sm font-mono">{l.tokensIn.toLocaleString()} / {l.tokensOut.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{l.latency}</TableCell>
                  <TableCell className="text-sm font-medium">{l.cost}</TableCell>
                  <TableCell><RowActions onView={() => c.open("view", l)} onDelete={() => c.open("delete", l)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <DetailsModal open={c.mode === "view"} onOpenChange={v => !v && c.close()} title="Log Entry">
        {c.selected && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <StatusIcon s={c.selected.status} />
              <p className="font-mono">{c.selected.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>Time: <span className="font-mono text-xs">{c.selected.time}</span></div>
              <div>Endpoint: <span className="font-mono text-xs">{c.selected.endpoint}</span></div>
              <div>Model: <span className="font-mono text-xs">{c.selected.model}</span></div>
              <div>Feature: <Badge variant="secondary">{c.selected.feature}</Badge></div>
              <div>Tokens In: <span className="font-medium">{c.selected.tokensIn.toLocaleString()}</span></div>
              <div>Tokens Out: <span className="font-medium">{c.selected.tokensOut.toLocaleString()}</span></div>
              <div>Latency: <span className="font-medium">{c.selected.latency}</span></div>
              <div>Cost: <span className="font-medium">{c.selected.cost}</span></div>
            </div>
            {c.selected.errorMessage && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                <p className="font-medium mb-1">Error</p>
                <p>{c.selected.errorMessage}</p>
              </div>
            )}
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title={`Delete log ${c.selected?.id}?`} onConfirm={del} loading={c.loading} />
    </div>
  )
}
