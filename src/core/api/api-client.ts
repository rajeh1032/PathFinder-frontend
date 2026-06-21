import type { AxiosRequestConfig } from "axios"
import { ApiError } from "./api-error"
import { apiInstance } from "./axios-instance"
import { HttpMethod } from "./http.constants"

export { ApiError } from "./api-error"
export type { ApiErrorCode } from "./api-error"
export { apiInstance, createApiInstance } from "./axios-instance"

/** Standard backend success envelope: `{ success, message, data, meta? }`. */
export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  meta?: unknown
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>

export type RequestOptions = {
  method?: HttpMethod
  body?: unknown
  query?: QueryParams
  headers?: Record<string, string>
  /** Attach the bearer token. Defaults to `true`; set `false` for public routes. */
  authenticated?: boolean
  /** Override the base URL (for example `chatApiBaseUrl` for `/api/chat`). */
  baseUrl?: string
  /** Override the per-request timeout in milliseconds. */
  timeoutMs?: number
  /** Optional AbortSignal to cancel the request. */
  signal?: AbortSignal
}

/**
 * Perform an API request through the shared Axios instance and return the
 * unwrapped `data` field as `T`. Every failure surfaces as an `ApiError`
 * (mapped by the Axios response interceptor).
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = HttpMethod.GET, body, query, headers, authenticated, baseUrl, timeoutMs, signal } = options

  const config: AxiosRequestConfig = {
    url: path,
    method,
    params: query,
    data: body,
    headers,
    authenticated,
    signal,
  }
  if (baseUrl) config.baseURL = baseUrl
  if (timeoutMs !== undefined) config.timeout = timeoutMs

  const response = await apiInstance.request<ApiEnvelope<T>>(config)
  return response.data?.data as T
}

/**
 * Like `apiRequest` but also returns the envelope `meta` (for example
 * pagination). Use only when a feature genuinely needs `meta`.
 */
export async function apiRequestWithMeta<T, M = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta?: M }> {
  const { method = HttpMethod.GET, body, query, headers, authenticated, baseUrl, timeoutMs, signal } = options

  const config: AxiosRequestConfig = {
    url: path,
    method,
    params: query,
    data: body,
    headers,
    authenticated,
    signal,
  }
  if (baseUrl) config.baseURL = baseUrl
  if (timeoutMs !== undefined) config.timeout = timeoutMs

  const response = await apiInstance.request<ApiEnvelope<T> & { meta?: M }>(config)
  return { data: response.data?.data as T, meta: response.data?.meta as M | undefined }
}

/** Verb-style convenience wrappers around `apiRequest`. */
export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: HttpMethod.GET }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: HttpMethod.POST, body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: HttpMethod.PUT, body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: HttpMethod.PATCH, body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: HttpMethod.DELETE }),
}

/** Re-exported so callers can `import { ApiError } from "@/core/api/api-client"`. */
export type ApiClientError = ApiError
