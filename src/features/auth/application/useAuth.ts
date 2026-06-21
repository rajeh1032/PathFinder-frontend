import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import type { LoginCredentials } from "../domain/auth.types"
import { login, logout } from "./auth.slice"

/**
 * Redux-backed auth facade. Keeps a small, stable surface for presentation code
 * so components do not touch the store directly.
 */
export function useAuth() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const status = useAppSelector((state) => state.auth.status)
  const error = useAppSelector((state) => state.auth.error)

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading: status === "loading",
    error,
    async login(credentials: LoginCredentials, remember: boolean) {
      const result = await dispatch(login({ credentials, remember }))
      if (login.rejected.match(result)) {
        throw new Error(result.payload ?? "Sign in failed")
      }
    },
    logout() {
      dispatch(logout())
    },
  }
}
