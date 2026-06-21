import React, { useState } from "react"
import { Plus, MapPin, CheckCircle2, Circle, Clock, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { FormModal, DetailsModal, ConfirmDeleteDialog, RowActions, EmptyState, Field, useCrud } from "@/shared/components/crud"

type Step = { name: string; status: "done" | "active" | "pending" }
type Roadmap = { id: string; title: string; duration: string; users: number; published: boolean; steps: Step[] }

const initial: Roadmap[] = [
  { id: "1", title: "Frontend Developer Roadmap", duration: "6 months", users: 3240, published: true, steps: [
    { name: "HTML & CSS Basics", status: "done" }, { name: "JavaScript Fundamentals", status: "done" },
    { name: "React + State Management", status: "active" }, { name: "TypeScript", status: "pending" }, { name: "Testing & Deployment", status: "pending" },
  ]},
  { id: "2", title: "Data Scientist Roadmap", duration: "9 months", users: 2150, published: true, steps: [
    { name: "Python", status: "done" }, { name: "Statistics & Math", status: "done" }, { name: "Pandas & NumPy", status: "done" },
    { name: "Machine Learning", status: "active" }, { name: "Deep Learning", status: "pending" }, { name: "MLOps", status: "pending" },
  ]},
  { id: "3", title: "DevOps Engineer Roadmap", duration: "8 months", users: 1450, published: false, steps: [
    { name: "Linux & Bash", status: "done" }, { name: "Docker", status: "active" }, { name: "Kubernetes", status: "pending" }, { name: "CI/CD", status: "pending" }, { name: "Monitoring", status: "pending" },
  ]},
]

const StepIcon = ({ status }: { status: string }) =>
  status === "done" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
  status === "active" ? <Clock className="h-4 w-4 text-blue-500" /> : <Circle className="h-4 w-4 text-[var(--muted-foreground)]" />

const empty = { title: "", duration: "", published: false, steps: [] as Step[] }

export function Roadmaps() {
  const c = useCrud<Roadmap>(initial)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [stepInput, setStepInput] = useState("")

  const startCreate = () => { setForm(empty); setErrors({}); setStepInput(""); c.open("create") }
  const startEdit = (r: Roadmap) => { setForm({ title: r.title, duration: r.duration, published: r.published, steps: [...r.steps] }); setErrors({}); setStepInput(""); c.open("edit", r) }

  const addStep = () => {
    if (!stepInput.trim()) return
    setForm({ ...form, steps: [...form.steps, { name: stepInput.trim(), status: "pending" }] })
    setStepInput("")
  }
  const removeStep = (i: number) => setForm({ ...form, steps: form.steps.filter((_, idx) => idx !== i) })

  const submit = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Required"
    if (!form.duration.trim()) e.duration = "Required"
    if (form.steps.length === 0) e.steps = "Add at least one step"
    setErrors(e); if (Object.keys(e).length) return
    c.setLoading(true)
    setTimeout(() => {
      if (c.mode === "create") {
        c.setItems(p => [{ ...form, id: String(Date.now()), users: 0 }, ...p])
        toast.success("Roadmap created")
      } else if (c.selected) {
        c.setItems(p => p.map(x => x.id === c.selected!.id ? { ...x, ...form } : x))
        toast.success("Roadmap updated")
      }
      c.setLoading(false); c.close()
    }, 250)
  }

  const togglePublish = (r: Roadmap) => {
    c.setItems(p => p.map(x => x.id === r.id ? { ...x, published: !x.published } : x))
    toast.success(r.published ? "Unpublished" : "Published")
  }

  const del = () => {
    c.setLoading(true)
    setTimeout(() => {
      c.setItems(p => p.filter(x => x.id !== c.selected!.id))
      c.setLoading(false); c.close(); toast.success("Roadmap deleted")
    }, 200)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roadmaps</h1>
          <p className="text-[var(--muted-foreground)]">Step-by-step learning journeys for each career path.</p>
        </div>
        <Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" />New Roadmap</Button>
      </div>

      {c.items.length === 0 ? (
        <EmptyState title="No roadmaps yet" action={<Button onClick={startCreate}><Plus className="mr-2 h-4 w-4" />New Roadmap</Button>} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {c.items.map(r => {
            const completed = r.steps.filter(s => s.status === "done").length
            const pct = r.steps.length ? Math.round((completed / r.steps.length) * 100) : 0
            return (
              <Card key={r.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center"><MapPin className="h-5 w-5" /></div>
                      <div>
                        <CardTitle>{r.title}</CardTitle>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">{r.duration} · {r.users.toLocaleString()} users</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.published ? "success" : "secondary"}>{r.published ? "Published" : "Draft"}</Badge>
                      <RowActions onView={() => c.open("view", r)} onEdit={() => startEdit(r)} onDelete={() => c.open("delete", r)} extra={[{ label: r.published ? "Unpublish" : "Publish", onClick: () => togglePublish(r) }]} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-1.5"><span>Avg. progress</span><span>{pct}%</span></div>
                    <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden"><div className="h-full bg-[var(--primary)] transition-all" style={{ width: `${pct}%` }} /></div>
                  </div>
                  <ul className="space-y-2">
                    {r.steps.map((s, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm">
                        <StepIcon status={s.status} />
                        <span className={s.status === "done" ? "text-[var(--muted-foreground)] line-through" : ""}>{s.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <FormModal open={c.mode === "create" || c.mode === "edit"} onOpenChange={v => !v && c.close()} title={c.mode === "create" ? "New Roadmap" : "Edit Roadmap"} onSubmit={submit} loading={c.loading}>
        <Field label="Title" error={errors.title}><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration" error={errors.duration} hint="e.g. 6 months"><Input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></Field>
          <Field label="Visibility">
            <select className="w-full h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm" value={form.published ? "published" : "draft"} onChange={e => setForm({ ...form, published: e.target.value === "published" })}>
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
          </Field>
        </div>
        <Field label="Steps" error={errors.steps}>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input placeholder="Step name" value={stepInput} onChange={e => setStepInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addStep())} />
              <Button type="button" variant="outline" onClick={addStep}>Add</Button>
            </div>
            {form.steps.length > 0 && (
              <ul className="space-y-1.5 border border-[var(--border)] rounded-md p-2 max-h-48 overflow-auto">
                {form.steps.map((s, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-sm">
                    <select className="text-xs px-2 py-1 rounded border border-[var(--border)] bg-[var(--background)]" value={s.status} onChange={e => setForm({ ...form, steps: form.steps.map((x, idx) => idx === i ? { ...x, status: e.target.value as Step["status"] } : x) })}>
                      <option value="pending">Pending</option><option value="active">Active</option><option value="done">Done</option>
                    </select>
                    <span className="flex-1">{s.name}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(i)}><X className="h-4 w-4" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Field>
      </FormModal>

      <DetailsModal open={c.mode === "view"} onOpenChange={v => !v && c.close()} title="Roadmap Details">
        {c.selected && (
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-lg">{c.selected.title}</p>
            <p className="text-[var(--muted-foreground)]">{c.selected.duration} · {c.selected.users.toLocaleString()} users · {c.selected.published ? "Published" : "Draft"}</p>
            <ul className="space-y-2 pt-2">
              {c.selected.steps.map((s, i) => <li key={i} className="flex items-center gap-2"><StepIcon status={s.status} />{s.name}</li>)}
            </ul>
          </div>
        )}
      </DetailsModal>

      <ConfirmDeleteDialog open={c.mode === "delete"} onOpenChange={v => !v && c.close()} title={`Delete "${c.selected?.title}"?`} onConfirm={del} loading={c.loading} />
    </div>
  )
}
