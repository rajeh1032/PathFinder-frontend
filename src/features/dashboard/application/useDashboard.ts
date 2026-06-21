import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { fetchDashboardOverview } from "./dashboard.slice"

/** Facade over the dashboard slice; fetches the overview on mount. */
export function useDashboard() {
  const dispatch = useAppDispatch()
  const overview = useAppSelector((state) => state.dashboard.overview)
  const status = useAppSelector((state) => state.dashboard.status)
  const error = useAppSelector((state) => state.dashboard.error)

  useEffect(() => {
    if (status === "idle") dispatch(fetchDashboardOverview())
  }, [status, dispatch])

  return {
    overview,
    isLoading: status === "loading" || status === "idle",
    error,
    refetch: () => dispatch(fetchDashboardOverview()),
  }
}
