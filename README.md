# PathFinder AI Admin Frontend

React + TypeScript admin dashboard for the PathFinder AI graduation project. The app uses feature-first Clean Architecture and connects to the companion Node/Express backend through `/api/v1`.

## Quick start

Requirements: Node.js 20+ and the PathFinder Backend running on port `5000`.

```bash
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. The default API URL is `http://localhost:5000/api/v1`; override `VITE_API_BASE_URL` for staging or production.

## Commands

- `npm run dev` — local development.
- `npm run typecheck` — strict TypeScript check.
- `npm run build` — production build.
- `npm run check` — full local/CI verification.

## Architecture

```text
src/
  app/            application composition, router, and admin layout
  core/           API client, environment config, auth storage
  features/       business features (data/domain/application/presentation)
  shared/         reusable UI, helpers, and generic pages
  styles/         global styles and design tokens
```

New backend calls belong in `features/<feature>/data`; pages must not call `fetch` directly. Authentication is backend-owned JWT auth. Only public frontend configuration may use `VITE_*`; never expose backend secrets or Supabase service-role keys.

Most generated admin screens still contain demo datasets until their matching backend admin endpoints are available. Real authentication is wired now; migrate each feature behind its data/domain contracts incrementally.

See [AGENTS.md](AGENTS.md) and [docs/FRONTEND_PROJECT_RULES.md](docs/FRONTEND_PROJECT_RULES.md) before making architectural changes.

