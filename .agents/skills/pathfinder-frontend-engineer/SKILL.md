---
name: pathfinder-frontend-engineer
description: Use this skill when working on the PathFinder Admin React/TypeScript console - features, Clean Architecture layers, backend API integration, authentication, routing, shared UI, and frontend documentation.
---

# PathFinder Frontend Engineer

Use this skill for any PathFinder Admin frontend task involving React/TypeScript
screens, feature-first Clean Architecture, backend API integration, JWT auth,
routing, shared UI, or frontend documentation.

## Required reading order

Before coding, read:

1. `AGENTS.md`
2. `.agents/skills/pathfinder-frontend-engineer/references/project-overview.md`
3. `.agents/skills/pathfinder-frontend-engineer/references/frontend-rules.md`
4. `.agents/skills/pathfinder-frontend-engineer/references/feature-map.md`
5. `.agents/skills/pathfinder-frontend-engineer/references/architecture.md`
6. `.agents/skills/pathfinder-frontend-engineer/references/api-integration.md`
7. `docs/FRONTEND_PROJECT_RULES.md` and `docs/AGENT_FRONTEND_REFERENCE.md`
8. The target feature files under `src/features/<feature>/`
9. The matching backend module under `../PathFinder-Backend/src/modules/<module>/`

When the task is documentation-only, read the same references and update docs
without editing runtime source.

## Current architecture to follow

The app is React 18 + TypeScript + Vite, organized feature-first:

```text
src/app/        bootstrap, providers, router, admin layout
src/core/       env config, API client, auth storage (infrastructure)
src/features/   business features (data / domain / application / presentation)
src/shared/     generic UI, helpers, and pages with no feature knowledge
src/styles/     global styles and design tokens
```

Dependency direction inside a feature:

```text
presentation -> application -> domain <- data
```

Domain types must not import React or browser APIs. Pages never call `fetch`;
all HTTP goes through the Axios layer in `src/core/api` using paths from
`src/core/api/api-endpoints.ts`. Feature state lives in Redux Toolkit slices in
the feature's `application` layer; the store is in `src/app/store`. Compose
routes only in `src/app/router.tsx`. Reusable UI lives in
`src/shared/components` split into `ui/` (primitives) and `custom/` (composed).

## Current implementation reality

- Only the `auth` feature is fully layered (data/domain/application/presentation)
  and wired to the real backend (`POST /auth/login`).
- Every other feature is presentation-only and demo-backed with local mock data.
- Several feature pages exist but are not registered in the router yet.
- Confirm whether a screen is real, partially connected, or demo-backed before
  changing it. See `references/feature-map.md`.

## Feature work rules

- Put API calls and DTO mapping in `features/<feature>/data`.
- Put entities, contracts, and feature types in `features/<feature>/domain`.
- Put providers, hooks, and use-case orchestration in `features/<feature>/application`.
- Put pages and feature-owned components in `features/<feature>/presentation`.
- Only create the layers a feature currently needs; do not scaffold empty layers.
- Keep mock data clearly marked and replace it through the data layer once a real
  backend contract exists.

## API integration rules

- Add the path to `src/core/api/api-endpoints.ts` before adding a call.
- Use the Axios layer via `apiRequest<T>()`/`http` from `@/core/api`; it unwraps
  the `{ success, message, data, meta? }` envelope and throws `ApiError`.
- Register cross-cutting HTTP behavior as Axios interceptors in `axios-instance.ts`.
- Verify every path, method, payload, and authorization in the sibling backend
  before coding. Do not infer admin endpoints from screen names.
- Send uploads as `FormData`; the client drops the JSON `Content-Type` for them.
- Add loading, empty, error, and retry states (use `@/shared/components/custom`)
  before replacing mock data.

## State and UI rules

- Feature state lives in Redux Toolkit slices in the feature `application` layer;
  configure the store in `src/app/store`. Use `createAsyncThunk` calling the
  `data` layer, and expose a facade hook (like `useAuth`) to presentation.
- Reuse `src/shared/components/ui` primitives and `src/shared/components/custom`
  composed components and existing CSS design tokens before adding new ones.

## Auth and security rules

- Login uses backend-issued JWTs. Admin gating reads `role` from the JWT for UX
  only; the backend remains responsible for real authorization.
- "Remember me" stores tokens in `localStorage`; otherwise `sessionStorage`.
- A `401` clears the session and emits `pathfinder:session-expired`.
- Never expose `JWT_SECRET`, Gemini keys, Supabase service-role keys, or database
  credentials through `VITE_*` variables.
- Never add a Supabase client to the browser. Do not treat client route guards as
  security controls.

## UI and routing rules

- Reuse `src/shared/components/ui` and existing CSS design tokens before adding
  new primitives.
- Feature-owned components stay with the feature; promote to `src/shared` only
  when two real consumers exist.
- Register routes centrally in `src/app/router.tsx` and keep admin routes behind
  `ProtectedRoute`.
- Keep pages keyboard-accessible and label form inputs.

## Documentation and verification

- Run `npm run check` (typecheck + build) before handoff. There is no test runner
  or lint script configured; say so and use targeted verification when needed.
- Update env examples and these references when contracts or configuration change.
- Mark unverified backend behavior as "Needs confirmation" instead of guessing.

## Forbidden actions

- Do not call `fetch` from pages or hardcode base URLs, storage keys, or raw
  envelopes outside `core`.- Do not invent endpoints, response fields, roles, or database columns.
- Do not add Supabase clients or service-role credentials to the browser.
- Do not connect a mock screen to an endpoint whose admin semantics or
  authorization are not implemented in the backend.
- Do not import one feature from another feature.
