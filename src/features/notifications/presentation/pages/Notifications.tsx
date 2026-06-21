import React, { useMemo, useState } from "react"
import { Bell, Check, CheckCheck, Trash2, Filter, AlertTriangle, UserPlus, Briefcase, Cpu, MessageSquare, Settings as SettingsIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { ConfirmDeleteDialog, EmptyState } from "@/shared/components/crud"

type NType = "user" | "job" | "ai" | "system" | "message"
type Severity = "info" | "success" | "warning" | "error"
type Notif = { id: string; type: NType; severity: Severity; title: string; body: string; time: string; read: boolean; actionLabel?: string }

const typeIcon: Record<NType, React.ComponentType<{ className?: string }>> = {
  user: UserPlus, job: Briefcase, ai: Cpu, system: SettingsIcon, message: MessageSquare,
}

const sevColor: Record<Severity, string> = {
  info: "bg-blue-500/10 text-blue-600",
  success: "bg-emerald-500/10 text-emerald-600",
  warning: "bg-amber-500/10 text-amber-600",
  error: "bg-red-500/10 text-red-600",
}

const initial: Notif[] = [
  { id: "n1", type: "user", severity: "info", title: "New signup spike", body: "12 new users registered in the last hour from Cairo, EG.", time: "2m ago", read: false, actionLabel: "View users" },
  { id: "n2", type: "ai", severity: "warning", title: "AI latency above threshold", body: "claude-opus-4-7 average latency is 2.4s (target < 1.5s).", time: "18m ago", read: false, actionLabel: "Open AI logs" },
  { id: "n3", type: "job", severity: "success", title: "API sync completed", body: "LinkedIn Jobs synced 1,240 new postings.", time: "1h ago", read: false, actionLabel: "View jobs" },
  { id: "n4", type: "ai", severity: "error", title: "OpenAI rate limit hit", body: "3 chat sessions queued — quota refreshes in 4m.", time: "1h ago", read: true },
  { id: "n5", type: "message", severity: "info", title: "New support ticket", body: "Sara Smith reported a CV analysis failure.", time: "3h ago", read: true, actionLabel: "Open ticket" },
  { id: "n6", type: "system", severity: "warning", title: "Disk usage at 82%", body: "Storage approaching threshold on prod-db-01.", time: "Yesterday", read: false },
  { id: "n7", type: "user", severity: "info", title: "Admin invitation accepted", body: "Hala Said joined as Moderator.", time: "Yesterday", read: true },
  { id: "n8", type: "system", severity: "success", title: "Backup completed", body: "Nightly backup finished successfully (2.4GB).", time: "2d ago", read: true },
]

const filters = ["All", "Unread", "User", "Job", "AI", "System"] as const
type FilterKey = typeof filters[number]

export function Notifications() {
  const [items, setItems] = useState<Notif[]>(initial)
  const [filter, setFilter] = useState<FilterKey>("All")
  const [q, setQ] = useState("")
  const [toDelete, setToDelete] = useState<Notif | null>(null)
  const [clearAllOpen, setClearAllOpen] = useState(false)

  const [prefs, setPrefs] = useState({
    email: { newUsers: true, aiErrors: true, weeklyDigest: false, sourceDown: true },
    push: { newUsers: false, aiErrors: true, weeklyDigest: false, sourceDown: true },
  })

  const filtered = useMemo(() => items.filter(n => {
    if (q && !`${n.title} ${n.body}`.toLowerCase().includes(q.toLowerCase())) return false
    if (filter === "All") return true
    if (filter === "Unread") return !n.read
    return n.type === filter.toLowerCase()
  }), [items, filter, q])

  const unreadCount = items.filter(n => !n.read).length

  const markRead = (n: Notif) => setItems(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))
  const markAllRead = () => {
    if (unreadCount === 0) { toast.info("No unread notifications"); return }
    setItems(p => p.map(x => ({ ...x, read: true })))
    toast.success(`${unreadCount} notifications marked as read`)
  }
  const remove = () => {
    if (!toDelete) return
    setItems(p => p.filter(x => x.id !== toDelete.id))
    setToDelete(null); toast.success("Notification removed")
  }
  const clearAll = () => {
    if (items.length === 0) return
    setItems([]); setClearAllOpen(false); toast.success("All notifications cleared")
  }

  const togglePref = (group: "email" | "push", key: keyof typeof prefs.email) => {
    setPrefs(p => ({ ...p, [group]: { ...p[group], [key]: !p[group][key] } }))
  }

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={`w-10 h-5.5 rounded-full p-0.5 transition ${on ? "bg-[var(--primary)]" : "bg-[var(--muted)]"}`}>
      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
    </button>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Notifications
            {unreadCount > 0 && <Badge variant="default">{unreadCount} new</Badge>}
          </h1>
          <p className="text-[var(--muted-foreground)]">Activity, alerts, and system events.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" />Mark all read
          </Button>
          <Button variant="outline" onClick={() => setClearAllOpen(true)} disabled={items.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />Clear all
          </Button>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm relative">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search notifications..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${filter === f ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"}`}
              >
                {f}{f === "Unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={items.length === 0 ? "You're all caught up" : "No notifications match your filters"}
            description={items.length === 0 ? "New events will show up here." : "Try clearing the search or filter."}
          />
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {filtered.map(n => {
              const Icon = typeIcon[n.type]
              return (
                <li key={n.id} className={`flex items-start gap-3 p-4 transition ${n.read ? "" : "bg-[var(--primary)]/[0.03]"}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${sevColor[n.severity]}`}>
                    {n.severity === "error" ? <AlertTriangle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${n.read ? "" : "font-semibold"}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{n.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[var(--muted-foreground)]">{n.time}</span>
                      {n.actionLabel && <Button variant="link" className="h-auto p-0 text-xs">{n.actionLabel} →</Button>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!n.read && (
                      <Button variant="ghost" size="icon" title="Mark as read" onClick={() => markRead(n)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" title="Remove" onClick={() => setToDelete(n)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Notification preferences */}
      <Card>
        <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 font-medium">Event</th>
                <th className="text-center py-2 font-medium w-24"><div className="flex items-center justify-center gap-1"><Bell className="h-3.5 w-3.5" />Email</div></th>
                <th className="text-center py-2 font-medium w-24"><div className="flex items-center justify-center gap-1"><Bell className="h-3.5 w-3.5" />Push</div></th>
              </tr>
            </thead>
            <tbody>
              {([
                { key: "newUsers" as const, label: "New user signups", desc: "Alert when users register." },
                { key: "aiErrors" as const, label: "AI errors", desc: "When AI request error rate spikes." },
                { key: "sourceDown" as const, label: "API source down", desc: "When an external integration fails." },
                { key: "weeklyDigest" as const, label: "Weekly digest", desc: "Summary of platform activity." },
              ]).map(row => (
                <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-3">
                    <p className="font-medium">{row.label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{row.desc}</p>
                  </td>
                  <td className="text-center"><div className="flex justify-center"><Toggle on={prefs.email[row.key]} onClick={() => togglePref("email", row.key)} /></div></td>
                  <td className="text-center"><div className="flex justify-center"><Toggle on={prefs.push[row.key]} onClick={() => togglePref("push", row.key)} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <Button onClick={() => toast.success("Preferences saved")}>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Remove this notification?"
        description="It won't show up in your list anymore."
        onConfirm={remove}
      />

      <ConfirmDeleteDialog
        open={clearAllOpen}
        onOpenChange={setClearAllOpen}
        title="Clear all notifications?"
        description={`This will remove all ${items.length} notifications.`}
        onConfirm={clearAll}
      />
    </div>
  )
}
