import { apiRequestWithMeta, http } from "@/core/api/api-client"
import { apiEndpoints } from "@/core/api/api-endpoints"
import type { QueryParams } from "@/core/api/api-client"
import type {
  JobMatch,
  JobMatchesListParams,
  JobMatchesListResult,
  MatchJob,
  MatchUser,
  Pagination,
} from "../domain/jobMatches.types"

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 1,
}

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((v) => String(v)).filter(Boolean) : []

/** Build the admin list query, omitting empty/undefined filters. */
function toQuery(params: JobMatchesListParams): QueryParams {
  const query: QueryParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  }
  if (typeof params.minScore === "number") query.minScore = params.minScore
  if (params.status?.trim()) query.status = params.status.trim()
  if (params.generatedByType) query.generatedByType = params.generatedByType
  if (params.userId?.trim()) query.userId = params.userId.trim()
  return query
}

function mapJob(raw: (Partial<MatchJob> & { required_skills?: unknown }) | null): MatchJob | null {
  if (!raw) return null
  return {
    id: String(raw.id),
    title: raw.title ?? "",
    company: raw.company ?? "",
    location: raw.location ?? null,
    source: raw.source ?? null,
    source_type: raw.source_type ?? null,
    required_skills: asStringArray(raw.required_skills),
    employment_type: raw.employment_type ?? null,
    salary_range: raw.salary_range ?? null,
    level: raw.level ?? null,
    category: raw.category ?? null,
    company_logo_url: raw.company_logo_url ?? null,
    apply_url: raw.apply_url ?? null,
  }
}

function mapUser(raw: Partial<MatchUser> | null): MatchUser | null {
  if (!raw) return null
  return {
    id: String(raw.id),
    name: raw.name ?? null,
    email: raw.email ?? null,
  }
}

/** Normalize a raw backend match row into the feature `JobMatch` shape. */
function mapMatch(raw: Partial<JobMatch> & { jobs?: unknown; users?: unknown }): JobMatch {
  return {
    id: String(raw.id),
    user_id: String(raw.user_id ?? ""),
    job_id: String(raw.job_id ?? ""),
    cv_id: raw.cv_id ?? null,
    match_percentage: Number(raw.match_percentage ?? 0),
    matched_skills: asStringArray(raw.matched_skills),
    missing_skills: asStringArray(raw.missing_skills),
    ai_reason: raw.ai_reason ?? null,
    generated_by_type: raw.generated_by_type ?? "system",
    status: raw.status ?? "generated",
    created_at: raw.created_at ?? null,
    jobs: mapJob((raw.jobs as MatchJob | null) ?? null),
    users: mapUser((raw.users as MatchUser | null) ?? null),
  }
}

export const jobMatchesApi = {
  /**
   * List job matches across all users (admin).
   *
   * Verified backend route: `GET /api/v1/job-matches/admin`
   * (`authenticate` + `authorize('admin')`,
   * `validateQuery(listAdminJobMatchesQuerySchema)`). `data` is the matches
   * array (each joined with its owning user + job), `meta.pagination` holds the
   * page info.
   */
  async list(params: JobMatchesListParams = {}): Promise<JobMatchesListResult> {
    const { data, meta } = await apiRequestWithMeta<
      JobMatch[],
      { pagination?: Pagination }
    >(apiEndpoints.jobMatches.admin, { query: toQuery(params) })

    return {
      items: (data ?? []).map(mapMatch),
      pagination: meta?.pagination ?? DEFAULT_PAGINATION,
    }
  },

  /**
   * Fetch a single match by id (admin).
   *
   * Verified backend route: `GET /api/v1/job-matches/admin/:id`
   * (`authenticate` + `authorize('admin')`).
   */
  async getById(id: string): Promise<JobMatch> {
    const data = await http.get<JobMatch>(apiEndpoints.jobMatches.adminById(id))
    return mapMatch(data)
  },
}
