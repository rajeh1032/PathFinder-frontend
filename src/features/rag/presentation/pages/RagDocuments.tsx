import React, { useMemo, useState } from "react"
import { Upload, RefreshCw, Trash2, FileText, AlertTriangle, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { ConfirmDeleteDialog, EmptyState, Field, FormModal, RowActions, useCrud } from "@/shared/components/crud"
import { PermissionButton, usePermissions } from "@/shared/lib/permissions"

type Status = "indexed" | "indexing" | "failed" | "queued"
type Doc = {
  id: string; title: string; type: "Career" | "Skill" | "Course" | "Interview" | "General"
  size: string; chunks: number; vectorId: string; uploader: string; status: Status; progress: number; error?: string; createdAt: string
}

const initial: Doc[] = [
  { id: "d1", title: "Frontend Career Guide v3.pdf", type: "Career", size: "2.3 MB", chunks: 84, vectorId: "vec_1f8a", uploader: "Sarah Admin", status: "indexed", progress: 100, createdAt: "2026-05-22" },
  { id: "d2", title: "React Hooks Reference.md", type: "Skill", size: "412 KB", chunks: 42, vectorId: "vec_2c91", uploader: "Hala Said", status: "indexing", progress: 64, createdAt: "2026-05-29" },
  { id: "d3", title: "Behavioral Interview Pack.pdf", type: "Interview", size: "1.1 MB", chunks: 56, vectorId: "vec_4d22", uploader: "John Doe", status: "indexed", progress: 100, createdAt: "2026-05-12" },
  { id: "d4", title: "AWS Solutions Architect Notes.pdf", type: "Course", size: "5.6 MB", chunks: 0, vectorId: "—", uploader: "Sarah Admin", status: "failed", progress: 0, error: "Embedding service timeout (Gemini)", createdAt: "2026-05-30" },
  { id: "d5", title: "Resume Best Practices.docx", type: "General", size: "320 KB", chunks: 0, vectorId: "—", uploader: "Sarah Admin", status: "queued", progress: 0, createdAt: "2026-05-31" },
]

const statusBadge: Record<Status, { label: string; cls: string }> = {
  indexed: { label: "Indexed", cls: "bg-emerald-500/10 text-emerald-600" },
  indexing: { label: "Indexing", cls: "bg-blue-500/10 text-blue-600" },
  queued: { label: "Queued", cls: "bg-amber-500/10 text-amber-600" },
  failed: { label: "Failed", cls: "bg-red-500/10 text-red-600" },
}

export function RagDocuments() {
  const { has } = usePermissions()
  const c = useCrud<Doc>(initial)
  const [q, setQ] = useState("")
  const [type, setType] = useState<string>("all")
  const [skeleton, setSkeleton] = useState(false)
  const [form, setForm] = useState({ title: "", type: "General" as Doc["type"], file: null as File | null })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const filtered = useMemo(() => c.items.filter(d => {
    if (q && !d.title.toLowerCase().includes(q.toLowerCase())) return false
    if (type !== "all" && d.type !== type) return false
    return true
  }), [c.items, q, type])

  const startCreate = () => { setForm({ title: "", type: "General", file: null }); setErrors({}); setUploadProgress(0); c.open("create") }

  const submit = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Required"
    if (!form.file) e.file = "Choose a file"
    if (form.file && form.file.size > 20 * 1024 * 1024) e.file = "Max file size 20MB"
    setErrors(e); if (Object.keys(e).length) return
    setUploading(true); setUploadProgress(0)
    const tick = setInterval(() => setUploadProgress(p => Math.min(100, p + 12)), 120)
    setTimeout(() => {
      clearInterval(tick); setUploadProgress(100); setUploading(false)
      const newDoc: Doc = {
        id: String(Date.now()), title: form.title, type: form.type,
        size: `${(form.file!.size / 1024 / 1024).toFixed(1)} MB`, chunks: 0, vectorId: "—",
        uploader: "You", status: "indexing", progress: 5, createdAt: new Date().toISOString().slice(0, 10),
      }
      c.setItems(p => [newDoc, ...p])
      c.close(); toast.success("Document uploaded — indexing started")
    }, 1100)
  }

  const reindex = (d: Doc) => {
    if (!has("rag.reindex")) return toast.error("No permission to re-index")
    c.setItems(p => p.map(x => x.id === d.id ? { ...x, status: "indexing", progress: 10, error: undefined } : x))
    toast.info(`Re-indexing "${d.title}"…`)
    setTimeout(() => c.setItems(p => p.map(x => x.id === d.id ? { ...x, status: "indexed", progress: 100, chunks: 60, vectorId: `vec_${Math.random().toString(16).slice(2, 6)}` } : x)), 1500)
  }

  const del = () => {
    if (!c.selected) return
    if (c.selected.status === "indexing") { toast.error("Cannot delete a document while it is indexing."); c.close(); return }
    c.setItems(p => p.filter(x => x.id !== c.selected!.id))
    c.close(); toast.success("Document deleted")
  }

  const refreshSkeleton = () => { setSkeleton(true); setTimeout(() => setSkeleton(false), 800) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RAG Knowledge Base</h1>
          <p className="text-[var(--muted-foreground)]">Documents indexed for AI retrieval (Gemini Embeddings).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshSkeleton}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          <PermissionButton permission="rag.upload" onClick={startCreate}>
            <Upload className="h-4 w-4 mr-2" />Upload Document
          </PermissionButton>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search documents..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Career">Career</SelectItem>
              <SelectItem value="Skill">Skill</SelectItem>
              <SelectItem value="Course">Course</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {skeleton ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={c.items.length === 0 ? "No documents yet" : "No results"}
            description={c.items.length === 0 ? "Upload PDFs, Markdown, or DOCX files to power AI retrieval." : "Try a different search or filter."}
            action={c.items.length === 0 && <PermissionButton permission="rag.upload" onClick={startCreate}><Upload className="h-4 w-4 mr-2" />Upload Document</PermissionButton>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)]/40">
                <tr className="text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Vector ID</th>
                  <th className="px-4 py-3">Chunks</th>
                  <th className="px-4 py-3">Uploaded by</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-[var(--muted)]/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[var(--muted-foreground)]" />
                        <div>
                          <p className="font-medium">{d.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{d.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary">{d.type}</Badge></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusBadge[d.status].cls}`}>{statusBadge[d.status].label}</span>
                      {d.status === "indexing" && <Progress value={d.progress} className="h-1 mt-1.5 w-32" />}
                      {d.status === "failed" && d.error && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{d.error}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{d.vectorId}</td>
                    <td className="px-4 py-3">{d.chunks}</td>
                    <td className="px-4 py-3">{d.uploader}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{d.createdAt}</td>
                    <td className="px-4 py-3">
                      <RowActions
                        extra={[
                          ...(has("rag.reindex") ? [{ label: "Re-index", onClick: () => reindex(d), icon: <RefreshCw className="h-4 w-4" /> }] : []),
                        ]}
                        onDelete={has("rag.delete") ? () => c.open("delete", d) : undefined}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FormModal
        open={c.mode === "create"} onOpenChange={v => !v && c.close()}
        title="Upload Document" submitLabel={uploading ? "Uploading..." : "Upload"}
        onSubmit={submit} loading={uploading}
      >
        <Field label="Title" error={errors.title}>
          <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Frontend Career Guide" />
        </Field>
        <Field label="Type">
          <Select value={form.type} onValueChange={(v: Doc["type"]) => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Career">Career</SelectItem>
              <SelectItem value="Skill">Skill</SelectItem>
              <SelectItem value="Course">Course</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="File" error={errors.file} hint="PDF, DOCX, or MD up to 20MB">
          <Input type="file" accept=".pdf,.md,.docx,.txt" onChange={e => setForm({ ...form, file: e.target.files?.[0] ?? null })} />
        </Field>
        {uploading && (
          <div className="space-y-1.5">
            <p className="text-xs text-[var(--muted-foreground)]">Embedding progress</p>
            <Progress value={uploadProgress} />
          </div>
        )}
      </FormModal>

      <ConfirmDeleteDialog
        open={c.mode === "delete"} onOpenChange={v => !v && c.close()}
        title={`Delete "${c.selected?.title}"?`}
        description="The document and its vector embeddings will be removed from the knowledge base."
        onConfirm={del}
      />
    </div>
  )
}
