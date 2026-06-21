import React, { useState } from "react"
import { Plus, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { FormModal, DetailsModal, ConfirmDeleteDialog, RowActions, EmptyState, Field, useCrud } from "@/shared/components/crud"

type Source = { id: string; name: string; type: string; endpoint: string; status: "Healthy" | "Degraded" | "Down"; lastSync: string; jobsToday: number; apiKey?: string }

const initial: Source[] = [
  { id: "1", name: "LinkedIn Jobs", type: "Job Feed", endpoint: "api.linkedin.com/v2/jobs", status: "Healthy", lastSync: "2026-05-31 09:00", jobsToday: 1240 },
  { id: "2", name: "Indeed Partner API", type: "Job Feed", endpoint: "api.indeed.com/partner", status: "Healthy", lastSync: "2026-05-31 08:45", jobsToday: 980 },
  { id: "3", name: "Glassdoor", type: "Job Feed", endpoint: "api.glassdoor.com/api", status: "Degraded", lastSync: "2026-05-31 06:12", jobsToday: 320 },
  { id: "4", name: "Wuzzuf", type: "Job Feed", endpoint: "api.wuzzuf.net/v1/jobs", status: "Healthy", lastSync: "2026-05-31 09:10", jobsToday: 410 },
  { id: "5", name: "OpenAI", type: "AI Provider", endpoint: "api.openai.com/v1", status: "Healthy", lastSync: "2026-05-31 09:15", jobsToday: 0 },
  { id: "6", name: "Anthropic", type: "AI Provider", endpoint: "api.anthropic.com/v1", status: "Healthy", lastSync: "2026-05-31 09:14", jobsToday: 0 },
  { id: "7", name: "RemoteOK", type: "Job Feed", endpoint: "remoteok.com/api", status: "Down", lastSync: "2026-05-30 22:18", jobsToday: 0 },
]

const empty = { name: "", type: "Job Feed", endpoint: "", status: "Healthy" as Source["status"], apiKey: "" }

export function ApiSources() {
  const c = useCrud<Source>(initial)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [syncing, setSyncing] = useState<string | null>(null)

  const submit = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Required"
    if (!form.endpoint.trim()) e.endpoint = "Required"
    setErrors(e); if (Object.keys(e).length) return
    c.setLoading(true)
    setTimeout(() => {
      const now = new Date().toISOString().slice(0, 16).replace("T", " ")
      if (c.mode === "create") {
        c.setItems(p => [{ ...form, id: String(Date.now()), lastSync: "Never", jobsToday: 0 }, ...p])
        toast.success("Source added")
      } else if (c.selected) {
        c.setItems(p => p.map(s => s.id === c.selected!.id ? { ...s, ...form, lastSync: now } : s))
        toast.success("Source updated")
      }
      c.setLoading(false); c.close()
    }, 300)
  }

  const sync = (s: Source) => {
    setSyncing(s.id)
    setTimeout(() => {
      const now = new Date().toISOString().slice(0, 16).replace("T", " ")
      c.setItems(p => p.map(x => x.id === s.id ? { ...x, lastSync: now, status: "Healthy" } : x))
      setSyncing(null); toast.success(`Synced ${s.name}`)
    }, 800)
  }

  const syncAll = () => {
    setSyncing("all")
    setTimeout(() => { setSyncing(null); toast.success("All sources synced") }, 1200)
  }

  const del = () => {
    if (c.selected && (c.selected.status === "Healthy" || c.selected.status === "Degraded") && c.selected.jobsToday > 0) {
      toast.error("Cannot delete an active source that's currently used by jobs — disconnect first.")
      c.close(); return
    }
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(s => s.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Source removed")
    }, 200)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Sources</h1>
          <p className="text-[var(--muted-foreground)]">External integrations for jobs and AI providers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncAll} disabled={syncing === "all"}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing === "all" ? "animate-spin" : ""}`} />Sync All
          </Button>
          <Button onClick={() => { setForm(empty); setErrors({}); c.open("create") }}><Plus className="mr-2 h-4 w-4" />Add Source</Button>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        {c.items.length === 0 ? (
          <EmptyState title="No API sources" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Source</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Last Sync</TableHead><TableHead>Jobs Today</TableHead><TableHead className="w-[50px]" /></TableRow>
            </TableHeader>
            <TableBody>
              {c.items.map(s => (
                <TableRow key={s.id}>
                  <TableCell><div><p className="font-medium">{s.name}</p><p className="text-xs text-[var(--muted-foreground)] font-mono">{s.endpoint}</p></div></TableCell>
                  <TableCell><Badge variant="secondary">{s.type}</Badge></TableCell>
                  <TableCell><div className="flex items-center gap-1.5">{s.status === "Healthy" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}<Badge variant={s.status === "Healthy" ? "success" : s.status === "Degraded" ? "warning" : "destructive"}>{s.status}</Badge></div></TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">{s.lastSync}</TableCell>
                  <TableCell className="text-sm font-medium">{s.jobsToday.toLocaleString()}</TableCell>
                  <TableCell>
                    <RowActions
                      onView={() => c.open("view", s)}
                      onEdit={() => { setForm({ name: s.name, type: s.type, endpoint: s.endpoint, status: s.status, apiKey: s.apiKey ?? "" }); setErrors({}); c.open("edit", s) }}
                      onDelete={() => c.open("delete", s)}
                      extra={[{ label: syncing === s.id ? "Syncing..." : "Sync now", onClick: () => sync(s), icon: <RefreshCw className={`h-4 w-4 ${syncing === s.id ? "animate-spin" : ""}`} /> }]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <FormModal open={c.mode === "create" || c.mode === "edit"} onOpenChange={v => !v && c.close()} title={c.mode === "create" ? "Add API Source" : "Edit Source"} onSubmit={submit} loading={c.loading}>
        <Field label="Name" error={errors.name}><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option>Job Feed</option><option>AI Provider</option><option>Webhook</option>
            </select>
          </Field>
          <Field label="Status">
            <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Source["status"] })}>
              <option>Healthy</option><option>Degraded</option><option>Down</option>
            </select>
          </Field>
        </div>
        <Field label="Endpoint" error={errors.endpoint}><Input placeholder="api.example.com/v1" value={form.endpoint} onChange={e => setForm({ ...form, endpoint: e.target.value })} /></Field>
        <Field label="API Key" hint="Stored encrypted; leave blank to keep existing."><Input type="password" value={form.apiKey ?? ""} onChange={e => setForm({ ...form, apiKey: e.target.value })} /></Field>
      </FormModal>

      <DetailsModal open={c.mode === "view"} onOpenChange={v => !v && c.close()} title="Source Details">
        {c.selected && (
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-lg">{c.selected.name}</p>
            <p className="font-mono text-xs text-[var(--muted-foreground)]">{c.selected.endpoint}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>Type: <Badge variant="secondary">{c.selected.type}</Badge></div>
              <div>Status: <Badge variant={c.selected.status === "Healthy" ? "success" : c.selected.status === "Degraded" ? "warning" : "destructive"}>{c.selected.status}</Badge></div>
              <div>Last Sync: <span className="font-medium">{c.selected.lastSync}</span></div>
              <div>Jobs Today: <span className="font-medium">{c.selected.jobsToday.toLocaleString()}</span></div>
            </div>
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title={`Disconnect "${c.selected?.name}"?`} description="This integration will stop syncing immediately." onConfirm={del} loading={c.loading} />
    </div>
  )
}
