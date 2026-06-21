import { useCallback, useEffect, useState } from "react"
import { ApiError } from "@/core/api/api-client"
import { usersApi } from "../data/users.api"
import type { UserDto, UserStats } from "../domain/users.types"

type UserDetailsState = {
  user: UserDto | null
  stats: UserStats | null
  isLoading: boolean
  error: string | null
}

/** Loads a single user plus their aggregated stats for the details page. */
export function useUserDetails(id: string | undefined) {
  const [state, setState] = useState<UserDetailsState>({
    user: null,
    stats: null,
    isLoading: true,
    error: null,
  })

  const load = useCallback(async () => {
    if (!id) return
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const [user, stats] = await Promise.all([
        usersApi.getById(id),
        usersApi.getStats(id),
      ])
      setState({ user, stats, isLoading: false, error: null })
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Failed to load user"
      setState({ user: null, stats: null, isLoading: false, error: message })
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, refetch: load }
}
