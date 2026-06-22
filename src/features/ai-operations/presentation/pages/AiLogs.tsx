import React, { useEffect, useState } from "react"
import { Search, AlertTriangle, CheckCircle2, XCircle, Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { ApiError } from "@/core/api/api-client"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { DataState } from "@/shared/components/custom"
import { DetailsModal, ConfirmDeleteDialog, RowActions } from "@/shared/components/crud"
import { exportCsv } from "@/shared/lib/csv"
import { useAiLogs } from "../../application/useAiLogs"
import { aiLogsApi } from "../../data/ai-logs.api"
import type { AiLog, AiLogDetail, AiLogStatus } from "../../domain/ai-logs.types"

type Mode = "none" | "view" | "delete" | "clear"

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

/** ai_logs.status is success | failed; render a matching icon. */
const StatusIcon = ({ s }: { s: string | null }) =>
  s === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
  s === "failed" ? <XCircle className="h-4 w-4 text-red-500" /> :
  <AlertTriangle className="h-4 w-4 text-amber-500" />

/** Format latency_ms into a compact human string. */
function formatLatency(ms: number | null): string {
  if (ms == null) return "—"
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`
}

/** Format the numeric/string cost column into a dollar string. */
function formatCost(cost: number | string | null): string {
  if (cost == null) return "—"
  const value = typeof cost === "string" ? Number(cost) : cost
  if (Number.isNaN(value)) return "—"
  return `$${value.toFixed(4)}`
}

function formatTokens(tokens: number | null): string {
  return tokens == null ? "—" : tokens.toLocaleString()
}

export function AiLogs() {
  const logs = useAiLogs()
  const { items, pagination, isLoading, error, stats, statsLoading } = logs

  const [mode, setMode] = useState<Mode>("none")
  const [selected, setSelected] = useState<AiLog | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [detail, setDetail] = useState<AiLogDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const close = () => {
    setMode("none")
    setSelected(null)
    setDetail(null)
  }

  // Load full prompt/response when opening the details modal.
  useEffect(() => {
    if (mode !== "view" || !selected) return
    let active = true
    setDetailLoading(true)
    setDetail(null)
    aiLogsApi
      .getById(selected.id)
      .then((data) => {
        if (active) setDetail(data)
      })
      .catch((err) => {
        if (active) toast.error(errorMessage(err, "Failed to load log details"))
      })
      .finally(() => {
        if (active) setDetailLoading(false)
      })
    return () => {
      active = false
    }
  }, [mode, selected])

  const del = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      await logs.removeLog(selected.id)
      toast.success("Log entry deleted")
      close()
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete log"))
    } finally {
      setSubmitting(false)
    }
  }

  const clearAll = async () => {
    setSubmitting(true)
    try {
      await logs.clearLogs()
      toast.success("Logs cleared")
      close()
    } catch (err) {
      toast.error(errorMessage(err, "Failed to clear logs"))
    } finally {
      setSubmitting(false)
    }
  }

  const statCards = [
    {
      label: "Requests (today)",
      value: statsLoading ? "…" : (stats?.totalRequests ?? 0).toLocaleString(),
    },
    {
      label: "Tokens (today)",
      value: statsLoading ? "…" : (stats?.totalTokens ?? 0).toLocaleString(),
    },
    {
      label: "Avg. Latency",
      value: statsLoading ? "…" : formatLatency(stats?.avgLatencyMs ?? null),
    },
    {
      label: "Error Rate",
      value: statsLoading ? "…" : `${stats?.errorRate ?? 0}%`,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Logs</h1>
          <p className="text-[var(--muted-foreground)]">Token usage, latency, and errors per AI request.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (items.length === 0) return
              exportCsv("ai-logs.csv", items as unknown as Record<string, unknown>[])
              toast.success("Exported AI logs CSV")
            }}
          >
            <Download className="mr-2 h-4 w-4" />Export CSV
          </Button>
          <Button variant="outline" onClick={() => setMode("clear")}>Clear Logs</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
            <p className="text-sm text-[var(--muted-foreground)]">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search by feature or model..."
              className="pl-9"
              value={logs.search}
              onChange={(e) => logs.setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
            value={logs.status || "all"}
            onChange={(e) => logs.setStatus(e.target.value === "all" ? "" : (e.target.value as AiLogStatus))}
          >
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => { logs.setSearch(""); logs.setStatus(""); logs.refetch() }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <DataState
          isLoading={isLoading}
          error={error}
          isEmpty={items.length === 0}
          onRetry={logs.refetch}
          loadingLabel="Loading AI logs..."
          empty={{
            title: "No log entries",
            description: logs.search || logs.status ? "Try a different search or filter." : "Logs will appear here as AI requests run.",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Feature</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((l) => (
                <TableRow key={l.id}>
                  <TableCell><StatusIcon s={l.status} /></TableCell>
                  <TableCell className="text-xs text-[var(--muted-foreground)] font-mono">{l.created_at ? l.created_at.replace("T", " ").slice(0, 19) : "—"}</TableCell>
                  <TableCell className="text-xs font-mono">{l.model ?? "—"}</TableCell>
                  <TableCell>{l.feature ? <Badge variant="secondary">{l.feature}</Badge> : <span className="text-[var(--muted-foreground)]">—</span>}</TableCell>
                  <TableCell className="text-sm font-mono">{formatTokens(l.tokens_used)}</TableCell>
                  <TableCell className="text-sm">{formatLatency(l.latency_ms)}</TableCell>
                  <TableCell className="text-sm font-medium">{formatCost(l.cost)}</TableCell>
                  <TableCell>
                    <RowActions onView={() => { setSelected(l); setMode("view") }} onDelete={() => { setSelected(l); setMode("delete") }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataState>

        {!isLoading && !error && items.length > 0 && (
          <div className="p-4 border-t border-[var(--border)] flex items-center justify-between text-sm">
            <p className="text-[var(--muted-foreground)]">
              Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} logs
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPreviousPage}
                onClick={() => pagination.previousPage && logs.setPage(pagination.previousPage)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => pagination.nextPage && logs.setPage(pagination.nextPage)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <DetailsModal open={mode === "view"} onOpenChange={(v) => !v && close()} title="Log Entry">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <StatusIcon s={selected.status} />
              <p className="font-mono text-xs">{selected.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>Time: <span className="font-mono text-xs">{selected.created_at ? selected.created_at.replace("T", " ").slice(0, 19) : "—"}</span></div>
              <div>Status: <span className="font-medium">{selected.status ?? "—"}</span></div>
              <div>Model: <span className="font-mono text-xs">{selected.model ?? "—"}</span></div>
              <div>Feature: {selected.feature ? <Badge variant="secondary">{selected.feature}</Badge> : "—"}</div>
              <div>Tokens Used: <span className="font-medium">{formatTokens(selected.tokens_used)}</span></div>
              <div>Latency: <span className="font-medium">{formatLatency(selected.latency_ms)}</span></div>
              <div>Cost: <span className="font-medium">{formatCost(selected.cost)}</span></div>
              <div>User: <span className="font-mono text-xs">{selected.user_id ?? "—"}</span></div>
            </div>

            {selected.error_message && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                <p className="font-medium mb-1">Error</p>
                <p>{selected.error_message}</p>
              </div>
            )}

            <div className="pt-2 border-t border-[var(--border)] space-y-3">
              {detailLoading ? (
                <p className="text-[var(--muted-foreground)]">Loading prompt and response…</p>
              ) : detail ? (
                <>
                  {detail.prompt && (
                    <div>
                      <p className="font-medium mb-1">Prompt</p>
                      <pre className="max-h-40 overflow-auto rounded-md bg-[var(--muted)] p-3 text-xs whitespace-pre-wrap break-words">{detail.prompt}</pre>
                    </div>
                  )}
                  {detail.response && (
                    <div>
                      <p className="font-medium mb-1">Response</p>
                      <pre className="max-h-40 overflow-auto rounded-md bg-[var(--muted)] p-3 text-xs whitespace-pre-wrap break-words">{detail.response}</pre>
                    </div>
                  )}
                  {!detail.prompt && !detail.response && (
                    <p className="text-[var(--muted-foreground)]">No prompt/response recorded for this entry.</p>
                  )}
                </>
              ) : null}
            </div>
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog
        open={mode === "delete"}
        onOpenChange={(v) => !v && close()}
        title="Delete this log entry?"
        description="This removes the AI log record permanently."
        onConfirm={del}
        loading={submitting}
      />

      <ConfirmDeleteDialog
        open={mode === "clear"}
        onOpenChange={(v) => !v && close()}
        title="Clear all AI logs?"
        description="This permanently deletes every AI log record. This action cannot be undone."
        onConfirm={clearAll}
        loading={submitting}
      />
    </div>
  )
}
