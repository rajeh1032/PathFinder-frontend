import React, { useMemo, useState } from "react"
import { Upload, RefreshCw, FileText, AlertTriangle, Search, Power } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { ConfirmDeleteDialog, EmptyState, Field, FormModal, RowActions } from "@/shared/components/crud"
import { PermissionButton } from "@/shared/lib/permissions"
import { useRagDocuments } from "@/features/rag/application/useRagDocuments"
import {
  RAG_DOCUMENT_TYPE_LABELS,
  RAG_DOCUMENT_TYPES,
  type RagDocumentListItem,
  type RagDocumentType,
  type RagIndexStatus,
} from "@/features/rag/domain/rag.types"

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

const statusBadge: Record<RagIndexStatus, { label: string; cls: string }> = {
  indexed: { label: "Indexed", cls: "bg-emerald-500/10 text-emerald-600" },
  pending: { label: "Pending", cls: "bg-amber-500/10 text-amber-600" },
  failed: { label: "Failed", cls: "bg-red-500/10 text-red-600" },
}

export function RagDocuments() {
  const { items, isLoading, error, refetch, upload, remove, setActive } = useRagDocuments()
  const [q, setQ] = useState("")
  const [type, setType] = useState<string>("all")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ title: "", type: "cv_analysis" as RagDocumentType, file: null as File | null })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)

  const [toDelete, setToDelete] = useState<RagDocumentListItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [activatingId, setActivatingId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      items.filter((d) => {
        if (q && !d.title.toLowerCase().includes(q.toLowerCase())) return false
        if (type !== "all" && d.type !== type) return false
        return true
      }),
    [items, q, type],
  )

  const startCreate = () => {
    setForm({ title: "", type: "cv_analysis", file: null })
    setErrors({})
    setCreateOpen(true)
  }

  const submit = async () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Required"
    if (!form.file) e.file = "Choose a PDF file"
    if (form.file && form.file.size > MAX_UPLOAD_BYTES) e.file = "Max file size 20MB"
    setErrors(e)
    if (Object.keys(e).length) return

    setUploading(true)
    try {
      await upload({ file: form.file!, title: form.title.trim(), type: form.type })
      setCreateOpen(false)
      toast.success("Document uploaded and indexed")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await remove(toDelete.id)
      toast.success("Document deactivated")
      setToDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed")
    } finally {
      setDeleting(false)
    }
  }

  const activate = async (d: RagDocumentListItem) => {
    setActivatingId(d.id)
    try {
      await setActive(d.id, true)
      toast.success("Document activated")
    } catch (err) {
      // Backend returns 409 if another active document of this type exists.
      toast.error(err instanceof Error ? err.message : "Activation failed")
    } finally {
      setActivatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RAG Knowledge Base</h1>
          <p className="text-[var(--muted-foreground)]">Documents indexed for AI retrieval (Gemini embeddings).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />Refresh
          </Button>
          <PermissionButton permission="rag.upload" onClick={startCreate}>
            <Upload className="h-4 w-4 mr-2" />Upload Document
          </PermissionButton>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input placeholder="Search documents..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {RAG_DOCUMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{RAG_DOCUMENT_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <p className="font-semibold">Could not load documents</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-sm">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={items.length === 0 ? "No documents yet" : "No results"}
            description={items.length === 0 ? "Upload a PDF to power AI retrieval." : "Try a different search or filter."}
            action={items.length === 0 && (
              <PermissionButton permission="rag.upload" onClick={startCreate}><Upload className="h-4 w-4 mr-2" />Upload Document</PermissionButton>
            )}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)]/40">
                <tr className="text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Chunks</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((d) => (
                  <tr key={d.id} className={`hover:bg-[var(--muted)]/20 ${d.isActive ? "" : "opacity-60"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[var(--muted-foreground)]" />
                        <p className="font-medium">{d.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary">{RAG_DOCUMENT_TYPE_LABELS[d.type]}</Badge></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusBadge[d.indexStatus].cls}`}>
                        {statusBadge[d.indexStatus].label}
                      </span>
                      {d.indexStatus === "failed" && d.indexError && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />{d.indexError}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize text-[var(--muted-foreground)]">{d.source}</td>
                    <td className="px-4 py-3">{d.chunksCount}</td>
                    <td className="px-4 py-3">
                      {d.isActive
                        ? <span className="text-emerald-600 text-xs font-medium">Active</span>
                        : <span className="text-[var(--muted-foreground)] text-xs">Inactive</span>}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{d.createdAt.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <RowActions
                        extra={
                          d.isActive
                            ? undefined
                            : [{
                                label: activatingId === d.id ? "Activating..." : "Activate",
                                onClick: () => activate(d),
                                icon: <Power className="h-4 w-4" />,
                              }]
                        }
                        onDelete={d.isActive ? () => setToDelete(d) : undefined}
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
        open={createOpen}
        onOpenChange={(v) => !v && !uploading && setCreateOpen(false)}
        title="Upload Document"
        description="Only one active document is allowed per type. PDF only, up to 20MB."
        submitLabel={uploading ? "Uploading..." : "Upload"}
        onSubmit={submit}
        loading={uploading}
      >
        <Field label="Title" error={errors.title}>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. CV Analysis Rubric" />
        </Field>
        <Field label="Type">
          <Select value={form.type} onValueChange={(v: RagDocumentType) => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RAG_DOCUMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{RAG_DOCUMENT_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="File" error={errors.file} hint="PDF up to 20MB">
          <Input type="file" accept="application/pdf,.pdf" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })} />
        </Field>
      </FormModal>

      <ConfirmDeleteDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && !deleting && setToDelete(null)}
        title={`Deactivate "${toDelete?.title}"?`}
        description="The document will be marked inactive and removed from AI retrieval. You can upload a replacement for this type afterwards."
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  )
}
