# Feature Map

This map distinguishes current runtime wiring from demo/placeholder UI. Page
existence does not mean a backend integration exists.

## Routes mounted in `src/app/router.tsx`

All routes except `/login` render inside `ProtectedRoute` + `AdminLayout`.

| Path | Page component | Feature | Status |
| --- | --- | --- | --- |
| `/login` | `AdminLogin` | auth | Real login wired to backend |
| `/` | `Dashboard` | dashboard | Demo data |
| `/users` | `UsersList` | users | Demo data |
| `/users/:id` | `UserDetails` | users | Demo data |
| `/career-paths` | `CareerPaths` | career-paths | Demo data |
| `/career-paths/:id/edit` | `CareerPathEdit` | career-paths | Demo data |
| `/skills` | `SkillsManagement` | skills | Demo data |
| `/courses` | `Courses` | courses | Demo data |
| `/roadmaps` | `Roadmaps` | roadmaps | Demo data |
| `/jobs` | `JobsList` | jobs | Demo data |
| `/job-matches` | `JobMatches` | jobs | Demo data |
| `/cv-analyses` | `CvAnalyses` | cv-analyses | Demo data |
| `/cv-analyses/:id` | `CvAnalysisDetails` | cv-analyses | Demo data |
| `/interview-sessions` | `InterviewSessions` | interviews | Demo data |
| `/interview-sessions/:id` | `InterviewDetails` | interviews | Demo data |
| `/ai-logs` | `AiLogs` | ai-operations | Demo data |
| `/rag-documents` | `RagDocuments` | rag | Demo data |
| `/rag-documents/upload` | `UploadRagDocument` | rag | Demo data |
| `/settings` | `SystemSettings` | settings | Demo data |
| `*` | redirect to `/` | - | Catch-all |

## Feature details

| Feature | Layers present | Pages | Routed | Likely backend base | Notes |
| --- | --- | --- | --- | --- | --- |
| `auth` | data, domain, application, presentation | `AdminLogin`, `NoPermission` | `AdminLogin` only | `/api/v1/auth` | Only fully layered feature. Redux `auth.slice` + `useAuth`; `login` wired; `me`/`change-password` mapped but unused. `NoPermission` not routed. |
| `dashboard` | presentation | `Dashboard` | Yes | dashboard metrics (unconfirmed) | Demo metrics; no confirmed backend endpoint. |
| `users` | presentation | `UsersList`, `UserDetails` | Yes | `/api/v1/users` | Demo data. Backend list authenticates; confirm admin authorization before write actions. |
| `career-paths` | presentation | `CareerPaths`, `CareerPathEdit` | Yes | `/api/v1/interviews/career-paths` or dedicated route (unconfirmed) | Demo data; admin CRUD not confirmed in backend. |
| `skills` | presentation | `SkillsManagement` | Yes | `/api/v1/skills` | Demo data. Backend `skills` module is an empty scaffold. |
| `courses` | presentation | `Courses` | Yes | `/api/v1/courses` | Demo data; backend has import/recommend endpoints. |
| `roadmaps` | presentation | `Roadmaps` | Yes | `/api/v1/roadmaps` | Demo data; backend roadmaps are user-scoped, admin views unconfirmed. |
| `jobs` | presentation | `JobsList`, `JobMatches` | Yes | `/api/v1/jobs`, `/api/v1/job-matches` | Demo data. Backend `jobs`/`jobMatches` modules are empty scaffolds. |
| `cv-analyses` | presentation | `CvAnalyses`, `CvAnalysisDetails` | Yes | `/api/v1/cvs` | Demo data; backend CV routes are user-scoped. |
| `interviews` | presentation | `InterviewSessions`, `InterviewDetails` | Yes | `/api/v1/interviews` | Demo data; admin session listing unconfirmed. |
| `ai-operations` | presentation | `AiLogs`, `AiCost`, `ChatSessions` | `AiLogs` only | AI logs/chat (unconfirmed) | Demo data; `AiCost` and `ChatSessions` not routed. |
| `rag` | presentation | `RagDocuments`, `UploadRagDocument` | Yes | `/api/v1/rag` | Demo data; backend RAG routes currently bypass auth (temporary). |
| `settings` | presentation | `SystemSettings` | Yes | system settings (unconfirmed) | Demo data. |
| `analytics` | presentation | `Analytics` | No | analytics (unconfirmed) | Page exists, not routed. |
| `integrations` | presentation | `ApiHealth`, `ApiSources`, `ApiSyncRuns` | No | api sources/sync runs (unconfirmed) | Pages exist, not routed. |
| `admin-management` | presentation | `AdminsManagement`, `RolesPermissions` | No | admin/roles (unconfirmed) | Pages exist, not routed. Conflicts with single-admin model. |
| `activity-logs` | presentation | `ActivityLogs` | No | activity logs (unconfirmed) | Page exists, not routed. |
| `cover-letters` | presentation | `CoverLetters` | No | `/api/v1/cover-letters` | Page exists, not routed. Backend `coverLetters` module is empty. |
| `notifications` | presentation | `Notifications` | No | `notification_settings` (unconfirmed) | Page exists, not routed. |
| `profile` | presentation | `Profile` | No | `/api/v1/users/me` (unconfirmed) | Page exists, not routed. |
| `videos` | presentation | `Videos` | No | none confirmed | Page exists, not routed. |
| `shared` | presentation | none | - | - | Empty placeholder folder. |

## App shell and infrastructure

| Area | Files | Purpose |
| --- | --- | --- |
| Bootstrap | `src/main.tsx`, `src/app/App.tsx` | Mount React, wrap in Redux `Provider`, render router + `Toaster`, bridge session-expiry event. |
| Routing | `src/app/router.tsx` | Central route composition with lazy imports. |
| Store | `src/app/store/store.ts`, `hooks.ts` | Redux Toolkit store + typed hooks. |
| Layout | `src/app/layout/AdminLayout.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `MaintenanceBanner.tsx`, `SessionExpiredModal.tsx` | Admin shell; listens for `pathfinder:session-expired`. |
| Env config | `src/core/config/env.ts` | `apiBaseUrl`, `serverOrigin`, `appName`, `requestTimeoutMs`. |
| API client | `src/core/api/*` | Axios instance, `apiRequest`/`http`, `ApiError`, endpoint map. |
| Auth | `src/core/auth/auth-storage.ts`, `jwt.ts` | Token/user persistence; JWT role decode. |
| Shared UI | `src/shared/components/ui/*` | Radix/shadcn-style primitives. |
| Custom UI | `src/shared/components/custom/*` | Composed reusable components. |
| Shared helpers | `src/shared/lib/csv.ts`, `permissions.tsx` | CSV export; pass-through permissions (RBAC removed). |
| Shared pages | `src/shared/pages/PlaceholderPage.tsx` | Generic placeholder. |

## Endpoint map vs usage

`src/core/api/api-endpoints.ts` declares paths for `auth`, `users`, `cvs`, `rag`,
`roadmaps`, `courses`, `interviews`, `jobs`, `jobMatches`, `coverLetters`, and
`chat` (chat via `chatApiBaseUrl`), verified against the backend route files.
Only `auth.login` is currently consumed by a data layer
(`features/auth/data/auth.api.ts`). Adding a new call requires adding/confirming
the endpoint constant first. See `api-integration.md` for the full key list and
the client/interceptor/error details.

## Sidebar navigation

`src/app/layout/Sidebar.tsx` groups links into: Dashboard, Students (Users),
Career Management (Career Paths, Skills, Courses), Jobs (Jobs, Job Matches),
AI Features (CV Analyses, Interview Sessions, AI Logs), Knowledge Base
(RAG Documents), and System (Settings). The sidebar exposes a subset of routed
pages; unrouted feature pages are not linked.

## Missing or inconsistent patterns

- Only `auth` has data/domain/application layers; every other feature is
  presentation-only.
- Multiple pages (analytics, integrations, admin-management, activity-logs,
  cover-letters, notifications, profile, videos, AI cost/chat) are not routed.
- `admin-management` (`AdminsManagement`, `RolesPermissions`) conflicts with the
  current single-admin model in `src/shared/lib/permissions.tsx`.
- Endpoint constants exist for features that have no data layer yet.
- The frontend uses `/api/v1` everywhere; the backend mounts `chat` under
  `/api/chat` and `interviews` under both prefixes. Do not normalize from the
  frontend without a backend decision.

## Source files inspected

- `src/app/router.tsx`, `src/app/layout/*`
- `src/core/api/*`, `src/core/auth/*`, `src/core/config/env.ts`
- all `src/features/*/presentation/pages/*`
- `src/features/auth/*`
- `src/shared/components/*`, `src/shared/lib/*`
