/**
 * Types for the RAG knowledge-base feature.
 *
 * Backend contract source of truth: PathFinder-Backend `rag` module
 * (`/api/v1/rag`). Verified against `rag.routes.js`, `rag.schema.js`,
 * `rag.service.js`, and `docs/DATABASE_SCHEMA.md` (`rag_documents`).
 *
 * Constraints enforced by the backend:
 * - Uploads accept a single PDF named `file`, up to 20MB.
 * - Only one ACTIVE document is allowed per `type`; a conflicting create or
 *   upload returns HTTP 409.
 * - `DELETE /rag/documents/:id` is a soft delete (sets `is_active = false`);
 *   the list endpoint still returns inactive rows.
 */

/** Document categories accepted by the backend `type` field. */
export type RagDocumentType =
  | "cv_analysis"
  | "course_analysis"
  | "interview"
  | "job_matching"
  | "cover_letter"
  | "chat"
  | "roadmap"
  | "general"

/** Origin of a document's content. */
export type RagDocumentSource = "manual" | "upload" | "api"

/** Indexing lifecycle state from the `rag_index_status` enum. */
export type RagIndexStatus = "pending" | "indexed" | "failed"

/** Raw document object returned by the backend RAG endpoints. */
export type RagDocumentDto = {
  id: string
  title: string
  type: RagDocumentType
  source: RagDocumentSource
  content?: string
  storage_path: string | null
  vector_id: string | null
  index_status: RagIndexStatus
  index_error: string | null
  is_active: boolean
  uploaded_by: string | null
  created_at: string
  updated_at: string
  /** Present on create/upload/get responses. */
  chunksCount?: number
}

/** Flattened view model used by the admin table. */
export type RagDocumentListItem = {
  id: string
  title: string
  type: RagDocumentType
  source: RagDocumentSource
  indexStatus: RagIndexStatus
  indexError: string | null
  isActive: boolean
  vectorId: string
  chunksCount: number
  uploadedBy: string | null
  createdAt: string
}

/** Payload for uploading a PDF document. */
export type UploadRagDocumentInput = {
  file: File
  title: string
  type: RagDocumentType
}

/** Human-readable labels for each document type. */
export const RAG_DOCUMENT_TYPE_LABELS: Record<RagDocumentType, string> = {
  cv_analysis: "CV Analysis",
  course_analysis: "Course Analysis",
  interview: "Interview",
  job_matching: "Job Matching",
  cover_letter: "Cover Letter",
  chat: "Chat",
  roadmap: "Roadmap",
  general: "General",
}

/** Ordered list of selectable document types. */
export const RAG_DOCUMENT_TYPES: RagDocumentType[] = [
  "cv_analysis",
  "course_analysis",
  "interview",
  "job_matching",
  "cover_letter",
  "chat",
  "roadmap",
  "general",
]
