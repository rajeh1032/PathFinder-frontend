import { useCallback, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { fetchInterviews } from "./interviews.slice"
import { interviewsApi } from "../data/interviews.api"
import type { InterviewStatus, InterviewType } from "../domain/interviews.types"

const DEFAULT_LIMIT = 10

type InterviewsQueryState = {
  page: number
  q: string
  status: InterviewStatus | ""
  interviewType: InterviewType | ""
}

/**
 * Facade over the admin interview sessions list slice. Owns the server query
 * state (page, search, status, type) and refetches when it changes. Search is
 * debounced so the backend `q` filter is not hit on every keystroke. The delete
 * action calls the data layer and refreshes the current page.
 */
export function useInterviews() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.interviews.items)
  const pagination = useAppSelector((state) => state.interviews.pagination)
  const summary = useAppSelector((state) => state.interviews.summary)
  const status = useAppSelector((state) => state.interviews.status)
  const error = useAppSelector((state) => state.interviews.error)

  const [query, setQuery] = useState<InterviewsQueryState>({
    page: 1,
    q: "",
    status: "",
    interviewType: "",
  })
  const [searchInput, setSearchInput] = useState("")

  // Debounce the free-text search into the server query.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setQuery((prev) => (prev.q === searchInput ? prev : { ...prev, q: searchInput, page: 1 }))
    }, 350)
    return () => window.clearTimeout(handle)
  }, [searchInput])

  useEffect(() => {
    dispatch(
      fetchInterviews({
        page: query.page,
        limit: DEFAULT_LIMIT,
        q: query.q,
        status: query.status || undefined,
        interviewType: query.interviewType || undefined,
      }),
    )
  }, [dispatch, query.page, query.q, query.status, query.interviewType])

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }))
  }, [])

  const setStatus = useCallback((value: InterviewStatus | "") => {
    setQuery((prev) => ({ ...prev, status: value, page: 1 }))
  }, [])

  const setInterviewType = useCallback((value: InterviewType | "") => {
    setQuery((prev) => ({ ...prev, interviewType: value, page: 1 }))
  }, [])

  const refetch = useCallback(() => {
    dispatch(
      fetchInterviews({
        page: query.page,
        limit: DEFAULT_LIMIT,
        q: query.q,
        status: query.status || undefined,
        interviewType: query.interviewType || undefined,
      }),
    )
  }, [dispatch, query.page, query.q, query.status, query.interviewType])

  const removeInterview = useCallback(
    async (id: string) => {
      await interviewsApi.remove(id)
      refetch()
    },
    [refetch],
  )

  return {
    items,
    pagination,
    summary,
    isLoading: status === "loading" || status === "idle",
    error,
    search: searchInput,
    setSearch: setSearchInput,
    status: query.status,
    setStatus,
    interviewType: query.interviewType,
    setInterviewType,
    setPage,
    refetch,
    removeInterview,
  }
}
