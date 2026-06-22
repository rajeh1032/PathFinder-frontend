import { useEffect, useMemo, useState } from "react"
import { Search, Plus, Briefcase, ExternalLink, RefreshCw, Download, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Badge } from "@/shared/components/ui/badge"
import { Switch } from "@/shared/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { FormModal, DetailsModal, ConfirmDeleteDialog, RowActions, EmptyState, Field, useCrud } from "@/shared/components/crud"
import { useJobs } from "../../application/useJobs"
import type { Job, JobStatus } from "../../domain/jobs.types"

// Form fields editable in the create/edit modal. `required_skills` stays a
// comma-separated string for the text input and is mapped to/from the backend
// `string[]` shape.
type FormState = {
  title: string
  company: string
  location: string
  description: string
  apply_url: string
  required_skills: string
  employment_type: string
  salary_range: string
  status: JobStatus
  is_active: boolean
  posted_at: string
}

const emptyForm: FormState = {
  title: "", company: "", location: "", description: "",
  apply_url: "", required_skills: "", employment_type: "Full-time",
  salary_range: "", status: "published", is_active: true,
  posted_at: new Date().toISOString().slice(0, 10),
}

const statusVariant: Record<string, "success" | "secondary" | "warning"> = {
  published: "success", draft: "secondary", archived: "warning",
}

const fmtDate = (value: string | null) => (value ? value.slice(0, 10) : "—")
const splitSkills = (value: string) =>
  value.split(",").map((s) => s.trim()).filter(Boolean)

export function JobsList() {
  // Real backend data: `GET /api/v1/jobs` (public read, paginated).
  const { items: fetchedJobs, isLoading, error, refetch } = useJobs()

  // Local CRUD/modal state mirrors the fetched rows. Create/edit/delete/toggle
  // are in-session only: the backend exposes no admin write endpoint for jobs,
  // so changes here are not persisted (see jobs.types.ts).
  const c = useCrud<Job>([])
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Sync fetched rows into the local list whenever the backend data changes.
  useEffect(() => { c.setItems(fetchedJobs) }, [fetchedJobs])

  const filtered = useMemo(() => c.items.filter(j => {
    const matchQ = !q || j.title.toLowerCase().includes(q.toLowerCase()) || j.company.toLowerCase().includes(q.toLowerCase())
    const matchStatus = statusFilter === "All" || j.status === statusFilter
    return matchQ && matchStatus
  }), [c.items, q, statusFilter])

  const startCreate = () => { setForm(emptyForm); setErrors({}); c.open("create") }
  const startEdit = (j: Job) => {
    setForm({ title: j.title, company: j.company, location: j.location ?? "", description: j.description ?? "", apply_url: j.apply_url ?? "", required_skills: j.required_skills.join(", "), employment_type: j.employment_type ?? "Full-time", salary_range: j.salary_range ?? "", status: (j.status as JobStatus) ?? "published", is_active: j.is_active, posted_at: fmtDate(j.posted_at) })
    setErrors({}); c.open("edit", j)
  }

  const submit = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Required"
    if (!form.company.trim()) e.company = "Required"
    if (!form.location.trim()) e.location = "Required"
    setErrors(e); if (Object.keys(e).length) return
    c.setLoading(true)
    setTimeout(() => {
      if (c.mode === "create") {
        const newJob: Job = {
          id: String(Date.now()),
          title: form.title, company: form.company, location: form.location,
          description: form.description, source: "Manual", source_type: "manual",
          external_id: null, apply_url: form.apply_url || null,
          required_skills: splitSkills(form.required_skills),
          employment_type: form.employment_type || null, salary_range: form.salary_range || null,
          level: null, category: null, thumbnail_url: null, company_logo_url: null,
          certificate_provider: null, duration: null, is_active: form.is_active,
          status: form.status, posted_at: form.posted_at || null,
          created_at: new Date().toISOString(), updated_at: null,
        }
        c.setItems(p => [newJob, ...p])
        toast.success("Job posted (local only)")
      } else if (c.selected) {
        c.setItems(p => p.map(j => j.id === c.selected!.id ? {
          ...j,
          title: form.title, company: form.company, location: form.location,
          description: form.description, apply_url: form.apply_url || null,
          required_skills: splitSkills(form.required_skills),
          employment_type: form.employment_type || null, salary_range: form.salary_range || null,
          status: form.status, is_active: form.is_active, posted_at: form.posted_at || null,
        } : j))
        toast.success("Job updated (local only)")
      }
      c.setLoading(false); c.close()
    }, 250)
  }

  const del = () => {
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(x => x.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Job removed (local only)")
    }, 200)
  }

  const exportCsv = () => {
    const rows = [
      ["title", "company", "location", "employment_type", "salary_range", "status", "source", "posted_at"],
      ...c.items.map(j => [j.title, j.company, j.location ?? "", j.employment_type ?? "", j.salary_range ?? "", j.status, j.source ?? "", fmtDate(j.posted_at)]),
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n")
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    a.download = "jobs.csv"; a.click()
    toast.success("Exported jobs.csv")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-[var(--muted-foreground)]">Manage job listings for AI-powered matching.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          <Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" />Add Job</Button>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search by title or company..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <select
            className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => { setQ(""); setStatusFilter("All") }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <Loader2 className="h-7 w-7 animate-spin text-[var(--muted-foreground)] mb-4" />
            <p className="text-sm text-[var(--muted-foreground)]">Loading jobs...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <p className="font-semibold">Couldn't load jobs</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-sm">{error}</p>
            <Button variant="outline" className="mt-4" onClick={refetch}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No jobs found" description={q || statusFilter !== "All" ? "Try a different search or filter." : "No job listings are available yet."} action={!q && statusFilter === "All" && <Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" />Add Job</Button>} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Salary Range</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(j => (
                <TableRow key={j.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <span className="font-medium">{j.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{j.company}</TableCell>
                  <TableCell className="text-[var(--muted-foreground)] text-sm">{j.location || "—"}</TableCell>
                  <TableCell><Badge variant="secondary">{j.employment_type || "—"}</Badge></TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">{j.salary_range || "—"}</TableCell>
                  <TableCell><Badge variant={j.source_type === "manual" ? "default" : "outline"} className="text-xs">{j.source || "—"}</Badge></TableCell>
                  <TableCell><Badge variant={statusVariant[j.status] ?? "secondary"}>{j.status}</Badge></TableCell>
                  <TableCell><Switch checked={j.is_active} onCheckedChange={() => { c.setItems(items => items.map(x => x.id === j.id ? { ...x, is_active: !x.is_active } : x)); toast.success(j.is_active ? "Job deactivated (local only)" : "Job activated (local only)") }} /></TableCell>
                  <TableCell className="text-xs text-[var(--muted-foreground)]">{fmtDate(j.posted_at)}</TableCell>
                  <TableCell>
                    <RowActions
                      onView={() => c.open("view", j)}
                      onEdit={() => startEdit(j)}
                      onDelete={() => c.open("delete", j)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <FormModal open={c.mode === "create" || c.mode === "edit"} onOpenChange={v => !v && c.close()} title={c.mode === "create" ? "Add Job" : "Edit Job"} onSubmit={submit} loading={c.loading}>
        <Field label="Title *" error={errors.title}>
          <Input placeholder="e.g. Senior React Developer" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company *" error={errors.company}>
            <Input placeholder="e.g. TechNova" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
          </Field>
          <Field label="Location *" error={errors.location}>
            <Input placeholder="e.g. Remote" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </Field>
          <Field label="Employment Type">
            <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value })}>
              <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Freelance</option>
            </select>
          </Field>
          <Field label="Status">
            <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as JobStatus })}>
              <option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
            </select>
          </Field>
        </div>
        <Field label="Salary Range" hint="e.g. $80,000 – $120,000">
          <Input placeholder="$80,000 – $120,000" value={form.salary_range} onChange={e => setForm({ ...form, salary_range: e.target.value })} />
        </Field>
        <Field label="Required Skills" hint="Comma-separated">
          <Input placeholder="React, TypeScript, Node.js" value={form.required_skills} onChange={e => setForm({ ...form, required_skills: e.target.value })} />
        </Field>
        <Field label="Apply URL">
          <Input placeholder="https://..." value={form.apply_url} onChange={e => setForm({ ...form, apply_url: e.target.value })} />
        </Field>
        <Field label="Posted At">
          <Input type="date" value={form.posted_at} onChange={e => setForm({ ...form, posted_at: e.target.value })} />
        </Field>
        <Field label="Description">
          <Textarea rows={3} placeholder="Describe the role..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
          <label className="text-sm font-medium">Active (shown to students)</label>
        </div>
      </FormModal>

      <DetailsModal open={c.mode === "view"} onOpenChange={v => !v && c.close()} title="Job Details">
        {c.selected && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-lg">{c.selected.title}</p>
              <div className="flex gap-1.5">
                <Badge variant={statusVariant[c.selected.status] ?? "secondary"}>{c.selected.status}</Badge>
                <Badge variant={c.selected.is_active ? "success" : "outline"}>{c.selected.is_active ? "Active" : "Inactive"}</Badge>
              </div>
            </div>
            <p className="text-[var(--muted-foreground)]">{c.selected.company} · {c.selected.location || "—"}</p>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
              <div>Type: <Badge variant="secondary">{c.selected.employment_type || "—"}</Badge></div>
              <div>Source: <Badge variant="outline">{c.selected.source || "—"}</Badge></div>
              <div>Salary: <span className="font-medium">{c.selected.salary_range || "—"}</span></div>
              <div>Posted: <span className="font-medium">{fmtDate(c.selected.posted_at)}</span></div>
              {c.selected.required_skills.length > 0 && <div className="col-span-2">Skills: <span className="text-[var(--muted-foreground)]">{c.selected.required_skills.join(", ")}</span></div>}
            </div>
            {c.selected.description && <p className="pt-2 border-t border-[var(--border)] text-[var(--muted-foreground)]">{c.selected.description}</p>}
            {c.selected.apply_url && (
              <a href={c.selected.apply_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline">
                <ExternalLink className="h-3.5 w-3.5" />View Application
              </a>
            )}
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title={`Delete "${c.selected?.title}"?`} description="This removes the job from the list for this session only (no backend delete endpoint exists yet)." onConfirm={del} loading={c.loading} />
    </div>
  )
}
