import { useCallback, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { fetchAiLogStats, fetchAiLogs } from "./ai-logs.slice"
import { aiLogsApi } from "../data/ai-logs.api"
import type { AiLogStatus } from "../domain/ai-logs.types"

const DEFAULT_LIMIT = 20

type AiLogsQueryState = {
  page: number
  q: string
  status: AiLogStatus | ""
}

/**
 * Facade over the AI logs slice. Owns the server query state (page, search,
 * status filter) and refetches list + stats when it changes. Search is
 * debounced so the backend `q` filter is not hit on every keystroke.
 */
export function useAiLogs() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.aiLogs.items)
  const pagination = useAppSelector((state) => state.aiLogs.pagination)
  const status = useAppSelector((state) => state.aiLogs.status)
  const error = useAppSelector((state) => state.aiLogs.error)
  const stats = useAppSelector((state) => state.aiLogs.stats)
  const statsStatus = useAppSelector((state) => state.aiLogs.statsStatus)

  const [query, setQuery] = useState<AiLogsQueryState>({
    page: 1,
    q: "",
    status: "",
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
      fetchAiLogs({
        page: query.page,
        limit: DEFAULT_LIMIT,
        q: query.q,
        status: query.status || undefined,
      }),
    )
  }, [dispatch, query.page, query.q, query.status])

  useEffect(() => {
    dispatch(fetchAiLogStats(1))
  }, [dispatch])

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }))
  }, [])

  const setStatus = useCallback((value: AiLogStatus | "") => {
    setQuery((prev) => ({ ...prev, status: value, page: 1 }))
  }, [])

  const refetch = useCallback(() => {
    dispatch(
      fetchAiLogs({
        page: query.page,
        limit: DEFAULT_LIMIT,
        q: query.q,
        status: query.status || undefined,
      }),
    )
    dispatch(fetchAiLogStats(1))
  }, [dispatch, query.page, query.q, query.status])

  const removeLog = useCallback(
    async (id: string) => {
      await aiLogsApi.remove(id)
      refetch()
    },
    [refetch],
  )

  const clearLogs = useCallback(async () => {
    await aiLogsApi.clear()
    refetch()
  }, [refetch])

  return {
    items,
    pagination,
    isLoading: status === "loading" || status === "idle",
    error,
    stats,
    statsLoading: statsStatus === "loading" || statsStatus === "idle",
    search: searchInput,
    setSearch: setSearchInput,
    status: query.status,
    setStatus,
    setPage,
    refetch,
    removeLog,
    clearLogs,
  }
}
