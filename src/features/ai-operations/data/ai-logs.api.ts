import { apiRequestWithMeta, http } from "@/core/api/api-client"
import { apiEndpoints } from "@/core/api/api-endpoints"
import type { QueryParams } from "@/core/api/api-client"
import type {
  AiLog,
  AiLogDetail,
  AiLogStats,
  AiLogsListParams,
  AiLogsListResult,
  Pagination,
} from "../domain/ai-logs.types"

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
function toQuery(params: AiLogsListParams): QueryParams {
  const query: QueryParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  }
  if (params.q?.trim()) query.q = params.q.trim()
  if (params.feature?.trim()) query.feature = params.feature.trim()
  if (params.model?.trim()) query.model = params.model.trim()
  if (params.status) query.status = params.status
  if (params.userId?.trim()) query.userId = params.userId.trim()
  if (params.from) query.from = params.from
  if (params.to) query.to = params.to
  return query
}

export const aiLogsApi = {
  /**
   * Fetch the paginated AI logs (admin only).
   *
   * Verified backend route: `GET /api/v1/ai-logs`
   * (`authenticate` + `authorize('admin')`, `validateQuery(aiLogsQuerySchema)`).
   * Returns `{ logs }` with `meta.pagination`.
   */
  async list(params: AiLogsListParams = {}): Promise<AiLogsListResult> {
    const { data, meta } = await apiRequestWithMeta<
      { logs: AiLog[] },
      { pagination?: Pagination }
    >(apiEndpoints.aiLogs.root, { query: toQuery(params) })

    return {
      items: data?.logs ?? [],
      pagination: meta?.pagination ?? DEFAULT_PAGINATION,
    }
  },

  /**
   * Fetch the summary cards (requests, tokens, avg latency, error rate).
   *
   * Verified backend route: `GET /api/v1/ai-logs/stats`
   * (`authenticate` + `authorize('admin')`,
   * `validateQuery(aiLogStatsQuerySchema)`). Returns `{ stats }`.
   */
  async stats(days = 1): Promise<AiLogStats> {
    const data = await http.get<{ stats: AiLogStats }>(apiEndpoints.aiLogs.stats, {
      query: { days },
    })
    return data.stats
  },

  /**
   * Fetch a single log with prompt/response and payload metadata (admin only).
   *
   * Verified backend route: `GET /api/v1/ai-logs/:id`
   * (`authenticate` + `authorize('admin')`). Returns `{ log }`.
   */
  async getById(id: string): Promise<AiLogDetail> {
    const data = await http.get<{ log: AiLogDetail }>(apiEndpoints.aiLogs.byId(id))
    return data.log
  },

  /**
   * Delete a single log entry (admin only).
   *
   * Verified backend route: `DELETE /api/v1/ai-logs/:id`
   * (`authenticate` + `authorize('admin')`). Returns `{ id }`.
   */
  async remove(id: string): Promise<void> {
    await http.delete<{ id: string }>(apiEndpoints.aiLogs.byId(id))
  },

  /**
   * Clear all log entries (admin only).
   *
   * Verified backend route: `DELETE /api/v1/ai-logs`
   * (`authenticate` + `authorize('admin')`). Returns `{ cleared: true }`.
   */
  async clear(): Promise<void> {
    await http.delete<{ cleared: boolean }>(apiEndpoints.aiLogs.root)
  },
}
