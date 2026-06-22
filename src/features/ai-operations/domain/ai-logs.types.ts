/**
 * Types for the AI logs feature (admin observability).
 *
 * Backend contract source of truth: PathFinder-Backend `aiLogs` module
 * (`src/modules/aiLogs`), mounted at `/api/v1/ai-logs`. All routes require
 * `authenticate` + `authorize('admin')`:
 *   - `GET /api/v1/ai-logs`        -> paginated `{ logs }` with `meta.pagination`
 *                                     (`validateQuery(aiLogsQuerySchema)`)
 *   - `GET /api/v1/ai-logs/stats`  -> `{ stats }` summary cards
 *                                     (`validateQuery(aiLogStatsQuerySchema)`)
 *   - `GET /api/v1/ai-logs/:id`    -> `{ log }` with prompt/response/payloads
 *   - `DELETE /api/v1/ai-logs/:id` -> `{ id }`
 *   - `DELETE /api/v1/ai-logs`     -> `{ cleared: true }` (clear all)
 *
 * The backend maps the `ai_logs` table row to snake_case JSON. Notable schema
 * facts (do not invent fields):
 *   - `tokens_used` is a single integer (there is no in/out split).
 *   - `status` is stored as `success` | `failed` (not ok/warn/error).
 *   - there is no `endpoint` column.
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

/** Stored AI log status as returned by the backend. */
export type AiLogStatus = "success" | "failed"

/** An AI log row as returned by `GET /ai-logs` (list). */
export type AiLog = {
  id: string
  user_id: string | null
  feature: string | null
  model: string | null
  tokens_used: number | null
  latency_ms: number | null
  cost: number | string | null
  status: AiLogStatus | string | null
  error_message: string | null
  created_at: string | null
}

/** An AI log detail (`GET /ai-logs/:id`) adds prompt/response and payloads. */
export type AiLogDetail = AiLog & {
  prompt: string | null
  response: string | null
  request_payload: Record<string, unknown>
  response_payload: Record<string, unknown>
}

/** Summary cards from `GET /ai-logs/stats`. */
export type AiLogStats = {
  since: string
  days: number
  totalRequests: number
  totalTokens: number
  avgLatencyMs: number
  errorRate: number
  failedCount: number
}

/** Query parameters accepted by `GET /api/v1/ai-logs`. */
export type AiLogsListParams = {
  page?: number
  limit?: number
  q?: string
  feature?: string
  model?: string
  status?: AiLogStatus
  userId?: string
  from?: string
  to?: string
}

export type AiLogsListResult = {
  items: AiLog[]
  pagination: Pagination
}
