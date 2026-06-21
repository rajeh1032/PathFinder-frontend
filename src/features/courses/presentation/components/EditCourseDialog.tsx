import { useEffect, useState } from "react"
import { FormModal, Field } from "@/shared/components/crud"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Switch } from "@/shared/components/ui/switch"
import { Label } from "@/shared/components/ui/label"
import { CourseImage } from "./CourseImage"
import type { CourseDto, CourseUpdatePayload } from "../../domain/courses.types"

type Props = {
  course: CourseDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, payload: CourseUpdatePayload) => Promise<void>
}

type FormState = {
  title: string
  description: string
  category: string
  level: string
  duration: string
  language: string
  video_url: string
  thumbnail_url: string
  learning_outcomes: string
  is_free: boolean
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  category: "",
  level: "",
  duration: "",
  language: "",
  video_url: "",
  thumbnail_url: "",
  learning_outcomes: "",
  is_free: false,
}

const toForm = (course: CourseDto): FormState => ({
  title: course.title ?? "",
  description: course.description ?? "",
  category: course.category ?? "",
  level: course.level ?? "",
  duration: course.duration ?? "",
  language: course.language ?? "",
  video_url: course.videoUrl ?? "",
  thumbnail_url: course.thumbnailUrl ?? "",
  learning_outcomes: (course.learningOutcomes ?? []).join("\n"),
  is_free: course.isFree,
})

/** Admin edit dialog backed by `PATCH /courses/:id`. */
export function EditCourseDialog({ course, open, onOpenChange, onSave }: Props) {
  const [form, setForm] = useState<FormState>(() => (course ? toForm(course) : EMPTY_FORM))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (course) {
      setForm(toForm(course))
      setErrors({})
    } else {
      setForm(EMPTY_FORM)
    }
  }, [course])

  const submit = async () => {
    if (!course) return
    const nextErrors: Record<string, string> = {}
    if (!form.title.trim() || form.title.trim().length < 2) nextErrors.title = "Title must be at least 2 characters"
    if (form.description.trim() && form.description.trim().length < 10) {
      nextErrors.description = "Description must be at least 10 characters"
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const payload: CourseUpdatePayload = {
      title: form.title.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      category: form.category.trim() ? form.category.trim() : null,
      level: form.level.trim() ? form.level.trim() : null,
      duration: form.duration.trim() ? form.duration.trim() : null,
      language: form.language.trim() ? form.language.trim() : null,
      video_url: form.video_url.trim() ? form.video_url.trim() : null,
      thumbnail_url: form.thumbnail_url.trim() ? form.thumbnail_url.trim() : null,
      learning_outcomes: form.learning_outcomes
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length >= 2),
      is_free: form.is_free,
    }

    setSaving(true)
    try {
      await onSave(course.id, payload)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormModal
      open={open}
      onOpenChange={(v) => !saving && onOpenChange(v)}
      title="Edit Course"
      onSubmit={submit}
      submitLabel="Save changes"
      loading={saving}
    >
      <Field label="Title *" error={errors.title}>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </Field>

      <Field label="Description" error={errors.description} hint="At least 10 characters if provided">
        <Textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </Field>
        <Field label="Level">
          <Input
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            placeholder="Beginner / Intermediate / Advanced"
          />
        </Field>
        <Field label="Duration" hint="e.g. 24h">
          <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        </Field>
        <Field label="Language">
          <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
        </Field>
      </div>

      <Field label="Video URL" hint="YouTube, Vimeo, or direct link">
        <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://..." />
      </Field>

      <Field label="Thumbnail URL">
        <Input
          value={form.thumbnail_url}
          onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
          placeholder="https://..."
        />
        {form.thumbnail_url?.trim() && (
          <CourseImage
            src={form.thumbnail_url}
            alt="Course thumbnail preview"
            className="mt-1 h-32 w-full rounded-md border border-[var(--border)]"
          />
        )}
      </Field>

      <Field label="Learning outcomes" hint="One per line">
        <Textarea
          rows={3}
          value={form.learning_outcomes}
          onChange={(e) => setForm({ ...form, learning_outcomes: e.target.value })}
        />
      </Field>

      <div className="flex items-center gap-3 pt-1">
        <Switch
          id="edit-free"
          checked={form.is_free}
          onCheckedChange={(v) => setForm({ ...form, is_free: v })}
        />
        <Label htmlFor="edit-free">Free course</Label>
      </div>
    </FormModal>
  )
}
