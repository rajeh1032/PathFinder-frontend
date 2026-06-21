/**
 * Types for the cv-analyses feature.
 *
 * Backend contract source of truth: PathFinder-Backend `cvs` module.
 * Admin read endpoints (require `authorize('admin')`):
 *   - `GET /api/v1/cvs`        -> paginated list of CV analyses
 *   - `GET /api/v1/cvs/:id`    -> a single CV analysis
 *
 * The backend joins `cv_analyses -> cvs -> users`. There is no admin
 * create/update/delete or reprocess endpoint, so this feature is read-only.
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

/** `cv_analyses.status` enum (`analysis_status`). */
export type CvAnalysisStatus = "completed" | "failed" | "reviewed"

/** A detected skill object inside `cv_analyses.detected_skills`. */
export type DetectedSkill = {
  name: string
  category?: string | null
  level?: string | null
  confidence?: number | null
  evidence?: string | null
  skill_id?: string | null
}

/** Embedded CV metadata. */
export type CvMetaDto = {
  id: string | null
  original_name: string | null
  mime_type: string | null
  size_bytes: number | null
  status: string | null
  created_at: string | null
}

/** Embedded user (CV owner). */
export type CvUserDto = {
  id: string | null
  name: string | null
  email: string | null
}

/** Raw CV analysis object returned by the backend admin endpoints. */
export type CvAnalysisDto = {
  id: string
  cv_id: string
  score: number
  model: string | null
  summary: string | null
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  detected_skills: DetectedSkill[]
  extracted: Record<string, unknown>
  generated_by_type: string | null
  status: CvAnalysisStatus
  reviewed_by_admin_id: string | null
  reviewed_at: string | null
  created_at: string
  cv: CvMetaDto
  user: CvUserDto
}

/** Flattened row used by the admin list table. */
export type CvAnalysisListItem = {
  id: string
  userName: string
  userEmail: string
  fileName: string
  score: number
  status: CvAnalysisStatus
  createdAt: string
}

/** Detail view model used by the analysis details page. */
export type CvAnalysisDetail = {
  id: string
  cvId: string
  userName: string
  userEmail: string
  fileName: string
  model: string
  status: CvAnalysisStatus
  score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  detectedSkills: DetectedSkill[]
  missingSkills: string[]
  recommendedRoles: string[]
  createdAt: string
  reviewedAt: string | null
}

export type CvAnalysesListParams = {
  page?: number
  limit?: number
  status?: CvAnalysisStatus | ""
}

export type CvAnalysesListResult = {
  items: CvAnalysisListItem[]
  pagination: Pagination
}
