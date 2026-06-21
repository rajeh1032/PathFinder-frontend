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
| `/skills` | `SkillsManagement` | skills | Real (admin CRUD wired) |
| `/courses` | `Courses` | courses | Real (admin list/detail wired) |
| `/roadmaps` | `Roadmaps` | roadmaps | Demo data |
| `/jobs` | `JobsList` | jobs | Demo data |
| `/job-matches` | `JobMatches` | jobs | Demo data |
| `/cv-analyses` | `CvAnalyses` | cv-analyses | Real (admin list wired) |
| `/cv-analyses/:id` | `CvAnalysisDetails` | cv-analyses | Real (admin detail wired) |
| `/interview-sessions` | `InterviewSessions` | interviews | Demo data |
| `/interview-sessions/:id` | `InterviewDetails` | interviews | Demo data |
| `/ai-logs` | `AiLogs` | ai-operations | Demo data |
| `/rag-documents` | `RagDocuments` | rag | Real (list/upload/delete wired) |
| `/rag-documents/upload` | `UploadRagDocument` | rag | Real (upload wired) |
| `/settings` | `SystemSettings` | settings | Demo data |
| `*` | redirect to `/` | - | Catch-all |

## Feature details

| Feature | Layers present | Pages | Routed | Likely backend base | Notes |
| --- | --- | --- | --- | --- | --- |
| `auth` | data, domain, application, presentation | `AdminLogin`, `NoPermission` | `AdminLogin` only | `/api/v1/auth` | Only fully layered feature. Redux `auth.slice` + `useAuth`; `login` wired; `me`/`change-password` mapped but unused. `NoPermission` not routed. |
| `dashboard` | presentation | `Dashboard` | Yes | dashboard metrics (unconfirmed) | Demo metrics; no confirmed backend endpoint. |
| `users` | presentation | `UsersList`, `UserDetails` | Yes | `/api/v1/users` | Demo data. Backend list authenticates; confirm admin authorization before write actions. |
| `career-paths` | data, domain, application, presentation | `CareerPaths`, `CareerPathEdit` | Yes | `/api/v1/interviews/career-paths` | List (read) wired to the real backend endpoint (`authenticate`, active paths only, fields `id`/`title`/`category`/`difficulty_level`). Create/edit/delete/toggle remain local previews; no admin CRUD endpoint exists in the backend. |
| `skills` | data, domain, application, presentation | `SkillsManagement` | Yes | `/api/v1/skills` | Full admin management wired to the real backend. The backend `skills` module was implemented (route -> controller -> service -> repository -> Joi schema) and mounted in `server.js`. Read: list (`GET /skills`, paginated, `q`/`category`/`level`/`isActive`/`sort` server-side) + detail (`GET /skills/:id`, returns usage counts) via `skillsApi` + `skills.slice` + `useSkills`. Write (admin): create (`POST /skills`), update (`PATCH /skills/:id`), delete (`DELETE /skills/:id`). Maps `skills` table (`aliases` is `text[]`, converted to/from a comma string in the form). Delete returns 409 when the skill is still referenced (deactivate instead). |
| `courses` | data, domain, application, presentation | `Courses` | Yes | `/api/v1/courses` | Full admin management wired to the real backend. Read: list (`GET /courses`, paginated, `q`/`sort` server-side) + detail via `coursesApi` + `courses.slice` + `useCourses`. Create: MaharaTech import wizard (`POST /courses/import/preview` -> AI analysis review -> `POST /courses/import/confirm`) via `useCourseImport` + `ImportCourseDialog`. Edit: `PATCH /courses/:id` (admin) via `EditCourseDialog`. Delete: `DELETE /courses/:id` (admin, DB cascades dependents) via `ConfirmDeleteDialog`. List/detail return only `is_active=true` AND `analysis_status='approved'` rows. |
| `roadmaps` | presentation | `Roadmaps` | Yes | `/api/v1/roadmaps` | Demo data; backend roadmaps are user-scoped, admin views unconfirmed. |
| `jobs` | presentation | `JobsList`, `JobMatches` | Yes | `/api/v1/jobs`, `/api/v1/job-matches` | Demo data. Backend `jobs`/`jobMatches` modules are empty scaffolds. |
| `cv-analyses` | data, domain, application, presentation | `CvAnalyses`, `CvAnalysisDetails` | Yes | `/api/v1/cvs` | Wired to the real backend admin read endpoints. List (`GET /cvs`) and detail (`GET /cvs/:id`) are admin-gated (`authenticate` + `authorize('admin')`), joining `cv_analyses -> cvs -> users`. Read-only: no admin create/update/delete/reprocess endpoint exists, so the old delete/retry/CSV-of-mock actions were removed (CSV export now exports real rows). The user-scoped `analyze`/`me/latest-analysis`/`me/status` routes remain unused by admin. |
| `interviews` | presentation | `InterviewSessions`, `InterviewDetails` | Yes | `/api/v1/interviews` | Demo data; admin session listing unconfirmed. |
| `ai-operations` | presentation | `AiLogs`, `AiCost`, `ChatSessions` | `AiLogs` only | AI logs/chat (unconfirmed) | Demo data; `AiCost` and `ChatSessions` not routed. |
| `rag` | data, domain, application, presentation | `RagDocuments`, `UploadRagDocument` | Yes | `/api/v1/rag` | Wired to the real backend. List/upload(PDF)/soft-delete via `ragApi` + `rag.slice` + `useRagDocuments`. Backend allows one active doc per `type` (409 on conflict); delete is soft (`is_active=false`). Backend `create` (manual text) and `PATCH` exist but are not consumed yet. RAG routes currently bypass auth (temporary). |
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

`src/core/api/api-endpoints.ts` declares paths for `auth`, `users`, `dashboard`,
`skills`, `cvs`, `rag`, `roadmaps`, `courses`, `interviews`, `jobs`, `jobMatches`,
`coverLetters`, and `chat` (chat via `chatApiBaseUrl`), verified against the
backend route files. Data layers currently consume: `auth.login`
(`features/auth/data/auth.api.ts`),
`users.*` (`features/users/data/users.api.ts`), `dashboard.overview`
(`features/dashboard/data/dashboard.api.ts`), `skills.*`
(`features/skills/data/skills.api.ts`: list/detail/create/update/delete),
`interviews.careerPaths`
(`features/career-paths/data/career-paths.api.ts`, read-only list),
`courses.root`/`courses.byId` (`features/courses/data/courses.api.ts`,
read-only list + detail), and
`rag.*` (`features/rag/data/rag.api.ts`: list/upload/delete). Adding a new
call requires adding/confirming the endpoint constant first. See
`api-integration.md` for the full key list and the client/interceptor/error
details.

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
