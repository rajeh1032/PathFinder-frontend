import React, { useEffect, useMemo, useState } from "react"
import { Plus, Search, Briefcase, Users, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Switch } from "@/shared/components/ui/switch"
import { FormModal, DetailsModal, ConfirmDeleteDialog, RowActions, Field, useCrud } from "@/shared/components/crud"
import { DataState } from "@/shared/components/custom"
import { useCareerPaths } from "../../application/useCareerPaths"
import type { CareerPathListItem } from "../../domain/career-paths.types"

type RequiredSkill = { skill_name: string; required_level: "Beginner" | "Intermediate" | "Advanced"; priority: "Low" | "Medium" | "High" }

type CareerPath = {
  id: string
  title: string
  description: string
  category: string
  average_salary: string
  difficulty_level: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  is_active: boolean
  required_skills: RequiredSkill[]
  followers: number
  created_at: string
}

type FormState = Omit<CareerPath, "id" | "followers" | "created_at">

/**
 * Map the backend list item (`id`, `title`, `category`, `difficulty_level`)
 * into the richer local view model. Fields the backend does not expose yet
 * (description, salary, required skills, followers) default to empty values.
 * The backend list endpoint only returns active paths, so `is_active` is true.
 */
function toLocal(item: CareerPathListItem): CareerPath {
  const difficulty = (["Beginner", "Intermediate", "Advanced", "Expert"].includes(item.difficulty_level)
    ? item.difficulty_level
    : "Intermediate") as CareerPath["difficulty_level"]
  return {
    id: item.id,
    title: item.title,
    description: "",
    category: item.category,
    average_salary: "",
    difficulty_level: difficulty,
    is_active: true,
    required_skills: [],
    followers: 0,
    created_at: "—",
  }
}

const emptySkill: RequiredSkill = { skill_name: "", required_level: "Beginner", priority: "Medium" }
const emptyForm: FormState = {
  title: "", description: "", category: "Engineering",
  average_salary: "", difficulty_level: "Intermediate", is_active: true, required_skills: [],
}

const difficultyVariant: Record<string, "default" | "secondary" | "warning" | "success"> = {
  Beginner: "success", Intermediate: "default", Advanced: "warning", Expert: "secondary",
}

export function CareerPaths() {
  const { items: remoteItems, isLoading, error, refetch } = useCareerPaths()
  const c = useCrud<CareerPath>([])
  const [q, setQ] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Seed the local working copy from the backend list whenever it changes.
  useEffect(() => {
    c.setItems(remoteItems.map(toLocal))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteItems])

  const categories = ["All", ...Array.from(new Set(c.items.map(p => p.category)))]

  const filtered = useMemo(() => c.items.filter(p => {
    const matchQ = !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase())
    const matchCat = categoryFilter === "All" || p.category === categoryFilter
    return matchQ && matchCat
  }), [c.items, q, categoryFilter])

  const startCreate = () => { setForm(emptyForm); setErrors({}); c.open("create") }
  const startEdit = (p: CareerPath) => {
    setForm({ title: p.title, description: p.description, category: p.category, average_salary: p.average_salary, difficulty_level: p.difficulty_level, is_active: p.is_active, required_skills: [...p.required_skills] })
    setErrors({}); c.open("edit", p)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Required"
    if (!form.category.trim()) e.category = "Required"
    for (const [i, sk] of form.required_skills.entries()) {
      if (!sk.skill_name.trim()) e[`skill_${i}`] = "Skill name required"
    }
    setErrors(e); return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!validate()) return
    c.setLoading(true)
    setTimeout(() => {
      if (c.mode === "create") {
        c.setItems(p => [{ ...form, id: String(Date.now()), followers: 0, created_at: new Date().toISOString().slice(0, 10) }, ...p])
        toast.success("Career path created")
      } else if (c.selected) {
        c.setItems(p => p.map(x => x.id === c.selected!.id ? { ...x, ...form } : x))
        toast.success("Career path updated")
      }
      c.setLoading(false); c.close()
    }, 250)
  }

  const del = () => {
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(x => x.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Career path deleted")
    }, 200)
  }

  const toggleActive = (p: CareerPath) => {
    c.setItems(items => items.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x))
    toast.success(p.is_active ? "Career path deactivated" : "Career path activated")
  }

  const addSkill = () => setForm(f => ({ ...f, required_skills: [...f.required_skills, { ...emptySkill }] }))
  const removeSkill = (i: number) => setForm(f => ({ ...f, required_skills: f.required_skills.filter((_, idx) => idx !== i) }))
  const updateSkill = (i: number, patch: Partial<RequiredSkill>) =>
    setForm(f => ({ ...f, required_skills: f.required_skills.map((s, idx) => idx === i ? { ...s, ...patch } : s) }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Career Paths</h1>
          <p className="text-[var(--muted-foreground)]">Active career path catalog from the backend. Create, edit and delete are local previews until admin endpoints exist.</p>
        </div>
        <Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" />New Career Path</Button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search career paths..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <select
            className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
            value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          >
            {categories.map(cat => <option key={cat}>{cat}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={() => { setQ(""); setCategoryFilter("All") }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <DataState
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          isEmpty={filtered.length === 0}
          loadingLabel="Loading career paths..."
          empty={{
            title: "No career paths found",
            description: q || categoryFilter !== "All"
              ? "Try a different search or filter."
              : "No active career paths in the catalog yet.",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Avg Salary</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <span className="font-medium">{p.title}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{p.category}</Badge></TableCell>
                  <TableCell><Badge variant={difficultyVariant[p.difficulty_level] ?? "secondary"}>{p.difficulty_level}</Badge></TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">{p.average_salary || "—"}</TableCell>
                  <TableCell className="text-sm">{p.required_skills.length}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                      <Users className="h-3.5 w-3.5" />{p.followers.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} />
                  </TableCell>
                  <TableCell>
                    <RowActions onView={() => c.open("view", p)} onEdit={() => startEdit(p)} onDelete={() => c.open("delete", p)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataState>
      </div>

      {/* Create / Edit Modal */}
      <FormModal
        open={c.mode === "create" || c.mode === "edit"}
        onOpenChange={v => !v && c.close()}
        title={c.mode === "create" ? "New Career Path" : "Edit Career Path"}
        onSubmit={submit}
        loading={c.loading}
      >
        <Field label="Title *" error={errors.title}>
          <Input placeholder="e.g. Backend Developer" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category *" error={errors.category}>
            <select
              className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
              value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            >
              <option>Engineering</option>
              <option>Data</option>
              <option>Design</option>
              <option>Product</option>
              <option>AI</option>
              <option>Business</option>
              <option>Security</option>
            </select>
          </Field>
          <Field label="Difficulty Level">
            <select
              className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
              value={form.difficulty_level} onChange={e => setForm({ ...form, difficulty_level: e.target.value as CareerPath["difficulty_level"] })}
            >
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
            </select>
          </Field>
        </div>
        <Field label="Average Salary" hint="e.g. $75,000 – $120,000">
          <Input placeholder="$75,000 – $120,000" value={form.average_salary} onChange={e => setForm({ ...form, average_salary: e.target.value })} />
        </Field>
        <Field label="Description">
          <Textarea rows={3} placeholder="Describe this career path..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </Field>

        {/* Required Skills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Required Skills</label>
            <Button type="button" variant="outline" size="sm" onClick={addSkill}><Plus className="h-3.5 w-3.5 mr-1" />Add Skill</Button>
          </div>
          {form.required_skills.length === 0 && (
            <p className="text-xs text-[var(--muted-foreground)] py-2">No required skills added yet.</p>
          )}
          {form.required_skills.map((sk, i) => (
            <div key={i} className="grid grid-cols-[1fr_140px_100px_32px] gap-2 items-start">
              <div>
                <Input
                  placeholder="Skill name"
                  value={sk.skill_name}
                  onChange={e => updateSkill(i, { skill_name: e.target.value })}
                  className={errors[`skill_${i}`] ? "border-red-500" : ""}
                />
                {errors[`skill_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`skill_${i}`]}</p>}
              </div>
              <select
                className="h-9 px-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
                value={sk.required_level}
                onChange={e => updateSkill(i, { required_level: e.target.value as RequiredSkill["required_level"] })}
              >
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
              <select
                className="h-9 px-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
                value={sk.priority}
                onChange={e => updateSkill(i, { priority: e.target.value as RequiredSkill["priority"] })}
              >
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
              <button
                type="button"
                onClick={() => removeSkill(i)}
                className="h-9 w-8 flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:text-red-500 hover:border-red-300 transition"
              >✕</button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
          <label className="text-sm font-medium">Active (visible to students)</label>
        </div>
      </FormModal>

      {/* Details Modal */}
      <DetailsModal open={c.mode === "view"} onOpenChange={v => !v && c.close()} title="Career Path Details">
        {c.selected && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg">{c.selected.title}</p>
              <Badge variant={c.selected.is_active ? "success" : "secondary"}>{c.selected.is_active ? "Active" : "Inactive"}</Badge>
            </div>
            {c.selected.description && <p className="text-[var(--muted-foreground)]">{c.selected.description}</p>}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
              <div>Category: <Badge variant="secondary">{c.selected.category}</Badge></div>
              <div>Difficulty: <Badge variant={difficultyVariant[c.selected.difficulty_level] ?? "secondary"}>{c.selected.difficulty_level}</Badge></div>
              <div>Avg Salary: <span className="font-medium">{c.selected.average_salary || "—"}</span></div>
              <div>Followers: <span className="font-medium">{c.selected.followers.toLocaleString()}</span></div>
              <div>Created: <span className="font-medium">{c.selected.created_at}</span></div>
            </div>
            {c.selected.required_skills.length > 0 && (
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="font-medium mb-2">Required Skills</p>
                <div className="space-y-2">
                  {c.selected.required_skills.map((sk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="font-medium">{sk.skill_name}</span>
                      <Badge variant="secondary" className="text-xs">{sk.required_level}</Badge>
                      <Badge variant={sk.priority === "High" ? "default" : sk.priority === "Medium" ? "secondary" : "outline"} className="text-xs">{sk.priority}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog
        open={c.mode === "delete"}
        onOpenChange={v => !v && c.close()}
        title={`Delete "${c.selected?.title}"?`}
        description="Students following this path will lose their roadmap data."
        onConfirm={del}
        loading={c.loading}
      />
    </div>
  )
}
