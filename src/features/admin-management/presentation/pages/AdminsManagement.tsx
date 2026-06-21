import React, { useMemo, useState } from "react"
import { Plus, Search, Shield } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { FormModal, DetailsModal, ConfirmDeleteDialog, RowActions, EmptyState, Field, useCrud } from "@/shared/components/crud"

type Admin = { id: string; name: string; email: string; role: string; status: "Active" | "Inactive" | "Pending"; lastLogin: string }

const initial: Admin[] = [
  { id: "1", name: "Mona Adel", email: "mona@pathfinder.ai", role: "Super Admin", status: "Active", lastLogin: "2026-05-30 09:12" },
  { id: "2", name: "Karim Yousef", email: "karim@pathfinder.ai", role: "Content Manager", status: "Active", lastLogin: "2026-05-30 08:40" },
  { id: "3", name: "Lina Roberts", email: "lina@pathfinder.ai", role: "Support", status: "Active", lastLogin: "2026-05-29 17:05" },
  { id: "4", name: "Omar Tarek", email: "omar@pathfinder.ai", role: "Analyst", status: "Inactive", lastLogin: "2026-05-22 14:18" },
  { id: "5", name: "Hala Said", email: "hala@pathfinder.ai", role: "Moderator", status: "Pending", lastLogin: "Never" },
]

const empty: Omit<Admin, "id" | "lastLogin"> = { name: "", email: "", role: "Support", status: "Pending" }

export function AdminsManagement() {
  const c = useCrud<Admin>(initial)
  const [q, setQ] = useState("")
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filtered = useMemo(() => c.items.filter(a => !q || a.name.toLowerCase().includes(q.toLowerCase()) || a.email.toLowerCase().includes(q.toLowerCase())), [c.items, q])

  const startCreate = () => { setForm(empty); setErrors({}); c.open("create") }
  const startEdit = (a: Admin) => { setForm(a); setErrors({}); c.open("edit", a) }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Required"
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Invalid email"
    setErrors(e); return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!validate()) return
    c.setLoading(true)
    setTimeout(() => {
      if (c.mode === "create") {
        c.setItems(p => [{ ...form, id: String(Date.now()), lastLogin: "Never" }, ...p])
        toast.success("Invite sent to admin")
      } else if (c.selected) {
        c.setItems(p => p.map(a => a.id === c.selected!.id ? { ...a, ...form } : a))
        toast.success("Admin updated")
      }
      c.setLoading(false); c.close()
    }, 250)
  }

  const del = () => {
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(a => a.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Admin removed")
    }, 200)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admins Management</h1>
          <p className="text-[var(--muted-foreground)]">Manage admin accounts and access levels.</p>
        </div>
        <Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" />Invite Admin</Button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search admins..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No admins found" description={q ? "Try a different search." : "Invite your first admin."} action={!q && <Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" />Invite Admin</Button>} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Last Login</TableHead><TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-semibold text-xs">{a.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                      <div><p className="font-medium">{a.name}</p><p className="text-xs text-[var(--muted-foreground)]">{a.email}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-[var(--muted-foreground)]" /><span className="text-sm">{a.role}</span></div></TableCell>
                  <TableCell><Badge variant={a.status === "Active" ? "success" : a.status === "Pending" ? "warning" : "secondary"}>{a.status}</Badge></TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">{a.lastLogin}</TableCell>
                  <TableCell><RowActions onView={() => c.open("view", a)} onEdit={() => startEdit(a)} onDelete={() => c.open("delete", a)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <FormModal open={c.mode === "create" || c.mode === "edit"} onOpenChange={v => !v && c.close()} title={c.mode === "create" ? "Invite Admin" : "Edit Admin"} onSubmit={submit} loading={c.loading} submitLabel={c.mode === "create" ? "Send Invite" : "Save"}>
        <Field label="Name" error={errors.name}><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Email" error={errors.email}><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Role">
          <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option>Super Admin</option><option>Content Manager</option><option>Support</option><option>Analyst</option><option>Moderator</option>
          </select>
        </Field>
        <Field label="Status">
          <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Admin["status"] })}>
            <option>Active</option><option>Inactive</option><option>Pending</option>
          </select>
        </Field>
      </FormModal>

      <DetailsModal open={c.mode === "view"} onOpenChange={v => !v && c.close()} title="Admin Details">
        {c.selected && (
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-base">{c.selected.name}</p>
            <p className="text-[var(--muted-foreground)]">{c.selected.email}</p>
            <div>Role: <Badge variant="secondary">{c.selected.role}</Badge></div>
            <div>Status: <Badge variant={c.selected.status === "Active" ? "success" : c.selected.status === "Pending" ? "warning" : "secondary"}>{c.selected.status}</Badge></div>
            <div>Last login: <span className="text-[var(--muted-foreground)]">{c.selected.lastLogin}</span></div>
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title={`Remove ${c.selected?.name}?`} description="They will lose access to the admin panel immediately." onConfirm={del} loading={c.loading} />
    </div>
  )
}
