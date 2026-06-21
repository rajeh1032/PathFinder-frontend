import { apiRequestWithMeta, http } from "@/core/api/api-client"
import { apiEndpoints } from "@/core/api/api-endpoints"
import type {
  CvAnalysesListParams,
  CvAnalysesListResult,
  CvAnalysisDetail,
  CvAnalysisDto,
  Pagination,
} from "../domain/cv-analyses.types"

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

/** Pull a string array out of the loosely typed `extracted` blob. */
function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === "string")
}

/** Map a backend CV analysis DTO to the flattened list row. */
export function toListItem(dto: CvAnalysisDto): CvAnalysesListResult["items"][number] {
  return {
    id: dto.id,
    userName: dto.user?.name ?? "—",
    userEmail: dto.user?.email ?? "—",
    fileName: dto.cv?.original_name ?? "—",
    score: typeof dto.score === "number" ? dto.score : 0,
    status: dto.status,
    createdAt: dto.created_at ? dto.created_at.replace("T", " ").slice(0, 16) : "—",
  }
}

/** Map a backend CV analysis DTO to the rich detail view model. */
export function toDetail(dto: CvAnalysisDto): CvAnalysisDetail {
  const extracted = dto.extracted ?? {}
  return {
    id: dto.id,
    cvId: dto.cv_id,
    userName: dto.user?.name ?? "—",
    userEmail: dto.user?.email ?? "—",
    fileName: dto.cv?.original_name ?? "—",
    model: dto.model ?? "—",
    status: dto.status,
    score: typeof dto.score === "number" ? dto.score : 0,
    summary: dto.summary ?? "",
    strengths: Array.isArray(dto.strengths) ? dto.strengths : [],
    weaknesses: Array.isArray(dto.weaknesses) ? dto.weaknesses : [],
    suggestions: Array.isArray(dto.suggestions) ? dto.suggestions : [],
    detectedSkills: Array.isArray(dto.detected_skills) ? dto.detected_skills : [],
    missingSkills: stringList(extracted.missing_skills),
    recommendedRoles: stringList(extracted.recommended_roles),
    createdAt: dto.created_at ? dto.created_at.replace("T", " ").slice(0, 16) : "—",
    reviewedAt: dto.reviewed_at ? dto.reviewed_at.replace("T", " ").slice(0, 16) : null,
  }
}

export const cvAnalysesApi = {
  /**
   * Fetch the paginated CV analysis catalog (admin only).
   *
   * Verified backend route: `GET /api/v1/cvs`
   * (`authenticate` + `authorize('admin')`, returns `{ analyses }` with
   * `meta.pagination`).
   */
  async list(params: CvAnalysesListParams = {}): Promise<CvAnalysesListResult> {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    }
    if (params.status) query.status = params.status

    const { data, meta } = await apiRequestWithMeta<
      { analyses: CvAnalysisDto[] },
      { pagination?: Pagination }
    >(apiEndpoints.cvs.list, { query })

    return {
      items: (data?.analyses ?? []).map(toListItem),
      pagination: meta?.pagination ?? DEFAULT_PAGINATION,
    }
  },

  /**
   * Fetch a single CV analysis by id (admin only).
   *
   * Verified backend route: `GET /api/v1/cvs/:id`
   * (`authenticate` + `authorize('admin')`, returns `{ analysis }`).
   */
  async getById(id: string): Promise<CvAnalysisDetail> {
    const data = await http.get<{ analysis: CvAnalysisDto }>(apiEndpoints.cvs.byId(id))
    return toDetail(data.analysis)
  },
}
