import React, { useMemo, useRef, useState } from "react"
import {
  Upload, Video as VideoIcon, Eye, Edit, Trash2, Copy, RefreshCw, Pause, X,
  CheckCircle2, AlertTriangle, Search, Film, HardDrive, Tag,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { ConfirmDeleteDialog, EmptyState, Field, FormModal, RowActions, useCrud } from "@/shared/components/crud"
import { PermissionButton, usePermissions } from "@/shared/lib/permissions"

type VStatus = "draft" | "uploading" | "processing" | "published" | "private" | "failed"
type Vis = "public" | "private" | "draft"

type Video = {
  id: string; title: string; description: string;
  category: string; relatedSkill: string; relatedCareer: string; relatedCourse: string; relatedStep: string
  duration: string; size: string; tags: string[]
  status: VStatus; visibility: Vis; uploader: string; createdAt: string; updatedAt: string
  thumbnail: string; url: string; progress: number; error?: string
}

const CATEGORIES = ["Career Path", "Skill", "Course", "Roadmap Step", "Interview Prep", "CV Improvement", "AI Career Guidance"]
const SKILLS = ["React", "TypeScript", "Node.js", "AWS", "System Design", "Communication"]
const CAREERS = ["Frontend Engineer", "Backend Engineer", "Data Analyst", "Product Manager"]
const COURSES = ["React Fundamentals", "AWS Solutions Architect", "System Design 101"]
const STEPS = ["1. Foundations", "2. Intermediate", "3. Advanced", "4. Capstone"]

const initial: Video[] = [
  { id: "v1", title: "React Hooks Deep Dive", description: "Comprehensive walkthrough of React hooks.", category: "Skill", relatedSkill: "React", relatedCareer: "Frontend Engineer", relatedCourse: "React Fundamentals", relatedStep: "2. Intermediate", duration: "18:42", size: "184 MB", tags: ["react", "hooks"], status: "published", visibility: "public", uploader: "Sarah Admin", createdAt: "2026-05-12", updatedAt: "2026-05-14", thumbnail: "", url: "https://cdn.example.com/v/v1.mp4", progress: 100 },
  { id: "v2", title: "Behavioral Interview Patterns", description: "STAR method examples.", category: "Interview Prep", relatedSkill: "Communication", relatedCareer: "Product Manager", relatedCourse: "", relatedStep: "", duration: "12:08", size: "96 MB", tags: ["interview", "behavioral"], status: "published", visibility: "public", uploader: "Hala Said", createdAt: "2026-05-19", updatedAt: "2026-05-19", thumbnail: "", url: "https://cdn.example.com/v/v2.mp4", progress: 100 },
  { id: "v3", title: "Resume Tips for Engineers", description: "What recruiters look for.", category: "CV Improvement", relatedSkill: "", relatedCareer: "Frontend Engineer", relatedCourse: "", relatedStep: "", duration: "07:51", size: "62 MB", tags: ["cv", "resume"], status: "draft", visibility: "draft", uploader: "John Doe", createdAt: "2026-05-25", updatedAt: "2026-05-25", thumbnail: "", url: "", progress: 100 },
  { id: "v4", title: "AWS S3 Walkthrough", description: "Storage classes & lifecycle.", category: "Course", relatedSkill: "AWS", relatedCareer: "Backend Engineer", relatedCourse: "AWS Solutions Architect", relatedStep: "1. Foundations", duration: "22:14", size: "245 MB", tags: ["aws", "s3"], status: "processing", visibility: "private", uploader: "Sarah Admin", createdAt: "2026-05-30", updatedAt: "2026-05-30", thumbnail: "", url: "", progress: 72 },
  { id: "v5", title: "Capstone Demo Project", description: "Final project walkthrough.", category: "Roadmap Step", relatedSkill: "React", relatedCareer: "Frontend Engineer", relatedCourse: "React Fundamentals", relatedStep: "4. Capstone", duration: "—", size: "0 MB", tags: ["capstone"], status: "failed", visibility: "draft", uploader: "Hala Said", createdAt: "2026-05-31", updatedAt: "2026-05-31", thumbnail: "", url: "", progress: 0, error: "Upload interrupted — network drop" },
]

const statusBadge: Record<VStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-slate-500/10 text-slate-600" },
  uploading: { label: "Uploading", cls: "bg-blue-500/10 text-blue-600" },
  processing: { label: "Processing", cls: "bg-amber-500/10 text-amber-600" },
  published: { label: "Published", cls: "bg-emerald-500/10 text-emerald-600" },
  private: { label: "Private", cls: "bg-purple-500/10 text-purple-600" },
  failed: { label: "Failed", cls: "bg-red-500/10 text-red-600" },
}

const MAX_SIZE = 500 * 1024 * 1024
const ACCEPT = ["video/mp4", "video/quicktime", "video/webm"]

const emptyForm = {
  title: "", description: "", category: "Skill", relatedSkill: "", relatedCareer: "", relatedCourse: "", relatedStep: "",
  visibility: "draft" as Vis, tags: "",
  videoFile: null as File | null, thumbFile: null as File | null,
}

export function Videos() {
  const { has } = usePermissions()
  const c = useCrud<Video>(initial)
  const [q, setQ] = useState("")
  const [cat, setCat] = useState("all")
  const [status, setStatus] = useState("all")
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [drag, setDrag] = useState(false)
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "paused" | "processing" | "success" | "failed">("idle")
  const [progress, setProgress] = useState(0)
  const [slowNetwork, setSlowNetwork] = useState(false)
  const [storageWarning] = useState(false) // toggle for demo
  const [details, setDetails] = useState<Video | null>(null)
  const intervalRef = useRef<number | null>(null)

  const filtered = useMemo(() => c.items.filter(v => {
    if (q && !`${v.title} ${v.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false
    if (cat !== "all" && v.category !== cat) return false
    if (status !== "all" && v.status !== status) return false
    return true
  }), [c.items, q, cat, status])

  const stats = useMemo(() => {
    const total = c.items.length
    const published = c.items.filter(v => v.status === "published").length
    const drafts = c.items.filter(v => v.status === "draft").length
    const failed = c.items.filter(v => v.status === "failed").length
    const skillCount: Record<string, number> = {}
    const careerCount: Record<string, number> = {}
    c.items.forEach(v => {
      if (v.relatedSkill) skillCount[v.relatedSkill] = (skillCount[v.relatedSkill] || 0) + 1
      if (v.relatedCareer) careerCount[v.relatedCareer] = (careerCount[v.relatedCareer] || 0) + 1
    })
    const top = (m: Record<string, number>) => Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
    const storageMb = c.items.reduce((s, v) => s + parseInt(v.size) || 0, 0)
    return { total, published, drafts, failed, topSkill: top(skillCount), topCareer: top(careerCount), storageMb }
  }, [c.items])

  const startCreate = () => { setForm(emptyForm); setErrors({}); setProgress(0); setUploadState("idle"); c.open("create") }
  const startEdit = (v: Video) => {
    setForm({ ...emptyForm, title: v.title, description: v.description, category: v.category, relatedSkill: v.relatedSkill, relatedCareer: v.relatedCareer, relatedCourse: v.relatedCourse, relatedStep: v.relatedStep, visibility: v.visibility, tags: v.tags.join(", ") })
    setErrors({}); c.open("edit", v)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }
  const handleFile = (file: File) => {
    if (!ACCEPT.includes(file.type)) { setErrors(p => ({ ...p, videoFile: "Unsupported format. Use MP4, MOV, or WebM." })); return }
    if (file.size > MAX_SIZE) { setErrors(p => ({ ...p, videoFile: "File too large. Max 500MB." })); return }
    setErrors(p => ({ ...p, videoFile: "" }))
    setForm(f => ({ ...f, videoFile: file }))
  }

  const startUpload = (publish: boolean) => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Title is required"
    if (c.items.some(v => v.title.toLowerCase() === form.title.toLowerCase() && v.id !== c.selected?.id)) e.title = "A video with this title already exists"
    if (!form.category) e.category = "Category is required"
    if (!form.videoFile && c.mode === "create") e.videoFile = "Choose a video file"
    if (!form.relatedSkill && !form.relatedCareer && !form.relatedCourse) {
      // warning only
      toast.warning("No related content linked — viewers will see this in 'General'.")
    }
    setErrors(e); if (Object.keys(e).filter(k => e[k]).length) return

    setUploadState("uploading"); setProgress(0)
    intervalRef.current = window.setInterval(() => {
      setProgress(p => {
        const next = p + (slowNetwork ? 3 : 11)
        if (next >= 100) {
          window.clearInterval(intervalRef.current!)
          setUploadState("processing")
          setTimeout(() => {
            setUploadState("success")
            const newV: Video = {
              id: c.mode === "edit" ? c.selected!.id : String(Date.now()),
              title: form.title, description: form.description, category: form.category,
              relatedSkill: form.relatedSkill, relatedCareer: form.relatedCareer, relatedCourse: form.relatedCourse, relatedStep: form.relatedStep,
              duration: "—", size: form.videoFile ? `${(form.videoFile.size / 1024 / 1024).toFixed(0)} MB` : (c.selected?.size ?? "0 MB"),
              tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
              status: publish ? "published" : "draft",
              visibility: publish ? "public" : "draft",
              uploader: c.mode === "edit" ? c.selected!.uploader : "You",
              createdAt: c.selected?.createdAt ?? new Date().toISOString().slice(0, 10),
              updatedAt: new Date().toISOString().slice(0, 10),
              thumbnail: "", url: form.videoFile ? URL.createObjectURL(form.videoFile) : (c.selected?.url ?? ""), progress: 100,
            }
            if (c.mode === "edit") {
              c.setItems(p => p.map(x => x.id === newV.id ? newV : x))
              toast.success("Video updated")
            } else {
              c.setItems(p => [newV, ...p])
              toast.success(publish ? "Video published" : "Saved as draft")
            }
            c.close()
          }, 700)
          return 100
        }
        return next
      })
    }, 150)
  }

  const cancelUpload = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    setUploadState("idle"); setProgress(0); toast.info("Upload cancelled")
  }
  const pauseUpload = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    setUploadState("paused")
  }
  const retryUpload = () => { setUploadState("idle"); setProgress(0); startUpload(false) }

  const togglePublish = (v: Video) => {
    if (v.status === "published") {
      if (!has("videos.unpublish")) return toast.error("No permission to unpublish")
      c.setItems(p => p.map(x => x.id === v.id ? { ...x, status: "draft", visibility: "draft" } : x))
      toast.success("Video unpublished")
    } else {
      if (!has("videos.publish")) return toast.error("No permission to publish")
      c.setItems(p => p.map(x => x.id === v.id ? { ...x, status: "published", visibility: "public" } : x))
      toast.success("Video published")
    }
  }

  const copyUrl = (v: Video) => {
    if (!v.url) return toast.error("Video URL not available yet")
    navigator.clipboard.writeText(v.url).then(() => toast.success("URL copied"))
  }

  const del = () => {
    if (!c.selected) return
    if (c.selected.relatedCourse) {
      // require explicit confirm dialog already shown — proceed
    }
    c.setItems(p => p.filter(x => x.id !== c.selected!.id))
    c.close(); toast.success("Video deleted")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Learning Videos</h1>
          <p className="text-[var(--muted-foreground)]">Upload and manage educational videos linked to careers, skills, and courses.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSlowNetwork(s => !s)}>
            {slowNetwork ? "Network: Slow" : "Network: Normal"}
          </Button>
          <PermissionButton permission="videos.upload" onClick={startCreate}>
            <Upload className="h-4 w-4 mr-2" />Upload Video
          </PermissionButton>
        </div>
      </div>

      {storageWarning && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-4 py-2 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />Storage limit nearly exceeded — free up space before uploading more videos.
        </div>
      )}

      {/* Analytics cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <StatCard icon={<Film className="h-4 w-4" />} label="Total videos" value={stats.total} />
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Published" value={stats.published} accent="text-emerald-600" />
        <StatCard icon={<VideoIcon className="h-4 w-4" />} label="Drafts" value={stats.drafts} />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Failed uploads" value={stats.failed} accent="text-red-600" />
        <StatCard icon={<Tag className="h-4 w-4" />} label="Top skill" value={stats.topSkill} />
        <StatCard icon={<Tag className="h-4 w-4" />} label="Top career" value={stats.topCareer} />
        <StatCard icon={<HardDrive className="h-4 w-4" />} label="Storage used" value={`${stats.storageMb} MB`} />
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search videos or tags..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {Object.keys(statusBadge).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={c.items.length === 0 ? "No videos uploaded" : "No videos match your search"}
            description={c.items.length === 0 ? "Upload your first educational video to get started." : "Try a different search or filter."}
            action={c.items.length === 0 && <PermissionButton permission="videos.upload" onClick={startCreate}><Upload className="h-4 w-4 mr-2" />Upload Video</PermissionButton>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)]/40">
                <tr className="text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                  <th className="px-4 py-3">Thumb</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Skill</th>
                  <th className="px-4 py-3">Career</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Visibility</th>
                  <th className="px-4 py-3">Uploader</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-[var(--muted)]/20">
                    <td className="px-4 py-3">
                      <div className="w-16 h-10 rounded-md bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex items-center justify-center">
                        <VideoIcon className="h-4 w-4 text-[var(--primary)]" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{v.title}</p>
                      {v.tags.length > 0 && <p className="text-xs text-[var(--muted-foreground)]">#{v.tags.join(" #")}</p>}
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary">{v.category}</Badge></td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{v.relatedSkill || "—"}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{v.relatedCareer || "—"}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{v.relatedCourse || "—"}</td>
                    <td className="px-4 py-3">{v.duration}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusBadge[v.status].cls}`}>{statusBadge[v.status].label}</span>
                      {v.status === "processing" && <Progress value={v.progress} className="h-1 mt-1.5 w-24" />}
                      {v.status === "failed" && v.error && <p className="text-xs text-red-600 mt-1">{v.error}</p>}
                    </td>
                    <td className="px-4 py-3 capitalize">{v.visibility}</td>
                    <td className="px-4 py-3">{v.uploader}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{v.createdAt}</td>
                    <td className="px-4 py-3">
                      <RowActions
                        onView={() => setDetails(v)}
                        onEdit={has("videos.update") ? () => startEdit(v) : undefined}
                        onDelete={has("videos.delete") ? () => c.open("delete", v) : undefined}
                        extra={[
                          { label: "Copy URL", onClick: () => copyUrl(v), icon: <Copy className="h-4 w-4" /> },
                          ...((has("videos.publish") || has("videos.unpublish")) ? [{ label: v.status === "published" ? "Unpublish" : "Publish", onClick: () => togglePublish(v), icon: <Eye className="h-4 w-4" /> }] : []),
                          ...(v.status === "failed" ? [{ label: "Retry upload", onClick: () => { c.setItems(p => p.map(x => x.id === v.id ? { ...x, status: "uploading", progress: 5, error: undefined } : x)); toast.info("Retrying upload…") }, icon: <RefreshCw className="h-4 w-4" /> }] : []),
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload / Edit modal */}
      <FormModal
        open={c.mode === "create" || c.mode === "edit"} onOpenChange={v => !v && c.close()}
        title={c.mode === "edit" ? "Edit video" : "Upload video"}
        submitLabel="Publish"
        onSubmit={() => startUpload(true)}
        loading={uploadState === "uploading" || uploadState === "processing"}
      >
        {c.mode === "create" && (
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition ${drag ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)]"}`}
          >
            <Upload className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
            <p className="text-sm font-medium">Drag and drop a video here</p>
            <p className="text-xs text-[var(--muted-foreground)] mb-3">MP4, MOV, or WebM — up to 500MB</p>
            <Input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {form.videoFile && <p className="text-xs mt-2">Selected: {form.videoFile.name}</p>}
            {errors.videoFile && <p className="text-xs text-red-600 mt-1">{errors.videoFile}</p>}
          </div>
        )}

        {(uploadState !== "idle" && uploadState !== "success") && (
          <div className="rounded-md bg-[var(--muted)]/40 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium capitalize">{uploadState}{slowNetwork && uploadState === "uploading" ? " (slow network)" : ""}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
            <div className="flex gap-2">
              {uploadState === "uploading" && <Button type="button" size="sm" variant="outline" onClick={pauseUpload}><Pause className="h-3 w-3 mr-1" />Pause</Button>}
              {uploadState === "paused" && <Button type="button" size="sm" variant="outline" onClick={() => setUploadState("uploading")}>Resume</Button>}
              {(uploadState === "uploading" || uploadState === "paused") && <Button type="button" size="sm" variant="ghost" onClick={cancelUpload}><X className="h-3 w-3 mr-1" />Cancel</Button>}
              {uploadState === "failed" && <Button type="button" size="sm" variant="outline" onClick={retryUpload}><RefreshCw className="h-3 w-3 mr-1" />Retry</Button>}
            </div>
          </div>
        )}

        <Field label="Title" error={errors.title}><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Description"><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" error={errors.category}>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Visibility">
            <Select value={form.visibility} onValueChange={(v: Vis) => setForm({ ...form, visibility: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Related skill">
            <Select value={form.relatedSkill || "_none"} onValueChange={v => setForm({ ...form, relatedSkill: v === "_none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {SKILLS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Related career path">
            <Select value={form.relatedCareer || "_none"} onValueChange={v => setForm({ ...form, relatedCareer: v === "_none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {CAREERS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Related course">
            <Select value={form.relatedCourse || "_none"} onValueChange={v => setForm({ ...form, relatedCourse: v === "_none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {COURSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Roadmap step">
            <Select value={form.relatedStep || "_none"} onValueChange={v => setForm({ ...form, relatedStep: v === "_none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {STEPS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Thumbnail" hint="JPG/PNG; auto-generated if omitted">
          <Input type="file" accept="image/png,image/jpeg" onChange={e => setForm({ ...form, thumbFile: e.target.files?.[0] ?? null })} />
        </Field>

        <Field label="Tags" hint="Comma-separated">
          <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="react, hooks, intermediate" />
        </Field>

        <div className="flex justify-between pt-1">
          <Button type="button" variant="outline" onClick={() => startUpload(false)}>Save as draft</Button>
        </div>
      </FormModal>

      {/* Details drawer */}
      <Sheet open={!!details} onOpenChange={v => !v && setDetails(null)}>
        <SheetContent className="w-[520px] sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{details?.title}</SheetTitle>
          </SheetHeader>
          {details && (
            <div className="px-4 mt-4 space-y-4">
              <div className="aspect-video rounded-lg bg-black flex items-center justify-center">
                {details.url
                  ? <video src={details.url} controls className="w-full h-full rounded-lg" />
                  : <p className="text-white/60 text-sm">Preview not available</p>}
              </div>
              <div>
                <p className="text-sm">{details.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Category" value={details.category} />
                <Detail label="Visibility" value={details.visibility} />
                <Detail label="Skill" value={details.relatedSkill || "—"} />
                <Detail label="Career" value={details.relatedCareer || "—"} />
                <Detail label="Course" value={details.relatedCourse || "—"} />
                <Detail label="Roadmap step" value={details.relatedStep || "—"} />
                <Detail label="Duration" value={details.duration} />
                <Detail label="File size" value={details.size} />
                <Detail label="Status" value={statusBadge[details.status].label} />
                <Detail label="Uploader" value={details.uploader} />
                <Detail label="Created" value={details.createdAt} />
                <Detail label="Updated" value={details.updatedAt} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {details.tags.map(t => <Badge key={t} variant="secondary">#{t}</Badge>)}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={c.mode === "delete"} onOpenChange={v => !v && c.close()}
        title={`Delete "${c.selected?.title}"?`}
        description={c.selected?.relatedCourse
          ? `This video is linked to course "${c.selected.relatedCourse}". Deleting it will remove it from that course.`
          : "This action cannot be undone."}
        onConfirm={del}
      />
    </div>
  )
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-[var(--muted-foreground)]">{label}</CardTitle>
        <span className="text-[var(--muted-foreground)]">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className={`text-xl font-bold ${accent ?? ""}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="font-medium capitalize">{value}</p>
    </div>
  )
}
