import { useCallback, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { fetchJobMatches } from "./jobMatches.slice"

// The screen has no pagination controls, so fetch one large page. minScore 0
// shows every match regardless of score.
const LIST_PARAMS = { page: 1, limit: 100, minScore: 0 } as const

/**
 * Facade over the admin job-matches list slice. Loads every user's matches
 * from `GET /api/v1/job-matches/admin` (admin-gated, cross-user) and exposes a
 * `refresh` used by the page's "Recompute" affordance.
 *
 * Note: there is no cross-user "regenerate all" backend operation, so the
 * action re-queries the list rather than recomputing other users' matches.
 */
export function useJobMatches() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.jobMatches.items)
  const pagination = useAppSelector((state) => state.jobMatches.pagination)
  const status = useAppSelector((state) => state.jobMatches.status)
  const error = useAppSelector((state) => state.jobMatches.error)

  useEffect(() => {
    dispatch(fetchJobMatches(LIST_PARAMS))
  }, [dispatch])

  const refetch = useCallback(() => {
    dispatch(fetchJobMatches(LIST_PARAMS))
  }, [dispatch])

  return {
    items,
    pagination,
    isLoading: status === "loading" || status === "idle",
    error,
    refetch,
  }
}
