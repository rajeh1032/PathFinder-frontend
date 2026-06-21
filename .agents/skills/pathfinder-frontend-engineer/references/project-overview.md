# PathFinder Frontend Project Overview

## What the project does

This repository is the admin console for PathFinder AI, an AI career mentor for
students, fresh graduates, ITI students, and career shifters. The console lets
administrators manage users, career content, jobs, AI-generated artifacts, and
system configuration for the product. It is a separate web client that talks to
the sibling `PathFinder-Backend` Node/Express API over HTTP.

## Main frontend responsibilities

- Render the admin dashboard and management screens for PathFinder data.
- Authenticate admins against the backend and gate admin-only UI.
- Call backend REST endpoints through a single typed API client.
- Normalize the backend response envelope and errors in the API layer.
- Keep feature code isolated under feature-first Clean Architecture.
- Present loading, empty, and error states for data-driven screens.
- Never hold privileged secrets; all Supabase and AI access stays server-side.

## Tech stack detected

Source of truth: `package.json`, `package-lock.json`, `vite.config.ts`,
`tsconfig.json`, and current source files.

| Area | Current repo state |
| --- | --- |
| Framework | React 18.3 |
| Language | TypeScript 5.7 (strict) |
| Build tool | Vite 6.3.5 |
| Routing | React Router 7.13 (`createBrowserRouter`, lazy routes) |
| Styling | Tailwind CSS 4.1 with CSS-variable design tokens |
| UI primitives | Radix UI (shadcn-style) in `src/shared/components/ui` |
| Custom components | Composed, reusable components in `src/shared/components/custom` |
| Extra UI libs | MUI, Recharts, lucide-react, sonner, motion, react-hook-form |
| HTTP | Axios (`src/core/api/axios-instance.ts`) wrapped by `api-client.ts` |
| State | Redux Toolkit + react-redux store in `src/app/store` |
| Auth | Redux `auth` slice; backend JWT in local/session storage |
| Tests | None configured |
| Lint | No lint script configured |
| Package manager | npm (lockfile committed); `pnpm-workspace.yaml` also present |
| Node | `>=20` |

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server (default `http://localhost:5173`) |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | `tsc --noEmit` strict type check |
| `npm run check` | `typecheck` then `build` - required before handoff |

## Implementation reality

The UI is broad but mostly demo-backed. Treat screen existence as UI scaffolding,
not as a working backend integration.

- `auth` is the only fully layered feature and the only real backend integration
  (admin login).
- All other features are presentation-only pages with local mock datasets.
- Several feature pages are not registered in the router yet.
- See `feature-map.md` for the per-feature routed/integration status.

## Backend as source of truth

The sibling `PathFinder-Backend` repository is the API source of truth.

- Base API prefix is `/api/v1`; known backend exceptions (for example the
  historical `/api/chat` prefix) must be documented, not silently encoded.
- Success envelope: `{ success, message, data, meta? }`.
- Backend auth is Node-owned JWT (`users.password_hash`), not Supabase Auth.
- Do not invent endpoints, fields, roles, or columns. Confirm them in the backend
  modules under `../PathFinder-Backend/src/modules/<module>/` first.

## Important docs and how to use them

| File | Use |
| --- | --- |
| `AGENTS.md` | Main agent instruction file and non-negotiable rules. |
| `.agents/skills/pathfinder-frontend-engineer/SKILL.md` | Skill entry point and reading order. |
| `references/project-overview.md` | This overview of purpose, stack, and state. |
| `references/frontend-rules.md` | Strict rules for frontend work. |
| `references/feature-map.md` | Per-feature files, routes, and integration status. |
| `references/architecture.md` | Layer boundaries, UI, routing, and design tokens. |
| `references/api-integration.md` | API client, endpoints, envelope, and auth flow. |
| `docs/FRONTEND_PROJECT_RULES.md` | Project rules summary for humans. |
| `docs/AGENT_FRONTEND_REFERENCE.md` | Integration map and mock-to-real workflow. |
| `src/imports/pasted_text/*` | Figma/design specs used to build the screens. |

## Source files inspected

- `package.json`, `.env.example`, `README.md`
- `src/main.tsx`, `src/app/App.tsx`, `src/app/router.tsx`, `src/app/layout/*`
- `src/core/config/env.ts`, `src/core/api/*`, `src/core/auth/auth-storage.ts`
- `src/features/auth/*` (all layers)
- `src/features/*/presentation/pages/*` (page inventory)
- `src/shared/components/*`, `src/shared/lib/*`, `src/shared/pages/*`

## Needs confirmation

- Whether unrouted feature pages (analytics, integrations, cover-letters,
  notifications, profile, videos, admin-management, activity-logs, AI cost/chat)
  should be wired into the router or removed.
- Which backend admin endpoints exist and enforce admin authorization before each
  demo screen is connected.
- Whether the single-admin model stays or multi-role RBAC returns.
