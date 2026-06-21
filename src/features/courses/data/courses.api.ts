import { apiRequestWithMeta, http } from "@/core/api/api-client"
import { apiEndpoints } from "@/core/api/api-endpoints"
import type { QueryParams } from "@/core/api/api-client"
import type {
  CourseAnalysis,
  CourseDto,
  CourseImportConfirmPayload,
  CourseImportConfirmResult,
  CourseImportMetadata,
  CourseImportPreview,
  CourseManualMetadata,
  CoursesListParams,
  CoursesListResult,
  CourseUpdatePayload,
  MatchedSkillPreview,
  Pagination,
  UnmatchedSkillPreview,
} from "../domain/courses.types"

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
  nextPage: null,
  previousPage: null,
}

/** Build the backend query object, omitting empty/undefined filters. */
function toQuery(params: CoursesListParams): QueryParams {
  const query: QueryParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    sort: params.sort ?? "newest",
  }
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.category?.trim()) query.category = params.category.trim()
  if (params.level?.trim()) query.level = params.level.trim()
  if (params.provider?.trim()) query.provider = params.provider.trim()
  if (params.language?.trim()) query.language = params.language.trim()
  if (typeof params.isFree === "boolean") query.isFree = params.isFree
  return query
}

export const coursesApi = {
  /**
   * Fetch the paginated catalog of available courses.
   *
   * Verified backend route: `GET /api/v1/courses` (`authenticate`,
   * `validateQuery(coursesQuerySchema)`). Returns only `is_active = true` AND
   * `analysis_status = 'approved'` rows as `{ courses }` with
   * `meta.pagination`. The backend mapper already returns camelCase courses.
   */
  async list(params: CoursesListParams = {}): Promise<CoursesListResult> {
    const { data, meta } = await apiRequestWithMeta<
      { courses: CourseDto[] },
      { pagination?: Pagination }
    >(apiEndpoints.courses.root, { query: toQuery(params) })

    return {
      items: data?.courses ?? [],
      pagination: meta?.pagination ?? DEFAULT_PAGINATION,
    }
  },

  /**
   * Fetch a single available course by id.
   *
   * Verified backend route: `GET /api/v1/courses/:id` (`authenticate`,
   * `validateParams(uuidParamSchema)`). Returns `{ course }`.
   */
  async getById(id: string): Promise<CourseDto> {
    const data = await http.get<{ course: CourseDto }>(apiEndpoints.courses.byId(id))
    return data.course
  },

  /**
   * Update a course (admin only).
   *
   * Verified backend route: `PATCH /api/v1/courses/:id`
   * (`authenticate` + `authorize('admin')`, `validateBody(updateCourseSchema)`).
   * Returns `{ course }`.
   */
  async update(id: string, payload: CourseUpdatePayload): Promise<CourseDto> {
    const data = await http.patch<{ course: CourseDto }>(apiEndpoints.courses.byId(id), payload)
    return data.course
  },

  /**
   * Delete a course (admin only).
   *
   * Verified backend route: `DELETE /api/v1/courses/:id`
   * (`authenticate` + `authorize('admin')`). Dependent rows cascade in the DB.
   */
  async remove(id: string): Promise<void> {
    await http.delete<{ courseId: string }>(apiEndpoints.courses.byId(id))
  },

  /**
   * Preview a MaharaTech course import (admin only). The backend fetches public
   * metadata, runs AI analysis, and matches skills.
   *
   * Verified backend route: `POST /api/v1/courses/import/preview`
   * (`authenticate` + `authorize('admin')`, `validateBody(previewCourseImportSchema)`).
   * Normalizes the `{ alreadyImported }` / `{ status }` responses into a
   * discriminated `CourseImportPreview`.
   */
  async previewImport(
    url: string,
    metadata?: CourseManualMetadata,
  ): Promise<CourseImportPreview> {
    const body: { url: string; metadata?: CourseManualMetadata } = { url }
    if (metadata && Object.keys(metadata).length > 0) body.metadata = metadata

    const raw = await http.post<RawPreviewResponse>(apiEndpoints.courses.importPreview, body)

    if (!("status" in raw)) {
      return { kind: "already_imported", courseId: raw.courseId, message: raw.message }
    }
    if (raw.status === "needs_manual_metadata") {
      return {
        kind: "needs_manual_metadata",
        provider: raw.provider,
        external_id: raw.external_id,
        url: raw.url,
        message: raw.message,
        metadata: raw.metadata,
        metadataFetch: raw.metadataFetch ?? { blocked: true, reason: null },
      }
    }
    return {
      kind: "pending_review",
      provider: raw.provider,
      external_id: raw.external_id,
      metadata: raw.metadata,
      analysis: raw.analysis,
      matched_skills: raw.matched_skills ?? [],
      unmatched_skills: raw.unmatched_skills ?? [],
    }
  },

  /**
   * Confirm a previewed import, creating the course (admin only).
   *
   * Verified backend route: `POST /api/v1/courses/import/confirm`
   * (`authenticate` + `authorize('admin')`, `validateBody(confirmCourseImportSchema)`).
   * `provider`/`external_id`/`url` must match the previewed values.
   */
  async confirmImport(payload: CourseImportConfirmPayload): Promise<CourseImportConfirmResult> {
    const raw = await http.post<RawConfirmResponse>(apiEndpoints.courses.importConfirm, payload)

    if (!("course" in raw)) {
      return { kind: "already_imported", courseId: raw.courseId, message: raw.message }
    }
    return { kind: "created", courseId: raw.course.id }
  },
}

/**
 * Build the manual-metadata block accepted by the confirm endpoint, dropping
 * empty values so they pass `manualMetadataSchema` (for example `description`
 * requires >= 10 chars and would reject an empty string).
 */
export function buildConfirmMetadata(metadata: CourseImportMetadata): CourseManualMetadata {
  const result: CourseManualMetadata = {}
  if (metadata.title?.trim()) result.title = metadata.title.trim()
  if (metadata.description && metadata.description.trim().length >= 10) {
    result.description = metadata.description.trim()
  }
  result.category = metadata.category?.trim() ? metadata.category.trim() : null
  result.thumbnail_url = metadata.thumbnail_url?.trim() ? metadata.thumbnail_url.trim() : null
  result.duration = metadata.duration?.trim() ? metadata.duration.trim() : null
  result.level = metadata.level?.trim() ? metadata.level.trim() : null
  if (metadata.language?.trim()) result.language = metadata.language.trim()
  const outcomes = (metadata.learning_outcomes ?? [])
    .map((entry) => entry.trim())
    .filter((entry) => entry.length >= 2)
  if (outcomes.length > 0) result.learning_outcomes = outcomes.slice(0, 20)
  if (typeof metadata.is_free === "boolean") result.is_free = metadata.is_free
  return result
}

/* Raw backend response shapes (before normalization). */
type RawPreviewResponse =
  | { alreadyImported: true; courseId: string; message: string }
  | {
      status: "needs_manual_metadata"
      provider: string
      external_id: string
      url: string
      message: string
      metadata: CourseImportMetadata
      metadataFetch?: { blocked: boolean; reason: string | null }
    }
  | {
      status: "pending_review"
      provider: string
      external_id: string
      metadata: CourseImportMetadata
      analysis: CourseAnalysis
      matched_skills?: MatchedSkillPreview[]
      unmatched_skills?: UnmatchedSkillPreview[]
    }

type RawConfirmResponse =
  | { alreadyImported: true; courseId: string; message: string }
  | {
      course: CourseDto & { id: string }
      matched_skills: MatchedSkillPreview[]
      unmatched_skills: UnmatchedSkillPreview[]
    }
