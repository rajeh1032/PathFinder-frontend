import { http } from "@/core/api/api-client"
import { apiEndpoints } from "@/core/api/api-endpoints"
import type {
  RagDocumentDto,
  RagDocumentListItem,
  RagDocumentType,
  UploadRagDocumentInput,
} from "../domain/rag.types"

/** Map a backend RAG document DTO to the flattened list view model. */
export function toListItem(dto: RagDocumentDto): RagDocumentListItem {
  return {
    id: dto.id,
    title: dto.title,
    type: dto.type,
    source: dto.source,
    indexStatus: dto.index_status,
    indexError: dto.index_error ?? null,
    isActive: dto.is_active,
    vectorId: dto.vector_id ?? "—",
    chunksCount: dto.chunksCount ?? 0,
    uploadedBy: dto.uploaded_by ?? null,
    createdAt: dto.created_at,
  }
}

export const ragApi = {
  /**
   * List RAG documents, optionally filtered by `type`.
   *
   * Verified backend route: `GET /api/v1/rag/documents` (returns all rows,
   * including inactive ones, ordered by `created_at` descending).
   */
  async list(type?: RagDocumentType): Promise<RagDocumentListItem[]> {
    const data = await http.get<RagDocumentDto[]>(apiEndpoints.rag.documents, {
      query: type ? { type } : undefined,
    })
    return (data ?? []).map(toListItem)
  },

  /**
   * Upload a PDF document for indexing.
   *
   * Verified backend route: `POST /api/v1/rag/documents/upload` (multipart
   * field `file`, PDF only, max 20MB; body `title` and optional `type`).
   * The API client strips the JSON `Content-Type` for `FormData` bodies.
   */
  async upload(input: UploadRagDocumentInput): Promise<RagDocumentListItem> {
    const form = new FormData()
    form.append("file", input.file)
    form.append("title", input.title)
    form.append("type", input.type)
    const data = await http.post<RagDocumentDto>(apiEndpoints.rag.upload, form)
    return toListItem(data)
  },

  /**
   * Soft-delete a document (backend sets `is_active = false`).
   *
   * Verified backend route: `DELETE /api/v1/rag/documents/:id`.
   */
  async remove(id: string): Promise<void> {
    await http.delete<RagDocumentDto>(apiEndpoints.rag.byId(id))
  },

  /**
   * Toggle a document's active state.
   *
   * Verified backend route: `PATCH /api/v1/rag/documents/:id` (accepts
   * `is_active`). Reactivating enforces the "one active document per type"
   * rule on the backend and returns HTTP 409 if another active document of the
   * same type already exists.
   */
  async setActive(id: string, isActive: boolean): Promise<RagDocumentListItem> {
    const data = await http.patch<RagDocumentDto>(apiEndpoints.rag.byId(id), {
      is_active: isActive,
    })
    return toListItem(data)
  },
}
