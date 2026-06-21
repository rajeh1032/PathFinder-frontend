import { HttpStatus } from "./http.constants"

/** Normalized, UI-friendly classification of a failed request. */
export type ApiErrorCode =
  | "NETWORK"
  | "TIMEOUT"
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMIT"
  | "SERVER"
  | "UNKNOWN"

export type ApiErrorOptions = {
  code?: ApiErrorCode
  details?: unknown
  cause?: unknown
}

/**
 * The single error type thrown by the API client. Every failed request -
 * network failure, timeout, non-2xx response, or a backend `success: false`
 * envelope - is surfaced as an `ApiError` so callers have one type to catch.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly details?: unknown

  constructor(message: string, status: number, options: ApiErrorOptions = {}) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = options.details
    this.code = options.code ?? ApiError.codeFromStatus(status)
    if (options.cause !== undefined) {
      ;(this as { cause?: unknown }).cause = options.cause
    }
    // Keep `instanceof` working after transpilation to ES5/ES2015 targets.
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  static codeFromStatus(status: number): ApiErrorCode {
    switch (status) {
      case HttpStatus.NETWORK_ERROR:
        return "NETWORK"
      case HttpStatus.REQUEST_TIMEOUT:
        return "TIMEOUT"
      case HttpStatus.BAD_REQUEST:
        return "VALIDATION"
      case HttpStatus.UNAUTHORIZED:
        return "UNAUTHORIZED"
      case HttpStatus.FORBIDDEN:
        return "FORBIDDEN"
      case HttpStatus.NOT_FOUND:
        return "NOT_FOUND"
      case HttpStatus.CONFLICT:
        return "CONFLICT"
      case HttpStatus.TOO_MANY_REQUESTS:
        return "RATE_LIMIT"
      default:
        return status >= HttpStatus.INTERNAL_SERVER_ERROR ? "SERVER" : "UNKNOWN"
    }
  }

  get isNetworkError() {
    return this.code === "NETWORK"
  }
  get isTimeout() {
    return this.code === "TIMEOUT"
  }
  get isUnauthorized() {
    return this.code === "UNAUTHORIZED"
  }
  get isForbidden() {
    return this.code === "FORBIDDEN"
  }
  get isNotFound() {
    return this.code === "NOT_FOUND"
  }
  get isValidation() {
    return this.code === "VALIDATION"
  }
  get isServer() {
    return this.code === "SERVER"
  }
}
