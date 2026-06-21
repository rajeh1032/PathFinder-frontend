import { http } from "@/core/api/api-client"
import { apiEndpoints } from "@/core/api/api-endpoints"
import type { LoginCredentials, LoginResponse } from "../domain/auth.types"

export const authApi = {
  login: (credentials: LoginCredentials) =>
    http.post<LoginResponse>(apiEndpoints.auth.login, credentials, { authenticated: false }),
}
