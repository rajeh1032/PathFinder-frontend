import React, { useMemo, useState } from "react"
import { Search, Download, Eye } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/shared/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { EmptyState } from "@/shared/components/crud"
import { exportCsv } from "@/shared/lib/csv"
import { PermissionButton } from "@/shared/lib/permissions"

type Action = "create" | "update" | "delete" | "publish" | "login" | "permission_change"
type Log = {
  id: string; admin: string; action: Action; module: string; targetType: string; targetId: string;
  ip: string; createdAt: string; oldData?: Record<string, unknown>; newData?: Record<string, unknown>
}

const actionColor: Record<Action, string> = {
  create: "bg-emerald-500/10 text-emerald-600",
  update: "bg-blue-500/10 text-blue-600",
  delete: "bg-red-500/10 text-red-600",
  publish: "bg-purple-500/10 text-purple-600",
  login: "bg-slate-500/10 text-slate-600",
  permission_change: "bg-amber-500/10 text-amber-600",
}

const initial: Log[] = [
  { id: "l1", admin: "Sarah Admin", action: "create", module: "Career Paths", targetType: "career_path", targetId: "cp_412", ip: "41.32.10.18", createdAt: "2026-05-31 09:14",
    newData: { title: "Senior Frontend Engineer", category: "Engineering", level: "Senior" } },
  { id: "l2", admin: "John Doe", action: "update", module: "API Sources", targetType: "api_source", targetId: "src_adzuna", ip: "102.40.1.4", createdAt: "2026-05-31 08:55",
    oldData: { rateLimit: 60 }, newData: { rateLimit: 120 } },
  { id: "l3", admin: "Hala Said", action: "delete", module: "Users", targetType: "user", targetId: "usr_2210", ip: "156.220.5.221", createdAt: "2026-05-30 22:01",
    oldData: { name: "Test User", email: "test@x.com" } },
  { id: "l4", admin: "Sarah Admin", action: "publish", module: "Videos", targetType: "video", targetId: "vid_88", ip: "41.32.10.18", createdAt: "2026-05-30 19:42",
    newData: { visibility: "public" } },
  { id: "l5", admin: "John Doe", action: "permission_change", module: "Roles", targetType: "role", targetId: "role_moderator", ip: "102.40.1.4", createdAt: "2026-05-30 18:11",
    oldData: { perms: ["jobs.review"] }, newData: { perms: ["jobs.review", "users.flag"] } },
  { id: "l6", admin: "Sarah Admin", action: "login", module: "Auth", targetType: "session", targetId: "sess_e91", ip: "41.32.10.18", createdAt: "2026-05-30 09:00" },
]

export function ActivityLogs() {
  const [items] = useState<Log[]>(initial)
  const [q, setQ] = useState("")
  const [admin, setAdmin] = useState("all")
  const [module, setModule] = useState("all")
  const [action, setAction] = useState("all")
  const [from, setFrom] = useState(""); const [to, setTo] = useState("")
  const [selected, setSelected] = useState<Log | null>(null)

  const admins = Array.from(new Set(items.map(i => i.admin)))
  const modules = Array.from(new Set(items.map(i => i.module)))

  const filtered = useMemo(() => items.filter(l => {
    if (q && !`${l.targetId} ${l.targetType}`.toLowerCase().includes(q.toLowerCase())) return false
    if (admin !== "all" && l.admin !== admin) return false
    if (module !== "all" && l.module !== module) return false
    if (action !== "all" && l.action !== action) return false
    if (from && l.createdAt < from) return false
    if (to && l.createdAt > to) return false
    return true
  }), [items, q, admin, module, action, from, to])

  const exportRows = () => {
    if (filtered.length === 0) return toast.info("No rows to export")
    exportCsv("activity-logs.csv", filtered.map(l => ({
      id: l.id, admin: l.admin, action: l.action, module: l.module,
      target_type: l.targetType, target_id: l.targetId, ip: l.ip, created_at: l.createdAt,
    })))
    toast.success("Exported activity logs")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-[var(--muted-foreground)]">Audit trail of every admin action.</p>
        </div>
        <PermissionButton permission="exports.run" variant="outline" onClick={exportRows}>
          <Download className="h-4 w-4 mr-2" />Export CSV
        </PermissionButton>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm">
        <div className="p-4 border-b border-[var(--border)] grid gap-3 md:grid-cols-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search target ID/type..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <Select value={admin} onValueChange={setAdmin}>
            <SelectTrigger><SelectValue placeholder="Admin" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All admins</SelectItem>
              {admins.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={module} onValueChange={setModule}>
            <SelectTrigger><SelectValue placeholder="Module" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modules</SelectItem>
              {modules.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {Object.keys(actionColor).map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2 md:col-span-6">
            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
            <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No log entries match your filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)]/40">
                <tr className="text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-[var(--muted)]/20">
                    <td className="px-4 py-3 font-medium">{l.admin}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${actionColor[l.action]}`}>{l.action}</span></td>
                    <td className="px-4 py-3"><Badge variant="secondary">{l.module}</Badge></td>
                    <td className="px-4 py-3 font-mono text-xs">{l.targetType}: {l.targetId}</td>
                    <td className="px-4 py-3 font-mono text-xs">{l.ip}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{l.createdAt}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" onClick={() => setSelected(l)}><Eye className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <SheetContent className="w-[480px] sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Audit detail</SheetTitle>
            <SheetDescription>{selected?.admin} • {selected?.action} • {selected?.module}</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4 px-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-[var(--muted-foreground)]">Target</p><p className="font-mono">{selected.targetType}:{selected.targetId}</p></div>
                <div><p className="text-xs text-[var(--muted-foreground)]">IP</p><p className="font-mono">{selected.ip}</p></div>
                <div className="col-span-2"><p className="text-xs text-[var(--muted-foreground)]">When</p><p>{selected.createdAt}</p></div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)] mb-2">Old data</p>
                <pre className="bg-[var(--muted)]/40 rounded-md p-3 text-xs overflow-auto max-h-48">{selected.oldData ? JSON.stringify(selected.oldData, null, 2) : "—"}</pre>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)] mb-2">New data</p>
                <pre className="bg-[var(--muted)]/40 rounded-md p-3 text-xs overflow-auto max-h-48">{selected.newData ? JSON.stringify(selected.newData, null, 2) : "—"}</pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
