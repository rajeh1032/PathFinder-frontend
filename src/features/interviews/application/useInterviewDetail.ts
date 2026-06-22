import { useCallback, useEffect, useState } from "react"
import { ApiError } from "@/core/api/api-client"
import { interviewsApi } from "../data/interviews.api"
import type { InterviewDetail } from "../domain/interviews.types"

type DetailState = {
  data: InterviewDetail | null
  isLoading: boolean
  error: string | null
}

/**
 * Loads a single interview session by id from the admin detail endpoint.
 * Cancels in-flight requests on unmount / id change.
 */
export function useInterviewDetail(id: string | undefined) {
  const [state, setState] = useState<DetailState>({
    data: null,
    isLoading: Boolean(id),
    error: null,
  })

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!id) {
        setState({ data: null, isLoading: false, error: "Missing interview id" })
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const data = await interviewsApi.getById(id)
        if (signal?.aborted) return
        setState({ data, isLoading: false, error: null })
      } catch (error) {
        if (signal?.aborted) return
        const message =
          error instanceof ApiError ? error.message : "Failed to load interview session"
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
    interview: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch: () => load(),
  }
}
