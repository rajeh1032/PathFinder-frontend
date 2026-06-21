import React, { useMemo, useState } from "react"
import { Plus, Search, GraduationCap, ExternalLink, RefreshCw, Video } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Switch } from "@/shared/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { FormModal, DetailsModal, ConfirmDeleteDialog, RowActions, EmptyState, Field, useCrud } from "@/shared/components/crud"

type Course = {
  id: string
  title: string
  provider: string
  url: string
  thumbnail_url: string
  video_url: string
  level: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  category: string
  is_active: boolean
  created_at: string
}

const initial: Course[] = [
  { id: "1", title: "React Mastery 2026", provider: "Frontend Masters", url: "https://frontendmasters.com/react", thumbnail_url: "", video_url: "https://youtube.com/watch?v=abc123", level: "Intermediate", duration: "24h", category: "Frontend", is_active: true, created_at: "2024-01-15" },
  { id: "2", title: "Python for Data Science", provider: "Coursera", url: "https://coursera.org/python-data", thumbnail_url: "", video_url: "", level: "Beginner", duration: "40h", category: "Data", is_active: true, created_at: "2024-01-20" },
  { id: "3", title: "AWS Certified Solutions Architect", provider: "A Cloud Guru", url: "https://acloudguru.com/aws-cert", thumbnail_url: "", video_url: "", level: "Advanced", duration: "32h", category: "Cloud", is_active: true, created_at: "2024-02-01" },
  { id: "4", title: "UI Fundamentals with Figma", provider: "DesignCourse", url: "https://designcourse.io/figma", thumbnail_url: "", video_url: "https://youtube.com/watch?v=xyz789", level: "Beginner", duration: "16h", category: "Design", is_active: false, created_at: "2024-02-10" },
  { id: "5", title: "Kubernetes in Production", provider: "KodeKloud", url: "https://kodekloud.com/k8s", thumbnail_url: "", video_url: "", level: "Advanced", duration: "28h", category: "DevOps", is_active: true, created_at: "2024-03-01" },
  { id: "6", title: "TypeScript Deep Dive", provider: "Educative", url: "https://educative.io/typescript", thumbnail_url: "", video_url: "", level: "Intermediate", duration: "18h", category: "Programming", is_active: true, created_at: "2024-03-10" },
]

type FormState = Omit<Course, "id" | "created_at">
const emptyForm: FormState = { title: "", provider: "", url: "", thumbnail_url: "", video_url: "", level: "Beginner", duration: "", category: "Engineering", is_active: true }

export function Courses() {
  const c = useCrud<Course>(initial)
  const [q, setQ] = useState("")
  const [catFilter, setCatFilter] = useState("All")
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = ["All", ...Array.from(new Set(c.items.map(co => co.category)))]

  const filtered = useMemo(() => c.items.filter(co => {
    const matchQ = !q || co.title.toLowerCase().includes(q.toLowerCase()) || co.provider.toLowerCase().includes(q.toLowerCase())
    const matchCat = catFilter === "All" || co.category === catFilter
    return matchQ && matchCat
  }), [c.items, q, catFilter])

  const startCreate = () => { setForm(emptyForm); setErrors({}); c.open("create") }
  const startEdit = (co: Course) => { setForm({ title: co.title, provider: co.provider, url: co.url, thumbnail_url: co.thumbnail_url, video_url: co.video_url, level: co.level, duration: co.duration, category: co.category, is_active: co.is_active }); setErrors({}); c.open("edit", co) }

  const submit = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Required"
    if (!form.provider.trim()) e.provider = "Required"
    setErrors(e); if (Object.keys(e).length) return
    c.setLoading(true)
    setTimeout(() => {
      if (c.mode === "create") {
        c.setItems(p => [{ ...form, id: String(Date.now()), created_at: new Date().toISOString().slice(0, 10) }, ...p])
        toast.success("Course added")
      } else if (c.selected) {
        c.setItems(p => p.map(x => x.id === c.selected!.id ? { ...x, ...form } : x))
        toast.success("Course updated")
      }
      c.setLoading(false); c.close()
    }, 250)
  }

  const del = () => {
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(x => x.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Course removed")
    }, 200)
  }

  const toggleActive = (co: Course) => {
    c.setItems(items => items.map(x => x.id === co.id ? { ...x, is_active: !x.is_active } : x))
    toast.success(co.is_active ? "Course deactivated" : "Course activated")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-[var(--muted-foreground)]">Manage learning resources mapped to career paths.</p>
        </div>
        <Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" />Add Course</Button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search courses..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <select
            className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
            value={catFilter} onChange={e => setCatFilter(e.target.value)}
          >
            {categories.map(cat => <option key={cat}>{cat}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={() => { setQ(""); setCatFilter("All") }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No courses found" description={q || catFilter !== "All" ? "Try a different search or filter." : "Add your first course."} action={!q && catFilter === "All" && <Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" />Add Course</Button>} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Video</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(co => (
                <TableRow key={co.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <span className="font-medium">{co.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{co.provider}</TableCell>
                  <TableCell><Badge variant="secondary">{co.category}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{co.level}</Badge></TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">{co.duration || "—"}</TableCell>
                  <TableCell>
                    {co.url ? (
                      <a href={co.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline text-xs">
                        <ExternalLink className="h-3 w-3" />Link
                      </a>
                    ) : <span className="text-[var(--muted-foreground)] text-xs">—</span>}
                  </TableCell>
                  <TableCell>
                    {co.video_url ? (
                      <a href={co.video_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline text-xs">
                        <Video className="h-3 w-3" />Watch
                      </a>
                    ) : <span className="text-[var(--muted-foreground)] text-xs">—</span>}
                  </TableCell>
                  <TableCell>
                    <Switch checked={co.is_active} onCheckedChange={() => toggleActive(co)} />
                  </TableCell>
                  <TableCell>
                    <RowActions onView={() => c.open("view", co)} onEdit={() => startEdit(co)} onDelete={() => c.open("delete", co)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <FormModal open={c.mode === "create" || c.mode === "edit"} onOpenChange={v => !v && c.close()} title={c.mode === "create" ? "Add Course" : "Edit Course"} onSubmit={submit} loading={c.loading}>
        <Field label="Title *" error={errors.title}>
          <Input placeholder="e.g. React Mastery 2026" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Provider *" error={errors.provider}>
            <Input placeholder="e.g. Coursera" value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} />
          </Field>
          <Field label="Duration" hint="e.g. 24h">
            <Input placeholder="24h" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
          </Field>
          <Field label="Category">
            <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option>Engineering</option>
              <option>Frontend</option>
              <option>Programming</option>
              <option>Data</option>
              <option>Design</option>
              <option>Cloud</option>
              <option>DevOps</option>
              <option>AI</option>
              <option>Security</option>
            </select>
          </Field>
          <Field label="Level">
            <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.level} onChange={e => setForm({ ...form, level: e.target.value as Course["level"] })}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
          </Field>
        </div>
        <Field label="Course URL">
          <Input placeholder="https://..." value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
        </Field>
        <Field label="Thumbnail URL">
          <Input placeholder="https://..." value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })} />
        </Field>
        <Field label="Video URL" hint="YouTube, Vimeo, or direct link">
          <Input placeholder="https://youtube.com/..." value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} />
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
          <label className="text-sm font-medium">Active (visible to students)</label>
        </div>
      </FormModal>

      <DetailsModal open={c.mode === "view"} onOpenChange={v => !v && c.close()} title="Course Details">
        {c.selected && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg">{c.selected.title}</p>
              <Badge variant={c.selected.is_active ? "success" : "secondary"}>{c.selected.is_active ? "Active" : "Inactive"}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
              <div>Provider: <span className="font-medium">{c.selected.provider}</span></div>
              <div>Category: <Badge variant="secondary">{c.selected.category}</Badge></div>
              <div>Level: <Badge variant="outline">{c.selected.level}</Badge></div>
              <div>Duration: <span className="font-medium">{c.selected.duration || "—"}</span></div>
              <div>Created: <span className="font-medium">{c.selected.created_at}</span></div>
            </div>
            {c.selected.url && (
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="font-medium mb-1">Course URL</p>
                <a href={c.selected.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline break-all">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />{c.selected.url}
                </a>
              </div>
            )}
            {c.selected.video_url && (
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="font-medium mb-1">Video URL</p>
                <a href={c.selected.video_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline break-all">
                  <Video className="h-3.5 w-3.5 shrink-0" />{c.selected.video_url}
                </a>
              </div>
            )}
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title={`Remove "${c.selected?.title}"?`} description="This course will be removed from all career path recommendations." onConfirm={del} loading={c.loading} />
    </div>
  )
}
