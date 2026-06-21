import React, { useState } from "react"
import { Plus, Edit, Trash2, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { FormModal, ConfirmDeleteDialog, EmptyState, Field, useCrud } from "@/shared/components/crud"

type Role = { id: string; name: string; users: number; desc: string; perms: string[] }

const initial: Role[] = [
  { id: "1", name: "Super Admin", users: 2, desc: "Unrestricted access to all features and settings.", perms: ["users.*", "jobs.*", "ai.*", "settings.*"] },
  { id: "2", name: "Content Manager", users: 4, desc: "Manage career paths, courses, and roadmaps.", perms: ["career-paths.*", "courses.*", "roadmaps.*"] },
  { id: "3", name: "Support", users: 6, desc: "Read-only access plus user account help.", perms: ["users.read", "users.support"] },
  { id: "4", name: "Analyst", users: 3, desc: "View analytics, reports, and AI logs.", perms: ["analytics.read", "ai-logs.read"] },
  { id: "5", name: "Moderator", users: 5, desc: "Moderate user-generated content.", perms: ["jobs.review", "users.flag"] },
]

const empty: Omit<Role, "id" | "users"> = { name: "", desc: "", perms: [] }

export function RolesPermissions() {
  const c = useCrud<Role>(initial)
  const [form, setForm] = useState(empty)
  const [permsText, setPermsText] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const startCreate = () => { setForm(empty); setPermsText(""); setErrors({}); c.open("create") }
  const startEdit = (r: Role) => {
    if (r.name === "Super Admin") { toast.error("The Super Admin role is protected and cannot be edited."); return }
    setForm({ name: r.name, desc: r.desc, perms: r.perms }); setPermsText(r.perms.join(", ")); setErrors({}); c.open("edit", r)
  }
  const startDelete = (r: Role) => {
    if (r.name === "Super Admin") { toast.error("The Super Admin role cannot be deleted."); return }
    c.open("delete", r)
  }

  const submit = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Required"
    if (!form.desc.trim()) e.desc = "Required"
    setErrors(e); if (Object.keys(e).length) return
    const perms = permsText.split(",").map(s => s.trim()).filter(Boolean)
    c.setLoading(true)
    setTimeout(() => {
      if (c.mode === "create") {
        c.setItems(p => [...p, { ...form, perms, id: String(Date.now()), users: 0 }])
        toast.success("Role created")
      } else if (c.selected) {
        c.setItems(p => p.map(r => r.id === c.selected!.id ? { ...r, ...form, perms } : r))
        toast.success("Role updated")
      }
      c.setLoading(false); c.close()
    }, 250)
  }

  const del = () => {
    if (c.selected && c.selected.users > 0) { toast.error("Cannot delete a role with assigned users."); c.close(); return }
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(r => r.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Role deleted")
    }, 200)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-[var(--muted-foreground)]">Configure access levels for the admin panel.</p>
        </div>
        <Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" />New Role</Button>
      </div>

      {c.items.length === 0 ? (
        <EmptyState title="No roles defined" action={<Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" />New Role</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {c.items.map(r => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{r.name}</CardTitle>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{r.users} users</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(r)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => startDelete(r)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-[var(--muted-foreground)]">{r.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.perms.map(p => <Badge key={p} variant="secondary"><Check className="h-3 w-3 mr-1" />{p}</Badge>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FormModal open={c.mode === "create" || c.mode === "edit"} onOpenChange={v => !v && c.close()} title={c.mode === "create" ? "New Role" : "Edit Role"} onSubmit={submit} loading={c.loading}>
        <Field label="Name" error={errors.name}><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Description" error={errors.desc}><Textarea rows={3} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} /></Field>
        <Field label="Permissions" hint="Comma-separated, e.g. users.read, jobs.*"><Input value={permsText} onChange={e => setPermsText(e.target.value)} /></Field>
      </FormModal>

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title={`Delete role "${c.selected?.name}"?`} description={c.selected && c.selected.users > 0 ? `This role has ${c.selected.users} assigned users — reassign them first.` : "This action cannot be undone."} onConfirm={del} loading={c.loading} />
    </div>
  )
}
