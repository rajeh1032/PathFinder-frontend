/**
 * Types for the courses feature.
 *
 * Backend contract source of truth: PathFinder-Backend `courses` module
 * (`src/modules/courses`). The list/detail read endpoints require
 * authentication and return only AVAILABLE courses (`is_active = true` AND
 * `analysis_status = 'approved'`):
 *   - `GET /api/v1/courses`     -> paginated `{ courses }` with `meta.pagination`
 *   - `GET /api/v1/courses/:id` -> `{ course }`
 *
 * The backend `course.mapper.js` already normalizes rows to the camelCase
 * shape mirrored below, so these types follow the mapper output, not the raw
 * database columns.
 *
 * There is NO admin generic create/update/delete/toggle endpoint. The only
 * create path is the admin MaharaTech import flow
 * (`POST /courses/import/preview` + `POST /courses/import/confirm`), which is
 * not consumed here yet. This feature is therefore read-only.
 */

/** Pagination envelope returned in `meta.pagination`. */
export type Pagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: number | null
  previousPage: number | null
}

/** A skill taught by a course (from `course_skills -> skills`). */
export type CourseSkill = {
  id: string | null
  name: string
  category: string | null
  level: string | null
  confidence: number | null
  source: string | null
}

/** Per-user enrollment state. Null in the admin (non-enrolled) context. */
export type CourseEnrollment = {
  id: string
  status: string
  progress: number
  enrolledAt: string | null
  completedAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

/**
 * Course object as returned by the backend mapper (`mapCourse`). Used directly
 * as both the list row and the detail view model.
 */
export type CourseDto = {
  id: string
  title: string
  description: string | null
  provider: string
  url: string | null
  thumbnailUrl: string | null
  videoUrl: string | null
  level: string | null
  duration: string | null
  category: string | null
  learningOutcomes: string[]
  language: string | null
  price: number | null
  currency: string | null
  isFree: boolean
  rating: number | null
  reviewsCount: number
  enrollmentCount: number
  popularityScore: number
  skills: CourseSkill[]
  isSaved: boolean
  enrollment: CourseEnrollment | null
  createdAt: string | null
  updatedAt: string | null
}

/** Backend `GET /courses` sort options. */
export type CoursesSort = "newest" | "rating" | "popular"

/** Query parameters accepted by `GET /api/v1/courses`. */
export type CoursesListParams = {
  page?: number
  limit?: number
  /** Free-text search; backend rejects commas and parentheses. */
  q?: string
  category?: string
  level?: string
  provider?: string
  language?: string
  isFree?: boolean
  sort?: CoursesSort
}

export type CoursesListResult = {
  items: CourseDto[]
  pagination: Pagination
}

/* ------------------------------------------------------------------ *
 * Admin MaharaTech import flow (preview -> AI analysis -> confirm).
 *
 * Verified backend routes (both `authenticate` + `authorize('admin')`):
 *   - `POST /api/v1/courses/import/preview`
 *   - `POST /api/v1/courses/import/confirm`
 *
 * Only MaharaTech course URLs are supported: the host must be
 * `maharatech.gov.eg` and the URL must carry an `id` query parameter, which
 * becomes the `external_id`. The backend strips unknown keys, so payloads only
 * carry the fields below.
 * ------------------------------------------------------------------ */

/** Manual metadata an admin can supply/override (matches `manualMetadataSchema`). */
export type CourseManualMetadata = {
  title?: string
  description?: string
  category?: string | null
  thumbnail_url?: string | null
  learning_outcomes?: string[]
  language?: string
  duration?: string | null
  level?: string | null
  is_free?: boolean
}

/** Metadata block returned inside a preview result. */
export type CourseImportMetadata = {
  provider: string
  external_id: string
  url: string
  title: string | null
  description: string | null
  category: string | null
  thumbnail_url: string | null
  learning_outcomes: string[]
  language: string | null
  duration: string | null
  level: string | null
  is_free?: boolean | null
}

/** A skill the AI says the course teaches. */
export type CourseAnalysisSkill = {
  name: string
  confidence: number
}

/** Normalized AI analysis returned by preview (matches `analysisSchema`). */
export type CourseAnalysis = {
  category: string | null
  level: string | null
  duration: string | null
  language: string | null
  skills_taught: CourseAnalysisSkill[]
  prerequisites: string[]
  learning_outcomes: string[]
  summary: string | null
  confidence: number | null
}

/** A skill matched to the catalog during preview. */
export type MatchedSkillPreview = {
  skill_id?: string
  id?: string
  name: string
  category?: string | null
  confidence?: number | null
  source?: string
}

/** A skill the AI named but that did not map to the catalog. */
export type UnmatchedSkillPreview = {
  name: string
  confidence?: number | null
  source?: string
}

/**
 * Discriminated union of the three preview outcomes, normalized in the data
 * layer from the backend's `{ alreadyImported }` / `{ status }` shapes.
 */
export type CourseImportPreview =
  | { kind: "already_imported"; courseId: string; message: string }
  | {
      kind: "needs_manual_metadata"
      provider: string
      external_id: string
      url: string
      message: string
      metadata: CourseImportMetadata
      metadataFetch: { blocked: boolean; reason: string | null }
    }
  | {
      kind: "pending_review"
      provider: string
      external_id: string
      metadata: CourseImportMetadata
      analysis: CourseAnalysis
      matched_skills: MatchedSkillPreview[]
      unmatched_skills: UnmatchedSkillPreview[]
    }

/** Payload for `POST /courses/import/confirm`. */
export type CourseImportConfirmPayload = {
  provider: string
  external_id: string
  url: string
  metadata: CourseManualMetadata
  analysis: CourseAnalysis
  matched_skills: MatchedSkillPreview[]
  unmatched_skills: UnmatchedSkillPreview[]
  is_free?: boolean
}

/** Result of a confirm call. */
export type CourseImportConfirmResult =
  | { kind: "already_imported"; courseId: string; message: string }
  | { kind: "created"; courseId: string }

/**
 * Payload for `PATCH /api/v1/courses/:id` (admin update). All fields optional;
 * the backend requires at least one and updates only provided keys.
 */
export type CourseUpdatePayload = {
  title?: string
  description?: string | null
  category?: string | null
  level?: string | null
  duration?: string | null
  language?: string | null
  video_url?: string | null
  thumbnail_url?: string | null
  learning_outcomes?: string[]
  is_active?: boolean
  is_free?: boolean
}
