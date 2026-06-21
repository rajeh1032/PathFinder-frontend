import React from "react"
import { CheckCircle2, AlertTriangle, Clock, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet"
import { EmptyState } from "@/shared/components/crud"

type Run = {
  id: string
  apiSourceId: string
  provider: string
  startedAt: string
  finishedAt: string | null
  status: "success" | "failed" | "running"
  jobsAdded: number
  jobsUpdated: number
  errorMessage: string | null
}

const seed: Run[] = [
  { id: "sr_201", apiSourceId: "src_1", provider: "Adzuna",   startedAt: "2026-05-31 09:30:00", finishedAt: "2026-05-31 09:31:42", status: "success", jobsAdded: 124, jobsUpdated: 38, errorMessage: null },
  { id: "sr_202", apiSourceId: "src_2", provider: "JSearch",  startedAt: "2026-05-31 09:35:00", finishedAt: "2026-05-31 09:35:18", status: "failed",  jobsAdded: 0,   jobsUpdated: 0,  errorMessage: "401 Unauthorized — invalid api key" },
  { id: "sr_203", apiSourceId: "src_3", provider: "Remotive", startedAt: "2026-05-31 09:40:00", finishedAt: "2026-05-31 09:40:55", status: "success", jobsAdded: 47,  jobsUpdated: 12, errorMessage: null },
  { id: "sr_204", apiSourceId: "src_1", provider: "Adzuna",   startedAt: "2026-05-31 10:30:00", finishedAt: null,                  status: "running", jobsAdded: 0,   jobsUpdated: 0,  errorMessage: null },
]

function durationOf(r: Run): string {
  if (!r.finishedAt) return "—"
  const ms = new Date(r.finishedAt).getTime() - new Date(r.startedAt).getTime()
  const s = Math.round(ms / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}

export function ApiSyncRuns() {
  const [runs] = React.useState<Run[]>(seed)
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<string>("all")
  const [open, setOpen] = React.useState<Run | null>(null)

  const filtered = runs.filter(r =>
    (status === "all" || r.status === status) &&
    (!search || r.provider.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API Sync History</h1>
        <p className="text-[var(--muted-foreground)]">Per-run history from external job API sources.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Input placeholder="Search provider..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-10"><EmptyState title="No sync runs" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)]/40">
                <tr>
                  {["Provider", "Started At", "Finished At", "Duration", "Status", "Jobs Added", "Jobs Updated"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--muted-foreground)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map(r => (
                  <tr key={r.id} onClick={() => setOpen(r)} className="hover:bg-[var(--muted)]/30 cursor-pointer">
                    <td className="px-4 py-3 font-medium">{r.provider}</td>
                    <td className="px-4 py-3">{r.startedAt}</td>
                    <td className="px-4 py-3">{r.finishedAt ?? "—"}</td>
                    <td className="px-4 py-3">{durationOf(r)}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">{r.jobsAdded}</td>
                    <td className="px-4 py-3">{r.jobsUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!open} onOpenChange={o => !o && setOpen(null)}>
        <SheetContent className="w-[480px] sm:max-w-[480px]">
          <SheetHeader><SheetTitle>{open?.provider} — Sync Run</SheetTitle></SheetHeader>
          {open && (
            <div className="mt-6 space-y-4 text-sm">
              <Field label="Status"><StatusBadge status={open.status} /></Field>
              <Field label="Started At" value={open.startedAt} />
              <Field label="Finished At" value={open.finishedAt ?? "—"} />
              <Field label="Duration" value={durationOf(open)} />
              <Field label="Jobs Added" value={String(open.jobsAdded)} />
              <Field label="Jobs Updated" value={String(open.jobsUpdated)} />
              <div>
                <p className="text-[var(--muted-foreground)] mb-1">Errors</p>
                {open.errorMessage ? (
                  <div className="p-3 rounded-md bg-red-500/10 text-red-600 text-sm">{open.errorMessage}</div>
                ) : <p>None</p>}
              </div>
              <div>
                <p className="text-[var(--muted-foreground)] mb-1">Logs</p>
                <pre className="text-xs bg-[var(--muted)]/40 p-3 rounded-md overflow-auto">
{`[${open.startedAt}] starting sync for ${open.provider}
[${open.startedAt}] fetching page 1
[${open.startedAt}] processed 50 records
[${open.finishedAt ?? "..."}] finished with status=${open.status}`}
                </pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function StatusBadge({ status }: { status: Run["status"] }) {
  if (status === "success") return <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" />Success</Badge>
  if (status === "failed")  return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Failed</Badge>
  return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Running</Badge>
}

function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-2 last:border-0">
      <span className="text-[var(--muted-foreground)]">{label}</span>
      <span className="font-medium text-right">{children ?? value}</span>
    </div>
  )
}
