# PathFinder Frontend Agent Rules

This repository is the React/TypeScript admin console for PathFinder AI. Read this file before changing code.

## Required context

1. Read `.agents/skills/pathfinder-frontend-engineer/SKILL.md`.
2. Read the skill references in order: `references/project-overview.md`, `references/frontend-rules.md`, `references/feature-map.md`, `references/architecture.md`, `references/api-integration.md`.
3. Read `docs/FRONTEND_PROJECT_RULES.md` and `docs/AGENT_FRONTEND_REFERENCE.md`.
4. Inspect the target feature and the matching backend module in `../PathFinder-Backend/src/modules`.
5. Check `git status --short` and preserve unrelated work.

## Non-negotiable rules

- Use feature-first Clean Architecture under `src/features/<feature>`.
- Dependency direction is `presentation -> application/domain <- data`; domain types must not import React or browser APIs.
- Route composition belongs in `src/app/router.tsx`; reusable UI belongs in `src/shared`.
- All HTTP calls go through `src/core/api` (Axios layer). Do not call `fetch`/`axios` from pages.
- Feature state uses Redux Toolkit slices in the feature `application` layer; the store is in `src/app/store`.
- Reusable UI lives in `src/shared/components`: `ui/` primitives and `custom/` composed components.
- API paths come from `src/core/api/api-endpoints.ts` and must match mounted backend routes.
- Backend JWT auth is canonical. Never add Supabase clients or service-role credentials to the browser.
- Do not invent endpoints, response fields, roles, or database columns. Verify them in the backend first.
- Keep backend response envelopes and errors normalized in the API layer.
- Use environment variables for deploy-specific public values. Never commit `.env`.
- Preserve the current design tokens and shared components before introducing new UI primitives.
- Run `npm run check` before handoff.

## Feature shape

```text
src/features/<feature>/
  data/            API implementations and DTO mapping
  domain/          entities, contracts, feature types
  application/     providers, hooks, and use-case orchestration
  presentation/    pages and feature-owned components
```

Only create layers a feature currently needs. Keep mock data clearly marked and replace it through the data layer when a real backend contract exists.
