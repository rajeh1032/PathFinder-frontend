/**
 * Types for the jobs feature.
 *
 * Backend contract source of truth: PathFinder-Backend `jobs` module
 * (`src/modules/jobs`), mounted at `/api/v1/jobs`:
 *   - `GET /api/v1/jobs`     -> `data` is the jobs array, `meta.pagination`
 *                               (public read, `validateQuery(listJobsQuerySchema)`)
 *   - `GET /api/v1/jobs/:id` -> `data` is a single job object (public read)
 *
 * The backend exposes NO admin create/update/delete route for jobs. The
 * repository `createJob`/`updateJob` helpers are only used internally by the
 * Apify sync, so the page's create/edit/delete/toggle actions remain local
 * (in-session) until a real admin endpoint exists.
 *
 * The `jobs` table is returned in snake_case. `required_skills` is a `text[]`
 * column; `status` is `'draft' | 'published' | 'archived'` (NOT the legacy mock
 * `active | closed | expired`).
 */

/** Pagination envelope returned in `meta.pagination`. */
export type Pagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/** Backend `jobs.status` enum. */
export type JobStatus = "draft" | "published" | "archived"

/** A job row as returned by `GET /jobs` and `GET /jobs/:id`. */
export type Job = {
  id: string
  title: string
  company: string
  location: string | null
  description: string | null
  source: string | null
  source_type: string | null
  external_id: string | null
  apply_url: string | null
  required_skills: string[]
  employment_type: string | null
  salary_range: string | null
  level: string | null
  category: string | null
  thumbnail_url: string | null
  company_logo_url: string | null
  certificate_provider: string | null
  duration: string | null
  is_active: boolean
  status: JobStatus | string
  posted_at: string | null
  created_at: string | null
  updated_at: string | null
}

/** Query parameters accepted by `GET /api/v1/jobs`. */
export type JobsListParams = {
  page?: number
  limit?: number
  keyword?: string
  location?: string
  category?: string
  level?: string
  source?: string
  sourceType?: string
  status?: JobStatus
  remote?: boolean
}

export type JobsListResult = {
  items: Job[]
  pagination: Pagination
}
