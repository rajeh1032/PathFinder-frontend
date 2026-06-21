import React, { useMemo, useState } from "react"
import { Search, Filter, Zap, RefreshCw, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { DetailsModal, ConfirmDeleteDialog, RowActions, EmptyState, useCrud } from "@/shared/components/crud"

type Match = { id: string; user: string; job: string; company: string; score: number; missing: string; aiReason: string; date: string }

const initial: Match[] = [
  { id: "1", user: "Ahmed Hassan", job: "Frontend Dev", company: "TechNova", score: 92, missing: "Redux", aiReason: "Strong React skills, missing state management.", date: "Today" },
  { id: "2", user: "Sara Smith", job: "Data Analyst", company: "GlobalData", score: 85, missing: "Tableau", aiReason: "Good Python, needs BI tool experience.", date: "Yesterday" },
  { id: "3", user: "Emily Chen", job: "Backend Dev", company: "ServerPro", score: 98, missing: "None", aiReason: "Perfect match across all requirements.", date: "2d ago" },
  { id: "4", user: "John Doe", job: "UI/UX Designer", company: "Creative Minds", score: 65, missing: "Figma prototyping, Framer", aiReason: "Has basic UI skills but lacks advanced tooling.", date: "3d ago" },
]

export function JobMatches() {
  const c = useCrud<Match>(initial)
  const [q, setQ] = useState("")
  const [recomputing, setRecomputing] = useState(false)

  const filtered = useMemo(() => c.items.filter(m => !q || m.user.toLowerCase().includes(q.toLowerCase()) || m.job.toLowerCase().includes(q.toLowerCase())), [c.items, q])

  const recompute = () => {
    setRecomputing(true)
    setTimeout(() => { setRecomputing(false); toast.success("Matches recomputed") }, 1500)
  }

  const notify = (m: Match) => toast.success(`Notification sent to ${m.user}`)

  const del = () => {
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(x => x.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Match removed")
    }, 200)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Matches</h1>
          <p className="text-[var(--muted-foreground)]">AI-generated matches between users and jobs.</p>
        </div>
        <Button variant="outline" onClick={recompute} disabled={recomputing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${recomputing ? "animate-spin" : ""}`} />Recompute Matches
        </Button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search matches..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Score</Button>
            <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Career Path</Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No matches found" description={q ? "Try a different search." : "Recompute matches to populate this list."} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>User</TableHead><TableHead>Job & Company</TableHead><TableHead>Match Score</TableHead><TableHead>Missing Skills</TableHead><TableHead>AI Analysis</TableHead><TableHead className="w-[50px]" /></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.user}</TableCell>
                  <TableCell><div className="flex flex-col"><span className="font-medium">{m.job}</span><span className="text-xs text-[var(--muted-foreground)]">{m.company}</span></div></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--match)]" style={{ width: `${m.score}%` }} />
                      </div>
                      <span className="font-bold text-[var(--match)] text-sm">{m.score}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{m.missing === "None" ? <Badge variant="success">Perfect Match</Badge> : <span className="text-sm text-[var(--destructive)]">{m.missing}</span>}</TableCell>
                  <TableCell><div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]"><Zap className="h-3 w-3 text-[var(--tertiary)]" /><span className="truncate max-w-[200px]">{m.aiReason}</span></div></TableCell>
                  <TableCell>
                    <RowActions
                      onView={() => c.open("view", m)}
                      onDelete={() => c.open("delete", m)}
                      extra={[{ label: "Notify user", onClick: () => notify(m), icon: <Send className="h-4 w-4" /> }]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <DetailsModal open={c.mode === "view"} onOpenChange={v => !v && c.close()} title="Match Details">
        {c.selected && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg">{c.selected.user} → {c.selected.job}</p>
              <span className="font-bold text-[var(--match)] text-xl">{c.selected.score}%</span>
            </div>
            <p className="text-[var(--muted-foreground)]">{c.selected.company} · {c.selected.date}</p>
            <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--match)]" style={{ width: `${c.selected.score}%` }} />
            </div>
            <div className="pt-2 border-t border-[var(--border)] space-y-2">
              <div><span className="font-medium">Missing skills: </span>{c.selected.missing === "None" ? <Badge variant="success">Perfect Match</Badge> : <span className="text-[var(--destructive)]">{c.selected.missing}</span>}</div>
              <div><span className="font-medium">AI reasoning:</span> <span className="text-[var(--muted-foreground)]">{c.selected.aiReason}</span></div>
            </div>
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title="Remove this match?" description="The user will no longer see this recommendation." onConfirm={del} loading={c.loading} />
    </div>
  )
}
