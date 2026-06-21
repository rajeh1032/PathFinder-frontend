import React, { useMemo, useState } from "react"
import { Search, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { DetailsModal, ConfirmDeleteDialog, RowActions, EmptyState, useCrud } from "@/shared/components/crud"

type Session = { id: string; user: string; topic: string; messages: number; tokens: number; model: string; duration: string; status: "Resolved" | "Active" | "Abandoned"; date: string }

const initial: Session[] = [
  { id: "CHT-2041", user: "Ahmed Hassan", topic: "Career switch advice", messages: 24, tokens: 8420, model: "claude-opus-4-7", duration: "12m", status: "Resolved", date: "2026-05-31 09:14" },
  { id: "CHT-2040", user: "Sara Smith", topic: "Resume keywords", messages: 18, tokens: 6150, model: "claude-sonnet-4-6", duration: "9m", status: "Resolved", date: "2026-05-31 08:50" },
  { id: "CHT-2039", user: "John Doe", topic: "Interview prep — UX", messages: 32, tokens: 10240, model: "claude-opus-4-7", duration: "21m", status: "Active", date: "2026-05-31 09:22" },
  { id: "CHT-2038", user: "Emily Chen", topic: "Salary negotiation", messages: 14, tokens: 4820, model: "claude-haiku-4-5", duration: "7m", status: "Resolved", date: "2026-05-31 08:18" },
  { id: "CHT-2037", user: "Ali Mahmoud", topic: "Roadmap for Python", messages: 9, tokens: 2410, model: "claude-haiku-4-5", duration: "4m", status: "Abandoned", date: "2026-05-31 07:42" },
]

export function ChatSessions() {
  const c = useCrud<Session>(initial)
  const [q, setQ] = useState("")
  const filtered = useMemo(() => c.items.filter(s => !q || s.user.toLowerCase().includes(q.toLowerCase()) || s.topic.toLowerCase().includes(q.toLowerCase())), [c.items, q])

  const endSession = (s: Session) => {
    c.setItems(p => p.map(x => x.id === s.id ? { ...x, status: "Resolved" as const } : x))
    toast.success(`Session ${s.id} closed`)
  }

  const del = () => {
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(x => x.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Session deleted")
    }, 200)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chat Sessions</h1>
          <p className="text-[var(--muted-foreground)]">AI advisor conversations across the platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Sessions Today", value: "1,420" }, { label: "Active Now", value: "82" },
          { label: "Avg. Duration", value: "9m 41s" }, { label: "Tokens Used", value: "4.2M" },
        ].map(s => (
          <div key={s.label} className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
            <p className="text-sm text-[var(--muted-foreground)]">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search sessions..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No sessions found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Session</TableHead><TableHead>User</TableHead><TableHead>Topic</TableHead><TableHead>Messages</TableHead><TableHead>Tokens</TableHead><TableHead>Model</TableHead><TableHead>Status</TableHead><TableHead className="w-[50px]" /></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell className="font-medium">{s.user}</TableCell>
                  <TableCell><div className="flex items-center gap-1.5 text-sm"><MessageSquare className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />{s.topic}</div></TableCell>
                  <TableCell className="text-sm">{s.messages}</TableCell>
                  <TableCell className="text-sm">{s.tokens.toLocaleString()}</TableCell>
                  <TableCell className="text-xs font-mono text-[var(--muted-foreground)]">{s.model}</TableCell>
                  <TableCell><Badge variant={s.status === "Resolved" ? "success" : s.status === "Active" ? "default" : "secondary"}>{s.status}</Badge></TableCell>
                  <TableCell>
                    <RowActions
                      onView={() => c.open("view", s)}
                      onDelete={() => c.open("delete", s)}
                      extra={s.status === "Active" ? [{ label: "End session", onClick: () => endSession(s) }] : []}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <DetailsModal open={c.mode === "view"} onOpenChange={v => !v && c.close()} title="Chat Session">
        {c.selected && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg">{c.selected.id}</p>
              <Badge variant={c.selected.status === "Resolved" ? "success" : c.selected.status === "Active" ? "default" : "secondary"}>{c.selected.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>User: <span className="font-medium">{c.selected.user}</span></div>
              <div>Topic: <span className="font-medium">{c.selected.topic}</span></div>
              <div>Messages: <span className="font-medium">{c.selected.messages}</span></div>
              <div>Tokens: <span className="font-medium">{c.selected.tokens.toLocaleString()}</span></div>
              <div>Model: <span className="font-mono text-xs">{c.selected.model}</span></div>
              <div>Duration: <span className="font-medium">{c.selected.duration}</span></div>
              <div className="col-span-2">Started: <span className="text-[var(--muted-foreground)]">{c.selected.date}</span></div>
            </div>
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title={`Delete session ${c.selected?.id}?`} onConfirm={del} loading={c.loading} />
    </div>
  )
}
