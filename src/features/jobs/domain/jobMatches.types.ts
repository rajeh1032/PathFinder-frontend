/**
 * Types for the job-matches feature.
 *
 * Backend contract source of truth: PathFinder-Backend `jobMatches` module
 * (`src/modules/jobMatches`), mounted at `/api/v1/job-matches`.
 *
 * Admin (cross-user) read routes used by this console
 * (`authenticate` + `authorize('admin')`):
 *   - `GET /api/v1/job-matches/admin`     -> matches array (every user's
 *      matches, joined with `users!inner(id,name,email)` and `jobs(...)`),
 *      `meta.pagination`.
 *   - `GET /api/v1/job-matches/admin/:id` -> a single match.
 *
 * The user-scoped routes (`GET /job-matches`, `POST /generate`,
 * `GET /:id`) still exist but only return the caller's own matches, so the
 * admin screen uses the `/admin` routes above. Notify/remove have no backend
 * route and stay in-session local.
 */

/** Pagination as returned by the admin list `meta.pagination`. */
export type Pagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

/** The owning user joined with each match (`users!inner(...)`). */
export type MatchUser = {
  id: string
  name: string | null
  email: string | null
}

/** The embedded job summary returned with each match (`jobs(...)`). */
export type MatchJob = {
  id: string
  title: string
  company: string
  location: string | null
  source: string | null
  source_type: string | null
  required_skills: string[]
  employment_type: string | null
  salary_range: string | null
  level: string | null
  category: string | null
  company_logo_url: string | null
  apply_url: string | null
}

/** A row from the `job_matches` table joined with its job (and owning user). */
export type JobMatch = {
  id: string
  user_id: string
  job_id: string
  cv_id: string | null
  match_percentage: number
  matched_skills: string[]
  missing_skills: string[]
  ai_reason: string | null
  generated_by_type: "ai" | "system" | string
  status: string
  created_at: string | null
  jobs: MatchJob | null
  users: MatchUser | null
}

/** Query parameters accepted by `GET /api/v1/job-matches/admin`. */
export type JobMatchesListParams = {
  page?: number
  limit?: number
  minScore?: number
  status?: string
  generatedByType?: "ai" | "system"
  userId?: string
}

export type JobMatchesListResult = {
  items: JobMatch[]
  pagination: Pagination
}
