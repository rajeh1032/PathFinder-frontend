import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { fetchCareerPaths } from "./career-paths.slice"

/** Facade over the career-paths list slice. Fetches on mount. */
export function useCareerPaths() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.careerPaths.items)
  const status = useAppSelector((state) => state.careerPaths.status)
  const error = useAppSelector((state) => state.careerPaths.error)

  useEffect(() => {
    if (status === "idle") dispatch(fetchCareerPaths())
  }, [dispatch, status])

  return {
    items,
    isLoading: status === "loading" || status === "idle",
    error,
    refetch: () => dispatch(fetchCareerPaths()),
  }
}
