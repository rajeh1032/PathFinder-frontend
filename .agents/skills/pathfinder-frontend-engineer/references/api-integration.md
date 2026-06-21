# API Integration Reference

This document records how the frontend talks to the PathFinder backend. The
sibling `PathFinder-Backend` repository is the contract source of truth; verify
every path, method, payload, and authorization there before coding.

## Files in `src/core/api`

| File | Responsibility |
| --- | --- |
| `http.constants.ts` | `HttpMethod`, `HttpStatus`, `HttpHeader`, `ContentType`, `SESSION_EXPIRED_EVENT`. |
| `api-error.ts` | `ApiError` failure class + `ApiErrorCode` classification. |
| `axios-instance.ts` | Configured Axios instance + request/response interceptors. |
| `api-client.ts` | `apiRequest`, the `http` verb helpers, re-exports. |
| `api-endpoints.ts` | `apiEndpoints` path map + `chatApiBaseUrl`. |
| `index.ts` | Barrel re-export of the public API surface. |

Import from `@/core/api` (barrel) or the specific module. Auth storage lives in
`@/core/auth/auth-storage`; config in `@/core/config/env`.

## Configuration

`src/core/config/env.ts` reads public Vite variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api/v1` | API base; trailing slash stripped |
| `VITE_APP_NAME` | `PathFinder AI Admin` | App display name |
| `VITE_API_TIMEOUT_MS` | `15000` | Default per-request abort timeout |

`env.serverOrigin` is derived by stripping a trailing `/api/v<n>` from the base,
so non-versioned routes (chat) can be reached. Only public configuration belongs
in `VITE_*`. Never place secrets there.

## The API client

The HTTP layer is built on **Axios**. `axios-instance.ts` creates a configured
instance (`baseURL`, `timeout`, JSON default header) and attaches interceptors;
`createApiInstance(baseUrl)` builds extra instances when needed.

`apiRequest<T>(path, options)` calls the instance and returns the unwrapped
`data` field as `T`. Options:

- `method`: `HttpMethod` (default `GET`).
- `body`: sent as the Axios `data` (JSON, or `FormData` for uploads).
- `query`: sent as Axios `params`.
- `headers`: extra request headers.
- `authenticated`: attach the bearer token (default `true`; `false` for public).
- `baseUrl`: override the instance `baseURL` (use `chatApiBaseUrl` for chat).
- `timeoutMs`: override the timeout; `signal` to cancel.

Verb helpers wrap it: `http.get`, `http.post`, `http.put`, `http.patch`,
`http.delete`.

```ts
import { http, apiEndpoints } from "@/core/api"

const users = await http.get<UserDto[]>(apiEndpoints.users.list, { query: { page: 1 } })
const created = await http.post<UserDto>(apiEndpoints.users.list, payload)
```

## Interceptors

Interceptors are Axios-native, registered in `axios-instance.ts`:

- Request: attach `Authorization: Bearer <token>` from auth storage when the
  request is authenticated, and drop the JSON `Content-Type` for `FormData` so
  the browser sets the multipart boundary.
- Response (error): map every Axios failure to `ApiError`; on `401`, clear auth
  storage and dispatch `pathfinder:session-expired`.

To add cross-cutting behavior, register more interceptors on `apiInstance`
(`apiInstance.interceptors.request.use(...)`).

## Failure class

Every failure throws an `ApiError` with:

- `message`: safe, displayable message.
- `status`: HTTP status (`0` network failure, `408` timeout).
- `code`: `ApiErrorCode` (`NETWORK`, `TIMEOUT`, `VALIDATION`, `UNAUTHORIZED`,
  `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMIT`, `SERVER`, `UNKNOWN`).
- `details`: backend `details`/`errors` payload when present.
- Boolean getters: `isNetworkError`, `isTimeout`, `isUnauthorized`, `isForbidden`,
  `isNotFound`, `isValidation`, `isServer`.

Catch `ApiError` in application hooks/pages and show actionable, non-sensitive
messages. Never surface raw stack traces, tokens, or backend internals.

## Endpoint map

`api-endpoints.ts` mirrors mounted backend routes (verified against the backend
route files). All paths are relative to `env.apiBaseUrl` (`/api/v1`) except chat.

| Group | Keys |
| --- | --- |
| `auth` | `register`, `login`, `me`, `profile`, `changePassword` |
| `users` | `list`, `me`, `byId`, `activate`, `deactivate` |
| `skills` | `root`, `byId` |
| `cvs` | `analyze`, `latestAnalysis`, `status`, `list`, `byId` |
| `rag` | `documents`, `upload`, `byId` |
| `roadmaps` | `generate`, `me`, `byId`, `stepProgress` |
| `courses` | `root`, `importPreview`, `importConfirm`, `recommended`, `saved`, `enrollments`, `byId`, `save`, `enroll`, `enrollment` |
| `interviews` | `careerPaths`, `sessions`, `sessionById`, `sessionQuestions`, `answerQuestion`, `skipQuestion`, `finishSession`, `sessionResult`, `cancelSession`, `adminSessions`, `adminSessionById` |
| `jobs` | `root`, `matched`, `sync`, `saved`, `applied`, `appliedStatus`, `byId`, `save`, `apply` |
| `jobMatches` | `root`, `generate`, `byId` |
| `coverLetters` | `root`, `generate`, `byId`, `versions`, `export` |
| `chat` | `sessions`, `sendMessage`, `sessionMessages`, `deleteSession` (use `baseUrl: chatApiBaseUrl`) |

Admin-only backend routes (require `authorize('admin')`): `users.activate`,
`users.deactivate`, `users.byId` (PATCH), `skills.root` (POST), `skills.byId`
(PATCH/DELETE), `cvs.list`, `cvs.byId`,
`courses.importPreview`, `courses.importConfirm`, `interviews.adminSessions`,
`interviews.adminSessionById`.
The CV admin read endpoints (`GET /cvs`, `GET /cvs/:id`) were added to the
backend `cvs` module and join `cv_analyses -> cvs -> users`; they are consumed
by the `cv-analyses` data layer.

## Response envelope and meta

`apiRequest` returns only `data`. If a feature needs `meta` (for example
pagination), read it deliberately rather than re-parsing in a page; extend the
client if a feature genuinely needs the full envelope.

## Auth flow

- `features/auth/data/auth.api.ts` calls `http.post(auth.login, ..., { authenticated: false })`.
- The Redux `auth` slice (`features/auth/application/auth.slice.ts`) owns auth
  state. The `login` async thunk decodes the JWT, reads `role`, rejects unless
  `role === "admin"`, persists tokens, and stores the admin.
- Presentation uses the `useAuth()` hook (`features/auth/application/useAuth.ts`),
  a thin facade over the store exposing `user`, `isAuthenticated`, `isLoading`,
  `error`, `login`, and `logout`.
- Tokens persist via `src/core/auth/auth-storage.ts`: "remember me" uses
  `localStorage`, otherwise `sessionStorage`. Keys are prefixed `pathfinder.admin.*`.
- On `401` the Axios interceptor dispatches `pathfinder:session-expired`; `App`
  bridges that DOM event into the store via the `sessionExpired` action.
- Login response shape: `{ user, accessToken, refreshToken }` inside the standard
  `data` envelope. Role currently lives in the signed JWT, not in `user`.

## File uploads

- Build a `FormData` body and pass it as `body`; the client skips the JSON
  `Content-Type` so the browser sets the multipart boundary.
- Backend upload field name is `file` for both `cvs.analyze` (PDF, <=10MB) and
  `rag.upload` (PDF, <=20MB). Confirm limits before relying on them.

## Backend contract caveats

- The backend mounts `chat` under `/api/chat` and `interviews` under both
  `/api/interviews` and `/api/v1/interviews`. The endpoint map uses `/api/v1` for
  interviews and `chatApiBaseUrl` for chat. Do not normalize from the frontend
  without a backend decision.
- `rag` document routes currently bypass auth on the backend (temporary).
- Several list routes authenticate users but may not enforce admin authorization;
  confirm before exposing destructive admin actions.
- The frontend must never access Supabase directly.

## Needs confirmation

- Which list/detail/write endpoints enforce admin authorization.
- Whether dashboard, analytics, settings, and AI cost screens have real endpoints.
- Final pagination/meta shape expected by list screens.

## Source files inspected

- `src/core/config/env.ts`
- `src/core/api/*`
- `src/features/auth/data/auth.api.ts`
- `src/features/auth/application/AuthProvider.tsx`
- PathFinder-Backend route files: `auth`, `users`, `cvs`, `rag`, `roadmaps`,
  `courses`, `interviews`, `chat`, `jobs`, `jobMatches`, `coverLetters`
