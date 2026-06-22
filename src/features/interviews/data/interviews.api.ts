import { apiRequestWithMeta, http } from "@/core/api/api-client"
import { apiEndpoints } from "@/core/api/api-endpoints"
import type { QueryParams } from "@/core/api/api-client"
import type {
  AdminInterviewDetailDto,
  AdminInterviewListItemDto,
  AdminInterviewQuestionDto,
  InterviewDetail,
  InterviewListItem,
  InterviewQuestion,
  InterviewsListParams,
  InterviewsListResult,
  InterviewSummary,
  InterviewSummaryDto,
  Pagination,
} from "../domain/interviews.types"

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
  nextPage: null,
  previousPage: null,
}

const EMPTY_SUMMARY: InterviewSummary = {
  totalInterviews: 0,
  averageScore: null,
  bestScore: null,
  latestScore: null,
}

/** Format an ISO timestamp into a compact `YYYY-MM-DD HH:mm` label. */
function formatDate(value: string | null): string {
  return value ? value.replace("T", " ").slice(0, 16) : "—"
}

/** Derive a human duration from the start/finish timestamps. */
function durationLabel(startedAt: string | null, completedAt: string | null): string | null {
  if (!startedAt || !completedAt) return null
  const start = new Date(startedAt).getTime()
  const end = new Date(completedAt).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null
  const minutes = Math.round((end - start) / 60000)
  return minutes > 0 ? `${minutes} min` : "<1 min"
}

/** Map a backend list row to the flattened table item. */
function toListItem(dto: AdminInterviewListItemDto): InterviewListItem {
  return {
    id: dto.id,
    userName: dto.user_name ?? "—",
    careerPath: dto.career_path_title ?? "—",
    type: dto.interview_type,
    totalQuestions: dto.total_questions ?? 0,
    score: typeof dto.overall_score === "number" ? dto.overall_score : null,
    status: dto.status,
    startedAt: formatDate(dto.started_at),
  }
}

/** Map the backend summary block to the header view model. */
function toSummary(dto: InterviewSummaryDto | null | undefined): InterviewSummary {
  if (!dto) return EMPTY_SUMMARY
  return {
    totalInterviews: dto.total_interviews ?? 0,
    averageScore: typeof dto.average_score === "number" ? dto.average_score : null,
    bestScore: typeof dto.best_score === "number" ? dto.best_score : null,
    latestScore: typeof dto.latest_score === "number" ? dto.latest_score : null,
  }
}

/** Map a backend question DTO to the question view model. */
function toQuestion(dto: AdminInterviewQuestionDto): InterviewQuestion {
  return {
    id: dto.id,
    order: dto.question_order,
    question: dto.question,
    options: Array.isArray(dto.options) ? dto.options : [],
    userAnswer: dto.user_answer ?? null,
    isSkipped: Boolean(dto.is_skipped),
    feedback: dto.feedback ?? null,
    score: typeof dto.score === "number" ? dto.score : null,
    status: dto.question_status ?? null,
    aiSuggestion: dto.ai_suggestion ?? null,
  }
}

/** Map the backend admin detail DTO to the detail view model. */
function toDetail(dto: AdminInterviewDetailDto): InterviewDetail {
  return {
    id: dto.id,
    userName: dto.user_name ?? "—",
    userEmail: dto.user_email ?? "—",
    careerPath: dto.career_path_title ?? "—",
    category: dto.career_path_category ?? null,
    type: dto.interview_type,
    status: dto.status,
    totalQuestions: dto.total_questions ?? (Array.isArray(dto.questions) ? dto.questions.length : 0),
    overallScore: typeof dto.overall_score === "number" ? dto.overall_score : null,
    insight: dto.quick_ai_insight ?? null,
    startedAt: formatDate(dto.started_at),
    completedAt: dto.completed_at ? formatDate(dto.completed_at) : null,
    durationLabel: durationLabel(dto.started_at, dto.completed_at),
    questions: (Array.isArray(dto.questions) ? dto.questions : []).map(toQuestion),
  }
}

/** Build the backend query object, omitting empty/undefined filters. */
function toQuery(params: InterviewsListParams): QueryParams {
  const query: QueryParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  }
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.status) query.status = params.status
  if (params.interviewType) query.interview_type = params.interviewType
  if (params.careerPathId?.trim()) query.career_path_id = params.careerPathId.trim()
  return query
}

export const interviewsApi = {
  /**
   * Fetch the paginated admin interview sessions list.
   *
   * Verified backend route: `GET /api/v1/interviews/admin/sessions`
   * (`authenticate` + `authorize('admin')`,
   * `validateQuery(interviewHistoryQuerySchema)`). Returns
   * `{ items, summary }` with `meta.pagination`.
   */
  async list(params: InterviewsListParams = {}): Promise<InterviewsListResult> {
    const { data, meta } = await apiRequestWithMeta<
      { items: AdminInterviewListItemDto[]; summary: InterviewSummaryDto | null },
      { pagination?: Pagination }
    >(apiEndpoints.interviews.adminSessions, { query: toQuery(params) })

    return {
      items: (data?.items ?? []).map(toListItem),
      pagination: meta?.pagination ?? DEFAULT_PAGINATION,
      summary: toSummary(data?.summary),
    }
  },

  /**
   * Fetch a single admin interview session with its questions.
   *
   * Verified backend route: `GET /api/v1/interviews/admin/sessions/:id`
   * (`authenticate` + `authorize('admin')`). Returns the session object
   * directly (no wrapper key). Responds 404 when the session does not exist.
   */
  async getById(id: string): Promise<InterviewDetail> {
    const data = await http.get<AdminInterviewDetailDto>(apiEndpoints.interviews.adminSessionById(id))
    return toDetail(data)
  },

  /**
   * Delete an interview session (admin only).
   *
   * Verified backend route: `DELETE /api/v1/interviews/admin/sessions/:id`
   * (`authenticate` + `authorize('admin')`). Returns `{ session_id, deleted }`.
   */
  async remove(id: string): Promise<void> {
    await http.delete<{ session_id: string; deleted: boolean }>(
      apiEndpoints.interviews.adminSessionById(id),
    )
  },
}
