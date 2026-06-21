import { useCallback, useEffect, useState } from "react"
import { ApiError } from "@/core/api/api-client"
import { cvAnalysesApi } from "../data/cv-analyses.api"
import type { CvAnalysisDetail } from "../domain/cv-analyses.types"

type DetailState = {
  data: CvAnalysisDetail | null
  isLoading: boolean
  error: string | null
}

/**
 * Loads a single CV analysis by id from the admin detail endpoint.
 * Cancels in-flight requests on unmount / id change.
 */
export function useCvAnalysisDetail(id: string | undefined) {
  const [state, setState] = useState<DetailState>({
    data: null,
    isLoading: Boolean(id),
    error: null,
  })

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!id) {
        setState({ data: null, isLoading: false, error: "Missing analysis id" })
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const data = await cvAnalysesApi.getById(id)
        if (signal?.aborted) return
        setState({ data, isLoading: false, error: null })
      } catch (error) {
        if (signal?.aborted) return
        const message =
          error instanceof ApiError ? error.message : "Failed to load CV analysis"
        setState({ data: null, isLoading: false, error: message })
      }
    },
    [id],
  )

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  return {
    analysis: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch: () => load(),
  }
}
