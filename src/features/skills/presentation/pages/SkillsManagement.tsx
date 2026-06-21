import React, { useEffect, useMemo, useState } from "react"
import { Plus, Search, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { ApiError } from "@/core/api/api-client"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Switch } from "@/shared/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { DataState } from "@/shared/components/custom"
import { FormModal, DetailsModal, ConfirmDeleteDialog, RowActions, Field } from "@/shared/components/crud"
import { useSkills } from "../../application/useSkills"
import { skillsApi, parseAliases, formatAliases } from "../../data/skills.api"
import type { Skill, SkillDetail, SkillsSort } from "../../domain/skills.types"

const CATEGORY_OPTIONS = ["Frontend", "Programming", "Database", "DevOps", "Design", "Cloud", "Security", "AI"]
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"]

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

type Mode = "none" | "create" | "edit" | "view" | "delete"

type FormState = {
  name: string
  category: string
  level: string
  aliases: string
  is_active: boolean
}

const emptyForm: FormState = { name: "", category: "Frontend", level: "Beginner", aliases: "", is_active: true }

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function SkillsManagement() {
  const skills = useSkills()
  const { items, pagination, isLoading, error } = skills

  const [mode, setMode] = useState<Mode>("none")
  const [selected, setSelected] = useState<Skill | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<SkillDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Category options derived from the current page plus the fixed catalog.
  const categories = useMemo(() => {
    const set = new Set<string>(CATEGORY_OPTIONS)
    items.forEach((s) => s.category && set.add(s.category))
    return ["All", ...Array.from(set)]
  }, [items])

  const close = () => {
    setMode("none")
    setSelected(null)
    setDetail(null)
    setErrors({})
  }

  const startCreate = () => {
    setForm(emptyForm)
    setErrors({})
    setSelected(null)
    setMode("create")
  }

  const startEdit = (s: Skill) => {
    setForm({
      name: s.name,
      category: s.category ?? "",
      level: s.level ?? "",
      aliases: formatAliases(s.aliases),
      is_active: s.is_active,
    })
    setErrors({})
    setSelected(s)
    setMode("edit")
  }

  // Load usage counts when opening the details modal.
  useEffect(() => {
    if (mode !== "view" || !selected) return
    let active = true
    setDetailLoading(true)
    setDetail(null)
    skillsApi
      .getById(selected.id)
      .then((data) => {
        if (active) setDetail(data)
      })
      .catch((err) => {
        if (active) toast.error(errorMessage(err, "Failed to load skill details"))
      })
      .finally(() => {
        if (active) setDetailLoading(false)
      })
    return () => {
      active = false
    }
  }, [mode, selected])

  const submit = async () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Required"
    if (!form.category.trim()) e.category = "Required"
    setErrors(e)
    if (Object.keys(e).length) return

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      level: form.level.trim() || null,
      aliases: parseAliases(form.aliases),
      is_active: form.is_active,
    }

    setSubmitting(true)
    try {
      if (mode === "create") {
        await skills.createSkill(payload)
        toast.success("Skill added")
      } else if (selected) {
        await skills.updateSkill(selected.id, payload)
        toast.success("Skill updated")
      }
      close()
    } catch (err) {
      toast.error(errorMessage(err, "Failed to save skill"))
    } finally {
      setSubmitting(false)
    }
  }

  const del = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      await skills.removeSkill(selected.id)
      toast.success("Skill deleted")
      close()
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete skill"))
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (s: Skill) => {
    try {
      await skills.updateSkill(s.id, { is_active: !s.is_active })
      toast.success(s.is_active ? "Skill deactivated" : "Skill activated")
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update skill"))
    }
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
            <Input
              placeholder="Search skills or categories..."
              className="pl-9"
              value={skills.search}
              onChange={(e) => skills.setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
            value={skills.category || "All"}
            onChange={(e) => skills.setCategory(e.target.value === "All" ? "" : e.target.value)}
          >
            {categories.map((cat) => <option key={cat}>{cat}</option>)}
          </select>
          <select
            className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm"
            value={skills.sort}
            onChange={(e) => skills.setSort(e.target.value as SkillsSort)}
          >
            <option value="name">Name (A–Z)</option>
            <option value="newest">Newest</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { skills.setSearch(""); skills.setCategory(""); skills.refetch() }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <DataState
          isLoading={isLoading}
          error={error}
          isEmpty={items.length === 0}
          onRetry={skills.refetch}
          loadingLabel="Loading skills..."
          empty={{
            title: "No skills found",
            description: skills.search || skills.category ? "Try a different search or filter." : "Add your first skill.",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Aliases</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    {s.category ? (
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${categoryColor[s.category] ?? "bg-gray-500/10 text-gray-600"}`}>
                        {s.category}
                      </span>
                    ) : (
                      <span className="text-[var(--muted-foreground)]">—</span>
                    )}
                  </TableCell>
                  <TableCell>{s.level ? <Badge variant="secondary">{s.level}</Badge> : <span className="text-[var(--muted-foreground)]">—</span>}</TableCell>
                  <TableCell className="text-xs text-[var(--muted-foreground)] max-w-[200px] truncate">{formatAliases(s.aliases) || "—"}</TableCell>
                  <TableCell>
                    <Switch checked={s.is_active} onCheckedChange={() => toggleActive(s)} />
                  </TableCell>
                  <TableCell>
                    <RowActions onView={() => { setSelected(s); setMode("view") }} onEdit={() => startEdit(s)} onDelete={() => { setSelected(s); setMode("delete") }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataState>

        {!isLoading && !error && items.length > 0 && (
          <div className="p-4 border-t border-[var(--border)] flex items-center justify-between text-sm">
            <p className="text-[var(--muted-foreground)]">
              Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} skills
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPreviousPage}
                onClick={() => pagination.previousPage && skills.setPage(pagination.previousPage)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => pagination.nextPage && skills.setPage(pagination.nextPage)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <FormModal
        open={mode === "create" || mode === "edit"}
        onOpenChange={(v) => !v && close()}
        title={mode === "create" ? "Add Skill" : "Edit Skill"}
        onSubmit={submit}
        loading={submitting}
      >
        <Field label="Name *" error={errors.name}>
          <Input placeholder="e.g. React" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category *" error={errors.category}>
            <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORY_OPTIONS.map((cat) => <option key={cat}>{cat}</option>)}
            </select>
          </Field>
          <Field label="Level">
            <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="">None</option>
              {LEVEL_OPTIONS.map((lvl) => <option key={lvl}>{lvl}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Aliases" hint="Comma-separated alternate names for matching (e.g. ReactJS, React.js)">
          <Input placeholder="ReactJS, React.js" value={form.aliases} onChange={(e) => setForm({ ...form, aliases: e.target.value })} />
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
          <label className="text-sm font-medium">Active</label>
        </div>
      </FormModal>

      <DetailsModal open={mode === "view"} onOpenChange={(v) => !v && close()} title="Skill Details">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg">{selected.name}</p>
              <Badge variant={selected.is_active ? "success" : "secondary"}>{selected.is_active ? "Active" : "Inactive"}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
              <div>Category: {selected.category ? <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${categoryColor[selected.category] ?? "bg-gray-500/10 text-gray-600"}`}>{selected.category}</span> : "—"}</div>
              <div>Level: {selected.level ? <Badge variant="secondary">{selected.level}</Badge> : "—"}</div>
              {selected.aliases.length > 0 && <div className="col-span-2">Aliases: <span className="text-[var(--muted-foreground)]">{formatAliases(selected.aliases)}</span></div>}
              {selected.created_at && <div>Created: <span className="font-medium">{selected.created_at.slice(0, 10)}</span></div>}
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--border)]">
              <div className="text-center p-3 rounded-lg bg-[var(--muted)]">
                <p className="text-xl font-bold">{detailLoading ? "…" : (detail?.users_count ?? 0).toLocaleString()}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Users</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--muted)]">
                <p className="text-xl font-bold">{detailLoading ? "…" : (detail?.career_paths_count ?? 0)}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Career Paths</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--muted)]">
                <p className="text-xl font-bold">{detailLoading ? "…" : (detail?.cv_skills_count ?? 0).toLocaleString()}</p>
                <p className="text-xs text-[var(--muted-foreground)]">CV Skills</p>
              </div>
            </div>
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog
        open={mode === "delete"}
        onOpenChange={(v) => !v && close()}
        title={`Delete "${selected?.name}"?`}
        description="This skill will be removed from the catalog. If it is still referenced by users, career paths, or CVs, the backend will block deletion and you should deactivate it instead."
        onConfirm={del}
        loading={submitting}
      />
    </div>
  )
}
