import { useEffect, useMemo, useState } from "react"
import { Search, Filter, Zap, RefreshCw, Send, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { DetailsModal, ConfirmDeleteDialog, RowActions, EmptyState, useCrud } from "@/shared/components/crud"
import { useJobMatches } from "../../application/useJobMatches"

// View model kept identical to the original UI so the table/markup are unchanged.
type Match = { id: string; user: string; job: string; company: string; score: number; missing: string; aiReason: string; date: string }

const fmtDate = (value: string | null) => (value ? value.slice(0, 10) : "—")

export function JobMatches() {
  // Real backend data: `GET /api/v1/job-matches/admin` (admin-gated, cross-user).
  // Each row carries its owning user, shown in the User column.
  const { items, isLoading, error, refetch } = useJobMatches()

  const c = useCrud<Match>([])
  const [q, setQ] = useState("")
  const [recomputing, setRecomputing] = useState(false)

  // Map the backend match rows into the UI view model.
  const view = useMemo<Match[]>(() => items.map((m) => ({
    id: m.id,
    user: m.users?.name || m.users?.email || "Unknown user",
    job: m.jobs?.title || "—",
    company: m.jobs?.company || "—",
    score: m.match_percentage,
    missing: m.missing_skills.length ? m.missing_skills.join(", ") : "None",
    aiReason: m.ai_reason || "No reasoning provided.",
    date: fmtDate(m.created_at),
  })), [items])

  // Mirror the mapped rows into the local list so search/remove keep working.
  useEffect(() => { c.setItems(view) }, [view])

  const filtered = useMemo(() => c.items.filter(m => !q || m.user.toLowerCase().includes(q.toLowerCase()) || m.job.toLowerCase().includes(q.toLowerCase())), [c.items, q])

  // No cross-user "regenerate all" backend operation exists, so this re-queries
  // the admin list rather than recomputing matches.
  const handleRecompute = async () => {
    setRecomputing(true)
    try {
      await Promise.resolve(refetch())
      toast.success("Matches refreshed")
    } finally {
      setRecomputing(false)
    }
  }

  // No backend route to notify a user; this stays in-session only.
  const notify = (m: Match) => toast.success(`Notification sent to ${m.user} (local only)`)

  // No backend DELETE route for matches; removal is in-session only.
  const del = () => {
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(x => x.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Match removed (local only)")
    }, 200)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Matches</h1>
          <p className="text-[var(--muted-foreground)]">AI-generated matches between users and jobs.</p>
        </div>
        <Button variant="outline" onClick={handleRecompute} disabled={recomputing}>
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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <Loader2 className="h-7 w-7 animate-spin text-[var(--muted-foreground)] mb-4" />
            <p className="text-sm text-[var(--muted-foreground)]">Loading matches...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <p className="font-semibold">Couldn't load matches</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-sm">{error}</p>
            <Button variant="outline" className="mt-4" onClick={refetch}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>
          </div>
        ) : filtered.length === 0 ? (
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

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title="Remove this match?" description="This removes the match from the list for this session only (no backend delete endpoint exists yet)." onConfirm={del} loading={c.loading} />
    </div>
  )
}
