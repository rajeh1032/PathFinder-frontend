import React, { useMemo, useState } from "react"
import { Search, FileText, Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { DetailsModal, ConfirmDeleteDialog, RowActions, EmptyState, useCrud } from "@/shared/components/crud"
import { CheckCircle2, AlertTriangle, FileSearch, Lightbulb } from "lucide-react"
import { exportCsv } from "@/shared/lib/csv"

type Analysis = { id: string; user: string; file: string; score: number; target: string; status: "Completed" | "Processing" | "Failed"; date: string; feedback?: string }

const initial: Analysis[] = [
  { id: "CV-1042", user: "Ahmed Hassan", file: "ahmed_cv.pdf", score: 86, target: "Frontend Dev", status: "Completed", date: "2026-05-31 09:12", feedback: "Strong React experience; add measurable impact metrics." },
  { id: "CV-1041", user: "Sara Smith", file: "sara_resume.pdf", score: 92, target: "Data Scientist", status: "Completed", date: "2026-05-31 08:40", feedback: "Excellent ML portfolio; concise summary." },
  { id: "CV-1040", user: "John Doe", file: "john_cv.docx", score: 64, target: "UX Designer", status: "Completed", date: "2026-05-31 08:21", feedback: "Add a portfolio link and quantify outcomes." },
  { id: "CV-1039", user: "Emily Chen", file: "emily.pdf", score: 78, target: "Backend Dev", status: "Completed", date: "2026-05-31 07:55" },
  { id: "CV-1038", user: "Ali Mahmoud", file: "ali_cv.pdf", score: 0, target: "Customer Support", status: "Processing", date: "2026-05-31 09:18" },
  { id: "CV-1037", user: "Layla Khaled", file: "layla.pdf", score: 0, target: "Frontend Dev", status: "Failed", date: "2026-05-31 09:05" },
]

const scoreColor = (s: number) => s >= 85 ? "text-emerald-600" : s >= 70 ? "text-blue-600" : s >= 50 ? "text-amber-600" : "text-red-600"

export function CvAnalyses() {
  const c = useCrud<Analysis>(initial)
  const [q, setQ] = useState("")
  const filtered = useMemo(() => c.items.filter(a => !q || a.user.toLowerCase().includes(q.toLowerCase()) || a.id.toLowerCase().includes(q.toLowerCase())), [c.items, q])

  const retry = (a: Analysis) => {
    c.setItems(p => p.map(x => x.id === a.id ? { ...x, status: "Processing" as const } : x))
    toast.info(`Reprocessing ${a.id}...`)
    setTimeout(() => {
      c.setItems(p => p.map(x => x.id === a.id ? { ...x, status: "Completed" as const, score: 75 + Math.floor(Math.random() * 20) } : x))
      toast.success(`Reprocessed ${a.id}`)
    }, 1500)
  }

  const del = () => {
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(x => x.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Analysis deleted")
    }, 200)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CV Analyses</h1>
          <p className="text-[var(--muted-foreground)]">AI-driven CV scoring and feedback history.</p>
        </div>
        <Button variant="outline" onClick={() => { exportCsv("cv-analyses.csv", c.items.map(a => ({ id: a.id, user: a.user, file: a.file, target: a.target, score: a.score, status: a.status, date: a.date }))); toast.success("Exported CV analyses CSV") }}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search by user or ID..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No analyses found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>ID</TableHead><TableHead>User</TableHead><TableHead>File</TableHead><TableHead>Target</TableHead><TableHead>Score</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="w-[50px]" /></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.id}</TableCell>
                  <TableCell className="font-medium">{a.user}</TableCell>
                  <TableCell><div className="flex items-center gap-1.5 text-sm"><FileText className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />{a.file}</div></TableCell>
                  <TableCell className="text-sm">{a.target}</TableCell>
                  <TableCell>{a.status === "Completed" ? <span className={`font-bold ${scoreColor(a.score)}`}>{a.score}%</span> : <span className="text-[var(--muted-foreground)] text-sm">—</span>}</TableCell>
                  <TableCell><Badge variant={a.status === "Completed" ? "success" : a.status === "Processing" ? "warning" : "destructive"}>{a.status}</Badge></TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">{a.date}</TableCell>
                  <TableCell>
                    <RowActions
                      onView={() => c.open("view", a)}
                      onDelete={() => c.open("delete", a)}
                      extra={a.status === "Failed" ? [{ label: "Retry", onClick: () => retry(a), icon: <RefreshCw className="h-4 w-4" /> }] : []}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <DetailsModal open={c.mode === "view"} onOpenChange={v => !v && c.close()} title="CV Analysis">
        {c.selected && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg">{c.selected.id}</p>
              <Badge variant={c.selected.status === "Completed" ? "success" : c.selected.status === "Processing" ? "warning" : "destructive"}>{c.selected.status}</Badge>
            </div>

            {c.selected.status === "Failed" ? (
              <div className="rounded-md bg-red-500/10 border border-red-500/30 p-4 text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">AI processing failed</p>
                  <p className="text-xs mt-1 opacity-80">Gemini returned: model_overload — please retry the analysis.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => { retry(c.selected!); c.close() }}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Retry
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md border border-[var(--border)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">CV preview</p>
                  <div className="mt-2 aspect-[3/4] rounded bg-[var(--muted)]/40 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-[var(--muted-foreground)]" />
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => toast.success("Downloaded original CV")}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />Download original
                  </Button>
                </div>
                <div className="col-span-2 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Info label="User" value={c.selected.user} />
                    <Info label="Target role" value={c.selected.target} />
                    <Info label="File" value={c.selected.file} mono />
                    <Info label="Date" value={c.selected.date} />
                  </div>
                  {c.selected.status === "Completed" && (
                    <div className="rounded-md bg-[var(--muted)]/40 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[var(--muted-foreground)]">Overall score</p>
                        <p className={`text-2xl font-bold ${scoreColor(c.selected.score)}`}>{c.selected.score}<span className="text-sm font-medium">/100</span></p>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                        <Breakdown label="Format" value={88} />
                        <Breakdown label="Skills" value={c.selected.score - 4} />
                        <Breakdown label="Impact" value={c.selected.score - 12} />
                        <Breakdown label="Match" value={c.selected.score - 6} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {c.selected.status === "Completed" && (
              <>
                <Section title="Parsed text">
                  <pre className="bg-[var(--muted)]/40 rounded-md p-3 text-xs overflow-auto max-h-32 whitespace-pre-wrap">{`${c.selected.user.toUpperCase()}\nFrontend Engineer with 4 years experience in React, TypeScript, and design systems...`}</pre>
                </Section>
                <div className="grid grid-cols-2 gap-3">
                  <Section title="Strengths" tone="emerald" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                    <ul className="list-disc pl-4 space-y-0.5"><li>Strong React + TypeScript foundation</li><li>Clear quantitative impact statements</li><li>Up-to-date stack (Next.js, RSC)</li></ul>
                  </Section>
                  <Section title="Weaknesses" tone="red" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
                    <ul className="list-disc pl-4 space-y-0.5"><li>No portfolio link</li><li>Missing leadership context</li><li>Generic summary section</li></ul>
                  </Section>
                  <Section title="Detected skills" tone="blue" icon={<FileSearch className="h-3.5 w-3.5" />}>
                    <div className="flex flex-wrap gap-1">{["React", "TypeScript", "Tailwind", "Node.js", "REST"].map(s => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
                  </Section>
                  <Section title="Missing skills" tone="amber" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
                    <div className="flex flex-wrap gap-1">{["GraphQL", "Testing (RTL)", "CI/CD"].map(s => <Badge key={s} variant="outline">{s}</Badge>)}</div>
                  </Section>
                </div>
                <Section title="Suggestions" tone="primary" icon={<Lightbulb className="h-3.5 w-3.5" />}>
                  <ul className="list-disc pl-4 space-y-0.5"><li>Add a 1-line headline summary tailored to {c.selected.target}</li><li>Quantify project outcomes (latency reduced, users impacted)</li><li>Link to GitHub/portfolio in the header</li></ul>
                </Section>
                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                  <Button variant="outline" onClick={() => toast.success("Marked as reviewed")}>Mark as reviewed</Button>
                </div>
              </>
            )}
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title={`Delete ${c.selected?.id}?`} onConfirm={del} loading={c.loading} />
    </div>
  )
}

function Info({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return <div><p className="text-xs text-[var(--muted-foreground)]">{label}</p><p className={`font-medium ${mono ? "font-mono text-xs" : ""}`}>{value}</p></div>
}
function Breakdown({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] text-[var(--muted-foreground)]">{label}</p>
      <p className={`font-bold ${scoreColor(value)}`}>{value}</p>
    </div>
  )
}
function Section({ title, children, tone, icon }: { title: string; children: React.ReactNode; tone?: "emerald" | "red" | "blue" | "amber" | "primary"; icon?: React.ReactNode }) {
  const map: Record<string, string> = { emerald: "text-emerald-600", red: "text-red-600", blue: "text-blue-600", amber: "text-amber-600", primary: "text-[var(--primary)]" }
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1 ${tone ? map[tone] : "text-[var(--muted-foreground)]"}`}>
        {icon}{title}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  )
}
