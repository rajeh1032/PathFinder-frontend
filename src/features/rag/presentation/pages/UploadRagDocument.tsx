import React from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { ArrowLeft, Upload, FileText, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Card } from "@/shared/components/ui/card"
import { useRagDocuments } from "@/features/rag/application/useRagDocuments"
import {
  RAG_DOCUMENT_TYPE_LABELS,
  RAG_DOCUMENT_TYPES,
  type RagDocumentType,
} from "@/features/rag/domain/rag.types"

// Backend accepts a single PDF named `file`, max 20MB (rag.routes.js).
const ALLOWED = [".pdf"]
const MAX_MB = 20

export function UploadRagDocument() {
  const navigate = useNavigate()
  const { upload } = useRagDocuments()
  const [file, setFile] = React.useState<File | null>(null)
  const [title, setTitle] = React.useState("")
  const [type, setType] = React.useState<RagDocumentType>("cv_analysis")
  const [uploading, setUploading] = React.useState(false)
  const [drag, setDrag] = React.useState(false)
  const [error, setError] = React.useState("")

  const validateFile = (f: File): string => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase()
    if (!ALLOWED.includes(ext)) return `File type ${ext} not allowed. Use ${ALLOWED.join(", ")}.`
    if (f.size > MAX_MB * 1024 * 1024) return `File exceeds ${MAX_MB}MB limit.`
    return ""
  }

  const onPick = (f: File | null | undefined) => {
    if (!f) return
    const err = validateFile(f)
    if (err) { setError(err); toast.error(err); return }
    setError("")
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""))
  }

  const submit = async () => {
    if (!file) { toast.error("Select a PDF file first"); return }
    if (!title.trim()) { toast.error("Title is required"); return }
    setUploading(true)
    try {
      await upload({ file, title: title.trim(), type })
      toast.success("Document uploaded and indexed")
      navigate("/rag-documents")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/rag-documents")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Upload RAG Document</h1>
          <p className="text-[var(--muted-foreground)]">Add a PDF to the AI knowledge base. One active document per type.</p>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            onPick(e.dataTransfer.files?.[0])
          }}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
            drag ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)]"
          }`}
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-[var(--primary)]" />
              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-10 h-10 mx-auto text-[var(--muted-foreground)]" />
              <p>Drag and drop a PDF here, or</p>
              <label>
                <input
                  type="file"
                  className="hidden"
                  accept="application/pdf,.pdf"
                  onChange={(e) => onPick(e.target.files?.[0])}
                />
                <span className="inline-block px-4 py-2 rounded-lg bg-[var(--primary)] text-white cursor-pointer text-sm font-medium">
                  Browse files
                </span>
              </label>
              <p className="text-xs text-[var(--muted-foreground)]">PDF • max {MAX_MB}MB</p>
            </div>
          )}
        </div>
        {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}

        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" />
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v: RagDocumentType) => setType(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RAG_DOCUMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{RAG_DOCUMENT_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => navigate("/rag-documents")} disabled={uploading}>Cancel</Button>
          <Button onClick={submit} disabled={uploading || !file}>
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
