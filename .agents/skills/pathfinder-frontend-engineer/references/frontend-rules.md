# Frontend Rules

These rules are strict for future work in the PathFinder Admin frontend.

## Architecture rules

- Keep feature-first Clean Architecture under `src/features/<feature>`.
- Keep the dependency direction `presentation -> application -> domain <- data`.
- Keep domain types framework-independent: no React, no browser APIs, no `fetch`.
- Keep app composition (providers, router, layout) in `src/app`.
- Keep infrastructure (env, API client, auth storage) in `src/core`.
- Keep generic, feature-agnostic UI and helpers in `src/shared`.
- Do not add new top-level folders or layers unless the user asks for a refactor.
- Only create the layers a feature currently needs; do not scaffold empty layers.

## Coding style rules

- Match the existing TypeScript style and `@/...` path alias imports.
- Prefer functional components and hooks.
- Type request and response payloads; map backend DTOs when UI naming differs.
- Keep components focused; promote shared logic only when a second real consumer
  exists.
- Add comments only where a non-obvious block needs orientation.
- State management is Redux Toolkit; HTTP is Axios via `@/core/api`. Use the
  established stack rather than introducing a different one without approval.

## API integration rules

- All HTTP goes through `src/core/api` (Axios instance + `apiRequest`/`http`).
  Never call `fetch` or `axios` directly from pages, components, or hooks.
- Add the path to `src/core/api/api-endpoints.ts` before adding a call.
- Verify the path, method, payload, response shape, and authorization in the
  sibling backend before coding.
- Let the API layer unwrap the `{ success, message, data, meta? }` envelope and
  throw `ApiError`. Do not re-parse envelopes in pages.
- Register cross-cutting HTTP behavior as Axios interceptors in
  `axios-instance.ts`, not ad hoc in features.
- Send file uploads as `FormData`; the client drops the JSON `Content-Type` for
  them automatically.
- Add loading, empty, error, and retry states before replacing a feature's mock
  data with real calls (use the `custom` state components).

## State management rules

- Use Redux Toolkit. Configure reducers in `src/app/store/store.ts`.
- One slice per feature, in the feature's `application` layer
  (`<feature>.slice.ts`).
- Use `createAsyncThunk` for async flows; thunks call the feature `data` layer,
  never HTTP directly.
- Read state with the typed `useAppSelector`/`useAppDispatch` hooks, and expose a
  small facade hook (like `useAuth`) to presentation instead of raw store access.
- Keep slices serializable; do not store class instances, promises, or DOM nodes.

## UI and component rules

- Two component layers under `src/shared/components`: `ui/` for primitives,
  `custom/` for composed reusable components. Import custom ones from
  `@/shared/components/custom`.
- Reuse `ui` and `custom` components and existing CSS design tokens before adding
  new primitives or colors.
- Compose class names with `cn()` from `@/shared/components/ui/utils`.
- Register every route centrally in `src/app/router.tsx`.
- Keep admin routes behind `ProtectedRoute`.
- Keep feature-specific, non-reusable components inside the feature's
  `presentation` folder; promote to `shared/custom` only when reused.
- Keep pages keyboard-accessible and associate labels with inputs.

## Security rules

- Backend JWT auth is canonical; client guards are UX only, not security.
- Never expose `JWT_SECRET`, Gemini keys, Supabase keys, or database credentials
  through `VITE_*` variables or any browser code.
- Never add a Supabase client or service-role credential to the browser.
- Clear tokens on logout and on HTTP `401`.
- Do not log tokens, full auth payloads, or other sensitive values.
- Do not copy real `.env` values into docs, commits, or examples.

## Feature boundary rules

- A feature must not import another feature's internals.
- Share stable concepts through `src/shared` or `src/core`, not feature-to-feature.
- Cross-feature orchestration belongs in app composition or a shared module.
- Avoid circular imports between layers.

## Mock-to-real migration rules

- Confirm the backend route, schema, response, and authorization first.
- Add domain types and a repository contract when business behavior warrants one.
- Implement calls in `data` using the central client and endpoint map.
- Add an application hook/provider for orchestration and cancellation.
- Replace local arrays in presentation while preserving loading/error/empty states.
- Do not connect a mock screen to an endpoint whose admin semantics or
  authorization are not implemented in the backend.

## Testing and verification rules

- Run `npm run check` (typecheck + build) before claiming a change is complete.
- There is no test runner or lint script configured; state this and use targeted
  manual verification.
- Add tests only when the task asks for implementation or when risk justifies it.
- Report any backend blocker or verification gap explicitly.

## Documentation rules

- Update these references and `docs/*` when routes, endpoints, env vars, auth
  behavior, or feature ownership change.
- Mark uncertain backend behavior as "Needs confirmation" instead of guessing.
- Do not rewrite existing docs wholesale without an explicit request.

## Forbidden actions

- Do not invent endpoints, response fields, roles, or database columns.
- Do not call `fetch` outside the API client or hardcode base URLs/storage keys.
- Do not add Supabase clients or secrets to the browser.
- Do not treat client route guards as authorization.
- Do not import one feature from another.
- Do not reintroduce multi-role RBAC unless the user explicitly requests it; the
  current build is single-admin (`src/shared/lib/permissions.tsx` passes through).

## Review checklist

- Does the code live in the correct layer and feature?
- Is the dependency direction respected and domain framework-free?
- Does every HTTP call go through `apiRequest` with an endpoint constant?
- Was the backend contract and authorization verified?
- Are loading, empty, and error states handled?
- Are routes registered centrally and protected where needed?
- Are tokens and secrets handled safely?
- Did `npm run check` pass, or was the gap reported?
- Were docs updated if behavior changed?
