/** HTTP verbs used by the API client. */
export const HttpMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod]

/**
 * HTTP status codes the client cares about, plus two synthetic codes for
 * client-side failures that never reach the network (`NETWORK_ERROR`) or that
 * abort before a response (`REQUEST_TIMEOUT`).
 */
export const HttpStatus = {
  NETWORK_ERROR: 0,
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const HttpHeader = {
  AUTHORIZATION: "Authorization",
  CONTENT_TYPE: "Content-Type",
} as const

export const ContentType = {
  JSON: "application/json",
} as const

/** Window event dispatched when the API client detects an expired/invalid session. */
export const SESSION_EXPIRED_EVENT = "pathfinder:session-expired"
