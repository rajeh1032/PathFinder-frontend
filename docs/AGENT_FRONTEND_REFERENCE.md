# Agent Frontend Reference

## Integration map

| Frontend feature | Backend base | Current integration |
| --- | --- | --- |
| auth | `/api/v1/auth` | Login connected; admin role required |
| users | `/api/v1/users` | UI currently demo-backed |
| skills | `/api/v1/skills` | Full admin CRUD: read (list + detail with usage counts), create (`POST`), update (`PATCH /:id`), delete (`DELETE /:id`, 409 when referenced) |
| CV analyses | `/api/v1/cvs` | Admin list + detail connected (`GET /cvs`, `GET /cvs/:id`, admin-gated) |
| RAG documents | `/api/v1/rag` | UI currently demo-backed |
| roadmaps | `/api/v1/roadmaps` | UI currently demo-backed |
| courses | `/api/v1/courses` | Full admin management: read (list + detail), create via import wizard (preview/AI analysis/confirm), edit (`PATCH /:id`), delete (`DELETE /:id`) |
| jobs | `/api/v1/jobs`, `/api/v1/job-matches` | `JobsList` read wired to real `GET /jobs` (public, paginated). No admin write endpoint exists, so create/edit/delete/toggle are local only. `JobMatches` wired to a new admin cross-user endpoint `GET /job-matches/admin` (+ `/admin/:id`, admin-gated, joins users + jobs) added to the backend `jobMatches` module; shows every user's matches. Notify/remove are local only |
| interviews | `/api/v1/interviews` | UI currently demo-backed |
| cover letters | `/api/v1/cover-letters` | UI exists but is not routed yet |
| AI/admin analytics/settings | not consistently exposed | Do not fabricate endpoints |

## Backend contract caveats

- Several backend list routes authenticate users but may not yet enforce admin authorization; confirm before exposing destructive actions.
- Chat has a historical `/api/chat` prefix while product modules use `/api/v1`; do not normalize this from the frontend without a backend decision.
- Login returns `{ user, accessToken, refreshToken }` inside the standard `data` envelope. Role is currently present in the signed JWT, not the returned user object.
- The frontend must never access Supabase directly.

## Migration workflow for a mock feature

1. Inspect its backend route, schema, controller response, and authorization.
2. Add domain types and a repository contract if business behavior warrants one.
3. Implement calls in `data` using the central client and endpoint map.
4. Add an application hook/provider for orchestration and cancellation.
5. Replace local arrays in presentation while preserving loading/error/empty states.
6. Verify the real backend locally, then run `npm run check`.

## Deeper references

For per-feature routed/integration status see `feature-map.md`; for the API client and endpoint map see `api-integration.md`, both under `.agents/skills/pathfinder-frontend-engineer/references/`.
