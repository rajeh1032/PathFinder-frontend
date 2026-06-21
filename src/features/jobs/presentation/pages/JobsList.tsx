import React, { useMemo, useState } from "react"
import { Search, Plus, Briefcase, ExternalLink, RefreshCw, Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Badge } from "@/shared/components/ui/badge"
import { Switch } from "@/shared/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { FormModal, DetailsModal, ConfirmDeleteDialog, RowActions, EmptyState, Field, useCrud } from "@/shared/components/crud"

type Job = {
  id: string
  title: string
  company: string
  location: string
  description: string
  source: string
  source_type: "manual" | "api"
  apply_url: string
  required_skills: string
  employment_type: "Full-time" | "Part-time" | "Contract" | "Internship" | "Freelance"
  salary_range: string
  status: "active" | "closed" | "expired"
  is_active: boolean
  posted_at: string
  created_at: string
}

const initial: Job[] = [
  { id: "1", title: "Senior React Developer", company: "TechNova", location: "Remote", description: "Build scalable React apps.", source: "Manual", source_type: "manual", apply_url: "https://technova.com/apply/1", required_skills: "React, TypeScript, Node.js", employment_type: "Full-time", salary_range: "$90,000 – $130,000", status: "active", is_active: true, posted_at: "2026-05-28", created_at: "2026-05-28" },
  { id: "2", title: "Data Analyst", company: "GlobalData", location: "Cairo, EG", description: "Analyze business data pipelines.", source: "Manual", source_type: "manual", apply_url: "", required_skills: "SQL, Python, Power BI", employment_type: "Full-time", salary_range: "$50,000 – $75,000", status: "active", is_active: true, posted_at: "2026-05-25", created_at: "2026-05-25" },
  { id: "3", title: "UI/UX Designer", company: "Creative Minds", location: "Dubai, UAE (Remote)", description: "Design beautiful digital products.", source: "JSearch API", source_type: "api", apply_url: "https://creativeminds.io/jobs/3", required_skills: "Figma, User Research", employment_type: "Contract", salary_range: "$60,000 – $90,000", status: "active", is_active: true, posted_at: "2026-05-20", created_at: "2026-05-20" },
  { id: "4", title: "DevOps Engineer", company: "ServerPro", location: "Riyadh, SA", description: "Maintain CI/CD and cloud infra.", source: "Remotive API", source_type: "api", apply_url: "https://serverpro.com/jobs/4", required_skills: "Docker, Kubernetes, AWS", employment_type: "Full-time", salary_range: "$80,000 – $120,000", status: "active", is_active: true, posted_at: "2026-05-18", created_at: "2026-05-18" },
  { id: "5", title: "Product Manager", company: "Innovate Inc", location: "Remote", description: "Lead product roadmap execution.", source: "Manual", source_type: "manual", apply_url: "", required_skills: "Agile, Roadmapping, SQL", employment_type: "Full-time", salary_range: "$100,000 – $150,000", status: "closed", is_active: false, posted_at: "2026-04-01", created_at: "2026-04-01" },
]

type FormState = Omit<Job, "id" | "source" | "source_type" | "created_at">
const emptyForm: FormState = {
  title: "", company: "", location: "", description: "",
  apply_url: "", required_skills: "", employment_type: "Full-time",
  salary_range: "", status: "active", is_active: true,
  posted_at: new Date().toISOString().slice(0, 10),
}

const statusVariant: Record<string, "success" | "secondary" | "warning"> = {
  active: "success", closed: "secondary", expired: "warning",
}

export function JobsList() {
  const c = useCrud<Job>(initial)
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filtered = useMemo(() => c.items.filter(j => {
    const matchQ = !q || j.title.toLowerCase().includes(q.toLowerCase()) || j.company.toLowerCase().includes(q.toLowerCase())
    const matchStatus = statusFilter === "All" || j.status === statusFilter
    return matchQ && matchStatus
  }), [c.items, q, statusFilter])

  const startCreate = () => { setForm(emptyForm); setErrors({}); c.open("create") }
  const startEdit = (j: Job) => {
    setForm({ title: j.title, company: j.company, location: j.location, description: j.description ?? "", apply_url: j.apply_url, required_skills: j.required_skills, employment_type: j.employment_type, salary_range: j.salary_range, status: j.status, is_active: j.is_active, posted_at: j.posted_at })
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
        c.setItems(p => [{ ...form, id: String(Date.now()), source: "Manual", source_type: "manual" as const, created_at: new Date().toISOString().slice(0, 10) }, ...p])
        toast.success("Job posted")
      } else if (c.selected) {
        c.setItems(p => p.map(j => j.id === c.selected!.id ? { ...j, ...form } : j))
        toast.success("Job updated")
      }
      c.setLoading(false); c.close()
    }, 250)
  }

  const del = () => {
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(x => x.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Job deleted")
    }, 200)
  }

  const exportCsv = () => {
    const rows = [
      ["title", "company", "location", "employment_type", "salary_range", "status", "source", "posted_at"],
      ...c.items.map(j => [j.title, j.company, j.location, j.employment_type, j.salary_range, j.status, j.source, j.posted_at]),
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
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="expired">Expired</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => { setQ(""); setStatusFilter("All") }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No jobs found" description={q || statusFilter !== "All" ? "Try a different search or filter." : "Add your first job listing."} action={!q && statusFilter === "All" && <Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" />Add Job</Button>} />
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
                  <TableCell className="text-[var(--muted-foreground)] text-sm">{j.location}</TableCell>
                  <TableCell><Badge variant="secondary">{j.employment_type}</Badge></TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">{j.salary_range || "—"}</TableCell>
                  <TableCell><Badge variant={j.source_type === "manual" ? "default" : "outline"} className="text-xs">{j.source}</Badge></TableCell>
                  <TableCell><Badge variant={statusVariant[j.status] ?? "secondary"}>{j.status}</Badge></TableCell>
                  <TableCell><Switch checked={j.is_active} onCheckedChange={() => { c.setItems(items => items.map(x => x.id === j.id ? { ...x, is_active: !x.is_active } : x)); toast.success(j.is_active ? "Job deactivated" : "Job activated") }} /></TableCell>
                  <TableCell className="text-xs text-[var(--muted-foreground)]">{j.posted_at}</TableCell>
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
            <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value as Job["employment_type"] })}>
              <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Freelance</option>
            </select>
          </Field>
          <Field label="Status">
            <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Job["status"] })}>
              <option value="active">Active</option><option value="closed">Closed</option><option value="expired">Expired</option>
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
            <p className="text-[var(--muted-foreground)]">{c.selected.company} · {c.selected.location}</p>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
              <div>Type: <Badge variant="secondary">{c.selected.employment_type}</Badge></div>
              <div>Source: <Badge variant="outline">{c.selected.source}</Badge></div>
              <div>Salary: <span className="font-medium">{c.selected.salary_range || "—"}</span></div>
              <div>Posted: <span className="font-medium">{c.selected.posted_at}</span></div>
              {c.selected.required_skills && <div className="col-span-2">Skills: <span className="text-[var(--muted-foreground)]">{c.selected.required_skills}</span></div>}
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

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title={`Delete "${c.selected?.title}"?`} description="All job matches associated with this listing will also be removed." onConfirm={del} loading={c.loading} />
    </div>
  )
}
