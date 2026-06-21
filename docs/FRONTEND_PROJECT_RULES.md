# PathFinder Admin Frontend Project Rules

## Stack and source of truth

- React 18, TypeScript, Vite 6, React Router 7, Tailwind CSS 4, Radix-style shared UI.
- HTTP via Axios (`src/core/api`); state via Redux Toolkit (`src/app/store`).
- The sibling `PathFinder-Backend` repository is the API source of truth.
- Base API prefix: `/api/v1`. Known backend exceptions (for example chat under
  `/api/chat`) must be documented rather than silently encoded.
- Backend success envelope: `{ success, message, data, meta? }`.

## Architecture boundaries

- `app`: bootstrap, providers, router, layouts only.
- `core`: framework-level configuration, network, storage, auth infrastructure.
- `features`: code owned by a business capability.
- `shared`: generic components and helpers with no feature knowledge.

Pages coordinate UI state; they do not know base URLs, storage keys, or raw response envelopes. Data modules call the Axios layer (`apiRequest`/`http` from `@/core/api`), domain modules define stable types/contracts, and application modules orchestrate feature behavior with Redux Toolkit slices.

## State management

- State lives in Redux Toolkit slices in each feature's `application` layer; the store is configured in `src/app/store`.
- Use `createAsyncThunk` for async flows, calling the feature `data` layer (never HTTP directly).
- Read state with typed `useAppSelector`/`useAppDispatch`; expose a facade hook (like `useAuth`) to presentation.

## Authentication and security

- Login uses `POST /api/v1/auth/login` and backend-issued JWTs through the `auth` Redux slice.
- Admin access is checked from the JWT role for navigation UX; the backend remains responsible for real authorization.
- Tokens are cleared on logout and HTTP 401. "Remember me" selects local storage; otherwise session storage is used.
- Never expose `JWT_SECRET`, Gemini keys, Supabase service-role keys, or database credentials in `VITE_*` variables.
- Do not treat client route guards as security controls.

## API integration

- Add endpoint constants before adding calls.
- All HTTP goes through the Axios layer in `@/core/api`; never call `fetch`/`axios` directly in features.
- Type request/response payloads. Map backend DTOs when UI naming differs.
- Cross-cutting HTTP behavior is registered as Axios interceptors in `axios-instance.ts`.
- `ApiError` is thrown for failed requests; show actionable, non-sensitive messages.
- Upload files with `FormData`; the client drops the JSON content type for them.
- Add loading, empty, error, and retry states before replacing a feature's mock data.
- Do not connect a mock screen to an endpoint whose admin semantics or authorization are not implemented.

## UI and routing

- Two shared layers: `src/shared/components/ui` (primitives) and `src/shared/components/custom` (composed reusable components). Reuse them and existing CSS design tokens.
- Feature-owned, non-reusable components stay with the feature; reusable ones move to `shared/custom`.
- Register routes centrally and protect admin routes through `ProtectedRoute`.
- Keep pages keyboard-accessible and associate labels with inputs.

## Verification and GitHub

- Required check: `npm run check`.
- Keep `.env.example` current without real values.
- CI must use `npm ci`, typecheck, and production build.
- Commit `package-lock.json`; do not commit `node_modules`, `dist`, logs, or secrets.

## Deeper references

For full detail, see the skill references: `project-overview.md`, `frontend-rules.md`, `feature-map.md`, `architecture.md`, and `api-integration.md` under `.agents/skills/pathfinder-frontend-engineer/references/`.
