import React, { useMemo, useState } from "react"
import { Plus, Search, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Switch } from "@/shared/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { FormModal, DetailsModal, ConfirmDeleteDialog, RowActions, EmptyState, Field, useCrud } from "@/shared/components/crud"

type Skill = {
  id: string
  name: string
  category: string
  level: "Beginner" | "Intermediate" | "Advanced"
  aliases: string
  is_active: boolean
  users_count: number
  career_paths_count: number
  cv_skills_count: number
  created_at: string
}

const initial: Skill[] = [
  { id: "1", name: "React", category: "Frontend", level: "Intermediate", aliases: "ReactJS, React.js", is_active: true, users_count: 4280, career_paths_count: 6, cv_skills_count: 3120, created_at: "2024-01-10" },
  { id: "2", name: "Python", category: "Programming", level: "Beginner", aliases: "python3", is_active: true, users_count: 6120, career_paths_count: 4, cv_skills_count: 4890, created_at: "2024-01-10" },
  { id: "3", name: "TypeScript", category: "Frontend", level: "Intermediate", aliases: "TS, ts", is_active: true, users_count: 3540, career_paths_count: 5, cv_skills_count: 2760, created_at: "2024-01-12" },
  { id: "4", name: "SQL", category: "Database", level: "Beginner", aliases: "MySQL, PostgreSQL", is_active: true, users_count: 5210, career_paths_count: 7, cv_skills_count: 4010, created_at: "2024-01-15" },
  { id: "5", name: "Docker", category: "DevOps", level: "Advanced", aliases: "containerization", is_active: true, users_count: 1820, career_paths_count: 3, cv_skills_count: 1430, created_at: "2024-01-18" },
  { id: "6", name: "Figma", category: "Design", level: "Intermediate", aliases: "", is_active: true, users_count: 2640, career_paths_count: 2, cv_skills_count: 2010, created_at: "2024-02-01" },
  { id: "7", name: "AWS", category: "Cloud", level: "Advanced", aliases: "Amazon Web Services", is_active: false, users_count: 2010, career_paths_count: 4, cv_skills_count: 1580, created_at: "2024-02-05" },
]

const categoryColor: Record<string, string> = {
  Frontend: "bg-blue-500/10 text-blue-600",
  Programming: "bg-purple-500/10 text-purple-600",
  Database: "bg-amber-500/10 text-amber-600",
  DevOps: "bg-emerald-500/10 text-emerald-600",
  Design: "bg-pink-500/10 text-pink-600",
  Cloud: "bg-cyan-500/10 text-cyan-600",
  Security: "bg-red-500/10 text-red-600",
  AI: "bg-violet-500/10 text-violet-600",
}

type FormState = Pick<Skill, "name" | "category" | "level" | "aliases" | "is_active">
const emptyForm: FormState = { name: "", category: "Frontend", level: "Beginner", aliases: "", is_active: true }

export function SkillsManagement() {
  const c = useCrud<Skill>(initial)
  const [q, setQ] = useState("")
  const [catFilter, setCatFilter] = useState("All")
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = ["All", ...Array.from(new Set(c.items.map(s => s.category)))]

  const filtered = useMemo(() => c.items.filter(s => {
    const matchQ = !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.aliases.toLowerCase().includes(q.toLowerCase())
    const matchCat = catFilter === "All" || s.category === catFilter
    return matchQ && matchCat
  }), [c.items, q, catFilter])

  const startCreate = () => { setForm(emptyForm); setErrors({}); c.open("create") }
  const startEdit = (s: Skill) => { setForm({ name: s.name, category: s.category, level: s.level, aliases: s.aliases, is_active: s.is_active }); setErrors({}); c.open("edit", s) }

  const submit = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Required"
    if (c.items.some(s => s.name.toLowerCase() === form.name.trim().toLowerCase() && s.id !== c.selected?.id)) e.name = "Skill already exists"
    setErrors(e); if (Object.keys(e).length) return
    c.setLoading(true)
    setTimeout(() => {
      if (c.mode === "create") {
        c.setItems(p => [{ ...form, id: String(Date.now()), users_count: 0, career_paths_count: 0, cv_skills_count: 0, created_at: new Date().toISOString().slice(0, 10) }, ...p])
        toast.success("Skill added")
      } else if (c.selected) {
        c.setItems(p => p.map(s => s.id === c.selected!.id ? { ...s, ...form } : s))
        toast.success("Skill updated")
      }
      c.setLoading(false); c.close()
    }, 200)
  }

  const del = () => {
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(s => s.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Skill deleted")
    }, 200)
  }

  const toggleActive = (s: Skill) => {
    c.setItems(items => items.map(x => x.id === s.id ? { ...x, is_active: !x.is_active } : x))
    toast.success(s.is_active ? "Skill deactivated" : "Skill activated")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
          <p className="text-[var(--muted-foreground)]">Manage the skills taxonomy used across career paths and CVs.</p>
        </div>
        <Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" />Add Skill</Button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search skills or aliases..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
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
          <EmptyState title="No skills found" description={q || catFilter !== "All" ? "Try a different search or filter." : "Add your first skill."} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Aliases</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Career Paths</TableHead>
                <TableHead>CV Skills</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${categoryColor[s.category] ?? "bg-gray-500/10 text-gray-600"}`}>
                      {s.category}
                    </span>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{s.level}</Badge></TableCell>
                  <TableCell className="text-xs text-[var(--muted-foreground)] max-w-[140px] truncate">{s.aliases || "—"}</TableCell>
                  <TableCell className="text-sm">{s.users_count.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{s.career_paths_count}</TableCell>
                  <TableCell className="text-sm">{s.cv_skills_count.toLocaleString()}</TableCell>
                  <TableCell>
                    <Switch checked={s.is_active} onCheckedChange={() => toggleActive(s)} />
                  </TableCell>
                  <TableCell>
                    <RowActions onView={() => c.open("view", s)} onEdit={() => startEdit(s)} onDelete={() => c.open("delete", s)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <FormModal open={c.mode === "create" || c.mode === "edit"} onOpenChange={v => !v && c.close()} title={c.mode === "create" ? "Add Skill" : "Edit Skill"} onSubmit={submit} loading={c.loading}>
        <Field label="Name *" error={errors.name}>
          <Input placeholder="e.g. React" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option>Frontend</option>
              <option>Programming</option>
              <option>Database</option>
              <option>DevOps</option>
              <option>Design</option>
              <option>Cloud</option>
              <option>Security</option>
              <option>AI</option>
            </select>
          </Field>
          <Field label="Level">
            <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.level} onChange={e => setForm({ ...form, level: e.target.value as Skill["level"] })}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
          </Field>
        </div>
        <Field label="Aliases" hint="Comma-separated alternate names for matching (e.g. ReactJS, React.js)">
          <Input placeholder="ReactJS, React.js" value={form.aliases} onChange={e => setForm({ ...form, aliases: e.target.value })} />
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
          <label className="text-sm font-medium">Active</label>
        </div>
      </FormModal>

      <DetailsModal open={c.mode === "view"} onOpenChange={v => !v && c.close()} title="Skill Details">
        {c.selected && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg">{c.selected.name}</p>
              <Badge variant={c.selected.is_active ? "success" : "secondary"}>{c.selected.is_active ? "Active" : "Inactive"}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
              <div>Category: <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${categoryColor[c.selected.category] ?? "bg-gray-500/10 text-gray-600"}`}>{c.selected.category}</span></div>
              <div>Level: <Badge variant="secondary">{c.selected.level}</Badge></div>
              {c.selected.aliases && <div className="col-span-2">Aliases: <span className="text-[var(--muted-foreground)]">{c.selected.aliases}</span></div>}
              <div>Created: <span className="font-medium">{c.selected.created_at}</span></div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--border)]">
              <div className="text-center p-3 rounded-lg bg-[var(--muted)]">
                <p className="text-xl font-bold">{c.selected.users_count.toLocaleString()}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Users</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--muted)]">
                <p className="text-xl font-bold">{c.selected.career_paths_count}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Career Paths</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--muted)]">
                <p className="text-xl font-bold">{c.selected.cv_skills_count.toLocaleString()}</p>
                <p className="text-xs text-[var(--muted-foreground)]">CV Skills</p>
              </div>
            </div>
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title={`Delete "${c.selected?.name}"?`} description="This skill will be removed from all career paths and CV analyses." onConfirm={del} loading={c.loading} />
    </div>
  )
}
