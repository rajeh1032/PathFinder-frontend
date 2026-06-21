import { apiRequestWithMeta, http } from "@/core/api/api-client"
import { apiEndpoints } from "@/core/api/api-endpoints"
import type { QueryParams } from "@/core/api/api-client"
import type {
  Pagination,
  Skill,
  SkillCreatePayload,
  SkillDetail,
  SkillsListParams,
  SkillsListResult,
  SkillUpdatePayload,
} from "../domain/skills.types"

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
function toQuery(params: SkillsListParams): QueryParams {
  const query: QueryParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    sort: params.sort ?? "name",
  }
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.category?.trim()) query.category = params.category.trim()
  if (params.level?.trim()) query.level = params.level.trim()
  if (typeof params.isActive === "boolean") query.isActive = params.isActive
  return query
}

/** Parse a comma-separated aliases input into the array the backend expects. */
export function parseAliases(input: string): string[] {
  return input
    .split(",")
    .map((alias) => alias.trim())
    .filter((alias) => alias.length > 0)
}

/** Format the backend aliases array for display in the form input. */
export function formatAliases(aliases: string[]): string {
  return aliases.join(", ")
}

export const skillsApi = {
  /**
   * Fetch the paginated skills catalog.
   *
   * Verified backend route: `GET /api/v1/skills` (`authenticate`,
   * `validateQuery(skillsQuerySchema)`). Returns `{ skills }` with
   * `meta.pagination`.
   */
  async list(params: SkillsListParams = {}): Promise<SkillsListResult> {
    const { data, meta } = await apiRequestWithMeta<
      { skills: Skill[] },
      { pagination?: Pagination }
    >(apiEndpoints.skills.root, { query: toQuery(params) })

    return {
      items: data?.skills ?? [],
      pagination: meta?.pagination ?? DEFAULT_PAGINATION,
    }
  },

  /**
   * Fetch a single skill with usage counts.
   *
   * Verified backend route: `GET /api/v1/skills/:id` (`authenticate`).
   * Returns `{ skill }` including `users_count`, `career_paths_count`, and
   * `cv_skills_count`.
   */
  async getById(id: string): Promise<SkillDetail> {
    const data = await http.get<{ skill: SkillDetail }>(apiEndpoints.skills.byId(id))
    return data.skill
  },

  /**
   * Create a skill (admin only).
   *
   * Verified backend route: `POST /api/v1/skills`
   * (`authenticate` + `authorize('admin')`, `validateBody(createSkillSchema)`).
   * Returns `{ skill }`. A duplicate name throws an `ApiError` with status 409.
   */
  async create(payload: SkillCreatePayload): Promise<Skill> {
    const data = await http.post<{ skill: Skill }>(apiEndpoints.skills.root, payload)
    return data.skill
  },

  /**
   * Update a skill (admin only).
   *
   * Verified backend route: `PATCH /api/v1/skills/:id`
   * (`authenticate` + `authorize('admin')`, `validateBody(updateSkillSchema)`).
   * Returns `{ skill }`.
   */
  async update(id: string, payload: SkillUpdatePayload): Promise<Skill> {
    const data = await http.patch<{ skill: Skill }>(apiEndpoints.skills.byId(id), payload)
    return data.skill
  },

  /**
   * Delete a skill (admin only).
   *
   * Verified backend route: `DELETE /api/v1/skills/:id`
   * (`authenticate` + `authorize('admin')`). The backend returns 409 when the
   * skill is still referenced by other records (deactivate instead).
   */
  async remove(id: string): Promise<void> {
    await http.delete<{ id: string }>(apiEndpoints.skills.byId(id))
  },
}
