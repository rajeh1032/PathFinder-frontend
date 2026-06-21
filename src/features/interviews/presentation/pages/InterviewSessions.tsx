import React, { useMemo, useState } from "react"
import { Search, Mic, Play } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { DetailsModal, ConfirmDeleteDialog, RowActions, EmptyState, useCrud } from "@/shared/components/crud"

type Interview = { id: string; user: string; role: string; type: string; questions: number; score: number; duration: string; status: "Completed" | "In Progress"; date: string }

const initial: Interview[] = [
  { id: "INT-3021", user: "Ahmed Hassan", role: "Frontend Dev", type: "Behavioral", questions: 8, score: 82, duration: "28m", status: "Completed", date: "2026-05-31 09:00" },
  { id: "INT-3020", user: "Sara Smith", role: "Data Scientist", type: "Technical", questions: 12, score: 91, duration: "42m", status: "Completed", date: "2026-05-31 08:15" },
  { id: "INT-3019", user: "John Doe", role: "UX Designer", type: "Portfolio Review", questions: 6, score: 74, duration: "32m", status: "Completed", date: "2026-05-30 18:40" },
  { id: "INT-3018", user: "Emily Chen", role: "Backend Dev", type: "System Design", questions: 4, score: 0, duration: "18m", status: "In Progress", date: "2026-05-31 09:21" },
  { id: "INT-3017", user: "Layla Khaled", role: "Frontend Dev", type: "Behavioral", questions: 8, score: 68, duration: "26m", status: "Completed", date: "2026-05-30 16:05" },
]

const scoreColor = (s: number) => s >= 85 ? "text-emerald-600" : s >= 70 ? "text-blue-600" : s >= 50 ? "text-amber-600" : "text-red-600"

export function InterviewSessions() {
  const c = useCrud<Interview>(initial)
  const [q, setQ] = useState("")
  const filtered = useMemo(() => c.items.filter(s => !q || s.user.toLowerCase().includes(q.toLowerCase()) || s.role.toLowerCase().includes(q.toLowerCase())), [c.items, q])

  const replay = (s: Interview) => toast.info(`Loading replay for ${s.id}...`)

  const del = () => {
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(x => x.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Interview deleted")
    }, 200)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interview Sessions</h1>
          <p className="text-[var(--muted-foreground)]">AI mock interview history and performance scores.</p>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search interviews..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No interviews found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Session</TableHead><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Type</TableHead><TableHead>Questions</TableHead><TableHead>Score</TableHead><TableHead>Status</TableHead><TableHead className="w-[80px]" /></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell className="font-medium">{s.user}</TableCell>
                  <TableCell className="text-sm">{s.role}</TableCell>
                  <TableCell><div className="flex items-center gap-1.5 text-sm"><Mic className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />{s.type}</div></TableCell>
                  <TableCell className="text-sm">{s.questions}</TableCell>
                  <TableCell>{s.status === "Completed" ? <span className={`font-bold ${scoreColor(s.score)}`}>{s.score}%</span> : <span className="text-[var(--muted-foreground)] text-sm">—</span>}</TableCell>
                  <TableCell><Badge variant={s.status === "Completed" ? "success" : "warning"}>{s.status}</Badge></TableCell>
                  <TableCell>
                    <RowActions
                      onView={() => c.open("view", s)}
                      onDelete={() => c.open("delete", s)}
                      extra={s.status === "Completed" ? [{ label: "Replay", onClick: () => replay(s), icon: <Play className="h-4 w-4" /> }] : []}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <DetailsModal open={c.mode === "view"} onOpenChange={v => !v && c.close()} title="Interview Session">
        {c.selected && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg">{c.selected.id}</p>
              <Badge variant={c.selected.status === "Completed" ? "success" : "warning"}>{c.selected.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>Candidate: <span className="font-medium">{c.selected.user}</span></div>
              <div>Role: <span className="font-medium">{c.selected.role}</span></div>
              <div>Type: <span className="font-medium">{c.selected.type}</span></div>
              <div>Questions: <span className="font-medium">{c.selected.questions}</span></div>
              <div>Duration: <span className="font-medium">{c.selected.duration}</span></div>
              {c.selected.status === "Completed" && <div>Score: <span className={`font-bold ${scoreColor(c.selected.score)}`}>{c.selected.score}%</span></div>}
              <div className="col-span-2">Date: <span className="text-[var(--muted-foreground)]">{c.selected.date}</span></div>
            </div>
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title={`Delete ${c.selected?.id}?`} onConfirm={del} loading={c.loading} />
    </div>
  )
}
