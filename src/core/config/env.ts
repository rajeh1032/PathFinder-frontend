const defaultApiBaseUrl = "http://localhost:5000/api/v1"

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "")
}

/** Strip a trailing `/api/v<n>` so callers can reach non-versioned routes (for example `/api/chat`). */
function deriveServerOrigin(apiBaseUrl: string): string {
  return apiBaseUrl.replace(/\/api\/v\d+$/, "")
}

const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl)

export const env = {
  apiBaseUrl,
  serverOrigin: deriveServerOrigin(apiBaseUrl),
  appName: import.meta.env.VITE_APP_NAME || "PathFinder AI Admin",
  requestTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS || 15_000),
} as const
