import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios"
import { authStorage } from "@/core/auth/auth-storage"
import { env } from "@/core/config/env"
import { ApiError } from "./api-error"
import { ContentType, HttpHeader, HttpStatus, SESSION_EXPIRED_EVENT } from "./http.constants"

/** Per-request flags layered on top of the standard Axios config. */
declare module "axios" {
  export interface AxiosRequestConfig {
    /** Attach the bearer token. Defaults to `true`; set `false` for public routes. */
    authenticated?: boolean
  }
}

type BackendErrorPayload = {
  message?: string
  details?: unknown
  errors?: unknown
}

/** Convert any Axios failure into the project's normalized `ApiError`. */
function toApiError(error: AxiosError<BackendErrorPayload>): ApiError {
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return new ApiError("Request timed out", HttpStatus.REQUEST_TIMEOUT, { cause: error })
  }

  if (!error.response) {
    return new ApiError("Cannot connect to the PathFinder API", HttpStatus.NETWORK_ERROR, {
      cause: error,
    })
  }

  const { status, data } = error.response
  return new ApiError(data?.message || `Request failed (${status})`, status, {
    details: data?.details ?? data?.errors,
    cause: error,
  })
}

/** Build a configured Axios instance with the shared interceptors attached. */
export function createApiInstance(baseURL: string = env.apiBaseUrl): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: env.requestTimeoutMs,
    headers: { [HttpHeader.CONTENT_TYPE]: ContentType.JSON },
  })

  // Request interceptor: attach the bearer token for authenticated requests and
  // let the browser set the multipart boundary for FormData bodies.
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (config.authenticated !== false) {
      const token = authStorage.getAccessToken()
      if (token) config.headers.set(HttpHeader.AUTHORIZATION, `Bearer ${token}`)
    }
    if (config.data instanceof FormData) {
      config.headers.delete(HttpHeader.CONTENT_TYPE)
    }
    return config
  })

  // Response interceptor: clear the session on 401 and normalize every error.
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<BackendErrorPayload>) => {
      const apiError = toApiError(error)
      if (apiError.status === HttpStatus.UNAUTHORIZED) {
        authStorage.clear()
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
      }
      return Promise.reject(apiError)
    },
  )

  return instance
}

/** Default instance pointed at `/api/v1`. */
export const apiInstance = createApiInstance()
