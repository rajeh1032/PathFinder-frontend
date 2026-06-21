import React from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Card } from "@/shared/components/ui/card"

export function CareerPathEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = React.useState({
    title: isEdit ? "Frontend Engineer" : "",
    category: isEdit ? "Engineering" : "",
    description: isEdit ? "Build modern web interfaces using React and TypeScript." : "",
    durationMonths: isEdit ? "12" : "",
    skills: isEdit ? "React, TypeScript, CSS" : "",
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [saving, setSaving] = React.useState(false)

  const set = <K extends keyof typeof form>(k: K, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k as string]) setErrors(e => ({ ...e, [k as string]: "" }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Title is required"
    if (!form.category.trim()) e.category = "Category is required"
    if (!form.durationMonths || Number(form.durationMonths) <= 0) e.durationMonths = "Enter valid duration"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = () => {
    if (!validate()) return
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success(isEdit ? "Career path updated" : "Career path created")
      navigate("/career-paths")
    }, 600)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/career-paths")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Career Path" : "Create Career Path"}</h1>
          <p className="text-[var(--muted-foreground)]">Define a structured career journey for students.</p>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Data Scientist" />
          {errors.title && <p className="text-sm text-[var(--destructive)]">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Input value={form.category} onChange={e => set("category", e.target.value)} placeholder="Engineering" />
            {errors.category && <p className="text-sm text-[var(--destructive)]">{errors.category}</p>}
          </div>
          <div className="space-y-2">
            <Label>Duration (months)</Label>
            <Input type="number" value={form.durationMonths} onChange={e => set("durationMonths", e.target.value)} />
            {errors.durationMonths && <p className="text-sm text-[var(--destructive)]">{errors.durationMonths}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea rows={4} value={form.description} onChange={e => set("description", e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Required Skills (comma-separated)</Label>
          <Input value={form.skills} onChange={e => set("skills", e.target.value)} placeholder="React, TypeScript" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => navigate("/career-paths")}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Path"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
