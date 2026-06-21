/**
 * Types for the skills feature.
 *
 * Backend contract source of truth: PathFinder-Backend `skills` module
 * (`src/modules/skills`), mounted at `/api/v1/skills`:
 *   - `GET /api/v1/skills`     -> paginated `{ skills }` with `meta.pagination`
 *                                 (`authenticate`, `validateQuery(skillsQuerySchema)`)
 *   - `GET /api/v1/skills/:id` -> `{ skill }` including usage counts
 *                                 (`authenticate`)
 *   - `POST /api/v1/skills`    -> `{ skill }` (`authenticate` + `authorize('admin')`)
 *   - `PATCH /api/v1/skills/:id`  -> `{ skill }` (admin)
 *   - `DELETE /api/v1/skills/:id` -> `{ id }` (admin)
 *
 * The backend maps the `skills` table row to snake_case JSON. `aliases` is a
 * `text[]` column; the data layer converts it to/from a comma-separated string
 * for the form UI.
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

/** A skill row as returned by `GET /skills` (list). */
export type Skill = {
  id: string
  name: string
  category: string | null
  level: string | null
  aliases: string[]
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

/** A skill detail (`GET /skills/:id`) extends the row with usage counts. */
export type SkillDetail = Skill & {
  users_count: number
  career_paths_count: number
  cv_skills_count: number
}

/** Backend `GET /skills` sort options. */
export type SkillsSort = "name" | "newest"

/** Query parameters accepted by `GET /api/v1/skills`. */
export type SkillsListParams = {
  page?: number
  limit?: number
  q?: string
  category?: string
  level?: string
  isActive?: boolean
  sort?: SkillsSort
}

export type SkillsListResult = {
  items: Skill[]
  pagination: Pagination
}

/** Payload for `POST /api/v1/skills` (admin create). */
export type SkillCreatePayload = {
  name: string
  category: string
  level?: string | null
  aliases?: string[]
  is_active?: boolean
}

/** Payload for `PATCH /api/v1/skills/:id` (admin update). At least one field. */
export type SkillUpdatePayload = {
  name?: string
  category?: string
  level?: string | null
  aliases?: string[]
  is_active?: boolean
}
