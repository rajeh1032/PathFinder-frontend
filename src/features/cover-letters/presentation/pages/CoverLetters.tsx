import React, { useMemo, useState } from "react"
import { Search, FileText, Download, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { FormModal, DetailsModal, ConfirmDeleteDialog, RowActions, EmptyState, Field, useCrud } from "@/shared/components/crud"

type Letter = { id: string; user: string; job: string; template: "Modern" | "Classic" | "Creative"; words: number; status: "Final" | "Draft"; date: string; body?: string }

const initial: Letter[] = [
  { id: "CL-5021", user: "Ahmed Hassan", job: "Senior Frontend Engineer @ Meta", template: "Modern", words: 320, status: "Final", date: "2026-05-31 09:00", body: "Dear Hiring Manager,\n\nI am excited to apply for the Senior Frontend Engineer role at Meta..." },
  { id: "CL-5020", user: "Sara Smith", job: "Data Scientist @ Spotify", template: "Classic", words: 290, status: "Draft", date: "2026-05-30 18:42" },
  { id: "CL-5019", user: "John Doe", job: "UX Designer @ Airbnb", template: "Creative", words: 350, status: "Final", date: "2026-05-30 14:10" },
  { id: "CL-5018", user: "Emily Chen", job: "Backend Engineer @ Stripe", template: "Modern", words: 310, status: "Final", date: "2026-05-30 09:25" },
  { id: "CL-5017", user: "Layla Khaled", job: "Junior Dev @ Vodafone", template: "Classic", words: 240, status: "Draft", date: "2026-05-29 22:11" },
]

const empty = { name: "", desc: "" }

export function CoverLetters() {
  const c = useCrud<Letter>(initial)
  const [q, setQ] = useState("")
  const [tplForm, setTplForm] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filtered = useMemo(() => c.items.filter(l => !q || l.user.toLowerCase().includes(q.toLowerCase()) || l.job.toLowerCase().includes(q.toLowerCase())), [c.items, q])

  const submitTemplate = () => {
    const e: Record<string, string> = {}
    if (!tplForm.name.trim()) e.name = "Required"
    setErrors(e); if (Object.keys(e).length) return
    c.setLoading(true)
    setTimeout(() => { c.setLoading(false); c.close(); toast.success("Template created") }, 250)
  }

  const del = () => {
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(x => x.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Cover letter deleted")
    }, 200)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cover Letters</h1>
          <p className="text-[var(--muted-foreground)]">AI-generated cover letters and templates.</p>
        </div>
        <Button onClick={() => { setTplForm(empty); setErrors({}); c.open("create") }}><Plus className="mr-2 h-4 w-4" />New Template</Button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search cover letters..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No cover letters found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>ID</TableHead><TableHead>User</TableHead><TableHead>Job Application</TableHead><TableHead>Template</TableHead><TableHead>Words</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="w-[50px]" /></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs">{l.id}</TableCell>
                  <TableCell className="font-medium">{l.user}</TableCell>
                  <TableCell><div className="flex items-center gap-1.5 text-sm"><FileText className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />{l.job}</div></TableCell>
                  <TableCell><Badge variant="secondary">{l.template}</Badge></TableCell>
                  <TableCell className="text-sm">{l.words}</TableCell>
                  <TableCell><Badge variant={l.status === "Final" ? "success" : "warning"}>{l.status}</Badge></TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">{l.date}</TableCell>
                  <TableCell>
                    <RowActions
                      onView={() => c.open("view", l)}
                      onDelete={() => c.open("delete", l)}
                      extra={[{ label: "Download", onClick: () => toast.success("Downloaded"), icon: <Download className="h-4 w-4" /> }]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <FormModal open={c.mode === "create"} onOpenChange={v => !v && c.close()} title="New Template" description="Define a reusable cover letter template." onSubmit={submitTemplate} loading={c.loading}>
        <Field label="Template Name" error={errors.name}><Input value={tplForm.name} onChange={e => setTplForm({ ...tplForm, name: e.target.value })} /></Field>
        <Field label="Description"><Textarea rows={4} value={tplForm.desc} onChange={e => setTplForm({ ...tplForm, desc: e.target.value })} /></Field>
      </FormModal>

      <DetailsModal open={c.mode === "view"} onOpenChange={v => !v && c.close()} title="Cover Letter">
        {c.selected && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{c.selected.id} — {c.selected.user}</p>
              <Badge variant={c.selected.status === "Final" ? "success" : "warning"}>{c.selected.status}</Badge>
            </div>
            <p className="text-[var(--muted-foreground)]">{c.selected.job}</p>
            <div className="flex gap-3 text-xs text-[var(--muted-foreground)]">
              <span>Template: <Badge variant="secondary">{c.selected.template}</Badge></span>
              <span>{c.selected.words} words</span>
              <span>{c.selected.date}</span>
            </div>
            <div className="border border-[var(--border)] rounded-md p-3 bg-[var(--muted)]/30 max-h-64 overflow-auto whitespace-pre-wrap text-sm">
              {c.selected.body ?? "No content saved for this letter."}
            </div>
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title={`Delete ${c.selected?.id}?`} onConfirm={del} loading={c.loading} />
    </div>
  )
}
