import { useEffect } from "react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import type { UsersListParams } from "../domain/users.types"
import { fetchUsers, setParams, setUserActive } from "./users.slice"

/** Facade over the users list slice. Refetches when params change. */
export function useUsers() {
  const dispatch = useAppDispatch()
  const result = useAppSelector((state) => state.users.result)
  const params = useAppSelector((state) => state.users.params)
  const status = useAppSelector((state) => state.users.status)
  const error = useAppSelector((state) => state.users.error)

  useEffect(() => {
    dispatch(fetchUsers(params))
  }, [dispatch, params])

  return {
    items: result?.items ?? [],
    pagination: result?.pagination ?? null,
    params,
    isLoading: status === "loading" || status === "idle",
    error,
    updateParams: (next: UsersListParams) => dispatch(setParams(next)),
    refetch: () => dispatch(fetchUsers(params)),
    async toggleActive(id: string, isActive: boolean) {
      const action = await dispatch(setUserActive({ id, isActive }))
      if (setUserActive.fulfilled.match(action)) {
        toast.success(isActive ? "User activated" : "User deactivated")
      } else {
        toast.error(action.payload ?? "Failed to update user status")
      }
    },
  }
}
