import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { fetchCvAnalyses } from "./cv-analyses.slice"

/** Facade over the CV analyses list slice. Fetches on mount. */
export function useCvAnalyses() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cvAnalyses.items)
  const pagination = useAppSelector((state) => state.cvAnalyses.pagination)
  const status = useAppSelector((state) => state.cvAnalyses.status)
  const error = useAppSelector((state) => state.cvAnalyses.error)

  useEffect(() => {
    if (status === "idle") dispatch(fetchCvAnalyses())
  }, [dispatch, status])

  return {
    items,
    pagination,
    isLoading: status === "loading" || status === "idle",
    error,
    refetch: () => dispatch(fetchCvAnalyses()),
  }
}
