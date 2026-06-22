import { apiRequestWithMeta, http } from "@/core/api/api-client"
import { apiEndpoints } from "@/core/api/api-endpoints"
import type { QueryParams } from "@/core/api/api-client"
import type {
  Job,
  JobsListParams,
  JobsListResult,
  Pagination,
} from "../domain/jobs.types"

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

/** Build the backend query object, omitting empty/undefined filters. */
function toQuery(params: JobsListParams): QueryParams {
  const query: QueryParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  }
  if (params.keyword?.trim()) query.keyword = params.keyword.trim()
  if (params.location?.trim()) query.location = params.location.trim()
  if (params.category?.trim()) query.category = params.category.trim()
  if (params.level?.trim()) query.level = params.level.trim()
  if (params.source?.trim()) query.source = params.source.trim()
  if (params.sourceType?.trim()) query.sourceType = params.sourceType.trim()
  if (params.status) query.status = params.status
  if (typeof params.remote === "boolean") query.remote = params.remote
  return query
}

/** Normalize a raw backend row into the feature `Job` shape. */
function mapJob(raw: Partial<Job> & { required_skills?: unknown }): Job {
  const skills = Array.isArray(raw.required_skills)
    ? (raw.required_skills as unknown[]).map((s) => String(s)).filter(Boolean)
    : []
  return {
    id: String(raw.id),
    title: raw.title ?? "",
    company: raw.company ?? "",
    location: raw.location ?? null,
    description: raw.description ?? null,
    source: raw.source ?? null,
    source_type: raw.source_type ?? null,
    external_id: raw.external_id ?? null,
    apply_url: raw.apply_url ?? null,
    required_skills: skills,
    employment_type: raw.employment_type ?? null,
    salary_range: raw.salary_range ?? null,
    level: raw.level ?? null,
    category: raw.category ?? null,
    thumbnail_url: raw.thumbnail_url ?? null,
    company_logo_url: raw.company_logo_url ?? null,
    certificate_provider: raw.certificate_provider ?? null,
    duration: raw.duration ?? null,
    is_active: raw.is_active ?? false,
    status: raw.status ?? "draft",
    posted_at: raw.posted_at ?? null,
    created_at: raw.created_at ?? null,
    updated_at: raw.updated_at ?? null,
  }
}

export const jobsApi = {
  /**
   * Fetch the paginated jobs catalog.
   *
   * Verified backend route: `GET /api/v1/jobs` (public read,
   * `validateQuery(listJobsQuerySchema)`). `data` is the jobs array and
   * `meta.pagination` holds the page info.
   */
  async list(params: JobsListParams = {}): Promise<JobsListResult> {
    const { data, meta } = await apiRequestWithMeta<
      Job[],
      { pagination?: Pagination }
    >(apiEndpoints.jobs.root, { query: toQuery(params) })

    return {
      items: (data ?? []).map(mapJob),
      pagination: meta?.pagination ?? DEFAULT_PAGINATION,
    }
  },

  /**
   * Fetch a single job.
   *
   * Verified backend route: `GET /api/v1/jobs/:id` (public read). `data` is the
   * job object.
   */
  async getById(id: string): Promise<Job> {
    const data = await http.get<Job>(apiEndpoints.jobs.byId(id))
    return mapJob(data)
  },
}
