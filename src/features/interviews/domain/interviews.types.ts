/**
 * Types for the interviews feature (admin views).
 *
 * Backend contract source of truth: PathFinder-Backend `interviews` module
 * (`src/modules/interviews`), mounted at `/api/v1/interviews`. Admin endpoints
 * (require `authenticate` + `authorize('admin')`):
 *   - `GET    /interviews/admin/sessions`     -> `{ items, summary }` with
 *                                                `meta.pagination`
 *   - `GET    /interviews/admin/sessions/:id` -> a single session with its
 *                                                questions
 *   - `DELETE /interviews/admin/sessions/:id` -> `{ session_id, deleted }`
 *
 * The list/detail builders return snake_case JSON. The data layer maps those
 * DTOs to the camelCase view models below. The admin detail does not expose a
 * score breakdown or recording URL, so this feature is read + delete only.
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

/** `interview_sessions.status` values accepted by the backend. */
export type InterviewStatus = "started" | "in_progress" | "completed" | "cancelled"

/** `interview_sessions.interview_type` values accepted by the backend. */
export type InterviewType = "technical" | "behavioral" | "mock_hr"

/* ---------- Raw backend DTOs (snake_case) ---------- */

/** A row from `GET /interviews/admin/sessions` (`buildAdminInterviewHistoryItem`). */
export type AdminInterviewListItemDto = {
  id: string
  user_name: string | null
  career_path_title: string | null
  interview_type: InterviewType
  status: InterviewStatus
  total_questions: number | null
  overall_score: number | null
  quick_ai_insight: string | null
  started_at: string | null
  completed_at: string | null
}

/** The list `summary` block (`buildInterviewHistorySummary`). */
export type InterviewSummaryDto = {
  total_interviews: number
  average_score: number | null
  best_score: number | null
  latest_score: number | null
  latest_completed_at: string | null
}

/** A question inside the admin detail (`buildAdminInterviewQuestion`). */
export type AdminInterviewQuestionDto = {
  id: string
  question_order: number
  question: string
  options: string[]
  user_answer: string | null
  is_skipped: boolean
  answered_at: string | null
  feedback: string | null
  score: number | null
  question_status: string | null
  ai_suggestion: string | null
}

/** The full admin detail (`buildAdminInterviewSessionResponse`). */
export type AdminInterviewDetailDto = {
  id: string
  user_id: string
  user_name: string | null
  user_email: string | null
  career_path_id: string | null
  career_path_title: string | null
  career_path_category: string | null
  job_id: string | null
  status: InterviewStatus
  interview_type: InterviewType
  total_questions: number | null
  started_at: string | null
  completed_at: string | null
  overall_score: number | null
  quick_ai_insight: string | null
  questions: AdminInterviewQuestionDto[]
}

/* ---------- Camel-case view models used by the UI ---------- */

/** Flattened row used by the admin sessions table. */
export type InterviewListItem = {
  id: string
  userName: string
  careerPath: string
  type: InterviewType
  totalQuestions: number
  score: number | null
  status: InterviewStatus
  startedAt: string
}

/** Aggregated metrics for the sessions header cards. */
export type InterviewSummary = {
  totalInterviews: number
  averageScore: number | null
  bestScore: number | null
  latestScore: number | null
}

/** A question view model used by the detail page. */
export type InterviewQuestion = {
  id: string
  order: number
  question: string
  options: string[]
  userAnswer: string | null
  isSkipped: boolean
  feedback: string | null
  score: number | null
  status: string | null
  aiSuggestion: string | null
}

/** Detail view model used by the session details page. */
export type InterviewDetail = {
  id: string
  userName: string
  userEmail: string
  careerPath: string
  category: string | null
  type: InterviewType
  status: InterviewStatus
  totalQuestions: number
  overallScore: number | null
  insight: string | null
  startedAt: string
  completedAt: string | null
  durationLabel: string | null
  questions: InterviewQuestion[]
}

/** Query parameters accepted by `GET /interviews/admin/sessions`. */
export type InterviewsListParams = {
  page?: number
  limit?: number
  q?: string
  status?: InterviewStatus | ""
  interviewType?: InterviewType | ""
  careerPathId?: string
}

export type InterviewsListResult = {
  items: InterviewListItem[]
  pagination: Pagination
  summary: InterviewSummary
}
