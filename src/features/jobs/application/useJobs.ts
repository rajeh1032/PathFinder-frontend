import { useCallback, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { fetchJobs } from "./jobs.slice"

// The current Jobs screen has no pagination controls, so we fetch a single
// large page and keep search/status filtering client-side (matching the
// existing UI). Backend max limit is 100.
const LIST_LIMIT = 100

/**
 * Facade over the jobs list slice. Loads the published/synced jobs catalog
 * from `GET /api/v1/jobs` on mount and exposes loading/error state plus a
 * `refetch` for the page's retry affordance.
 */
export function useJobs() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.jobs.items)
  const pagination = useAppSelector((state) => state.jobs.pagination)
  const status = useAppSelector((state) => state.jobs.status)
  const error = useAppSelector((state) => state.jobs.error)

  useEffect(() => {
    dispatch(fetchJobs({ page: 1, limit: LIST_LIMIT }))
  }, [dispatch])

  const refetch = useCallback(() => {
    dispatch(fetchJobs({ page: 1, limit: LIST_LIMIT }))
  }, [dispatch])

  return {
    items,
    pagination,
    isLoading: status === "loading" || status === "idle",
    error,
    refetch,
  }
}
