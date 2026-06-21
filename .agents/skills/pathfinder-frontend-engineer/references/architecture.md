# Architecture Reference

The frontend uses feature-first Clean Architecture. `app` composes, `core`
provides infrastructure, `features` own business behavior, and `shared` stays
generic.

## Top-level layout

```text
src/
  main.tsx          React entry point
  app/              bootstrap, providers, router, admin layout, store
    App.tsx         wraps Redux Provider + RouterProvider + Toaster
    router.tsx      central route composition (lazy imports)
    layout/         AdminLayout, Sidebar, TopBar, banners, modals
    store/          Redux Toolkit store + typed hooks
  core/             framework-level infrastructure
    api/            axios-instance.ts, api-client.ts, api-endpoints.ts, ...
    auth/           auth-storage.ts, jwt.ts
    config/         env.ts
  features/         business features, one folder each
    <feature>/
      data/         API implementations and DTO mapping
      domain/       entities, contracts, feature types
      application/  slices, hooks, use-case orchestration
      presentation/ pages and feature-owned components
  shared/           generic UI, helpers, and pages with no feature knowledge
    components/ui/      Radix/shadcn-style primitives (reusable)
    components/custom/  composed reusable components (PageHeader, DataState, ...)
    components/figma/
    lib/            csv.ts, permissions.tsx
    pages/          PlaceholderPage.tsx
  styles/           globals, theme tokens, tailwind, fonts
  imports/          pasted Figma/design specs
```

## Layer boundaries

| Layer | May import | Must not |
| --- | --- | --- |
| `presentation` | `application`, `domain`, `shared` UI, React Router | call `fetch`, hold base URLs/storage keys, parse raw envelopes |
| `application` | `domain`, `data`, `core` | render heavy UI; own DOM concerns |
| `data` | `domain`, `core/api`, `core/auth` | import `presentation` |
| `domain` | nothing framework-specific | import React, browser APIs, or `fetch` |

- Prefer alias imports (`@/...`) across boundaries.
- Avoid feature-to-feature imports; share stable concepts via `shared`/`core`
  only when two real consumers exist.
- Only create the layers a feature currently needs. Today only `auth` has all
  four layers; other features are presentation-only until they integrate a real
  backend contract.

## App composition

- `src/main.tsx` mounts `<App />`.
- `App.tsx` wraps the tree in the Redux `<Provider store={store}>`, renders
  `RouterProvider`, mounts the `sonner` `Toaster`, and bridges the API client's
  `pathfinder:session-expired` DOM event into the store.

## State management (Redux Toolkit)

- The store lives in `src/app/store/store.ts` (`configureStore`), with typed
  `useAppDispatch`/`useAppSelector` in `src/app/store/hooks.ts`.
- Feature state is owned by slices in the feature's `application` layer. Auth is
  `features/auth/application/auth.slice.ts` (`login` async thunk; `logout`,
  `sessionExpired`, `clearError` actions).
- Presentation reads state through small facade hooks (for example `useAuth`),
  not by touching the store shape directly.
- Async work uses `createAsyncThunk` and calls the feature's `data` layer; thunks
  never call HTTP directly.

## Routing

- All routes are declared in `src/app/router.tsx` with `createBrowserRouter` and
  lazy-loaded page components.
- `/login` is public; everything else renders inside `ProtectedRoute` ->
  `AdminLayout`.
- `ProtectedRoute` (`features/auth/presentation/components`) redirects
  unauthenticated users to `/login`, preserving the attempted location.
- A `*` catch-all redirects to `/`.
- Add new screens by registering them centrally here; do not create ad-hoc routers
  inside features.

## Admin layout shell

`AdminLayout` renders `Sidebar` + `TopBar` + `MaintenanceBanner` +
`SessionExpiredModal` around an `<Outlet />`. It listens for
`pathfinder:session-expired` to surface the session modal. `Sidebar` defines the
grouped navigation; keep its links in sync with routed pages.

## Shared UI, components split, and design tokens

The UI is split into two layers under `src/shared/components`:

- `ui/`: low-level reusable primitives (Radix-based, shadcn-style) - `Button`,
  `Input`, `Dialog`, `Table`, etc. Reuse these before adding new primitives.
- `custom/`: composed, reusable components built on top of `ui` and design
  tokens - `PageHeader`, `StatCard`, `SearchInput`, `StatusBadge`, `LoadingState`,
  `EmptyState`, `ErrorState`, `DataState`, `ConfirmDialog`. Import them from
  `@/shared/components/custom`.

Use `custom` components for the repeating page patterns (headers, metrics,
async state) so feature pages stay thin. Feature-specific components that are not
reusable stay inside the feature's `presentation` folder.

Styling is Tailwind CSS 4 with CSS-variable design tokens defined in
`src/styles/*` (`globals.css`, `theme.css`, `tailwind.css`, `fonts.css`).
Components reference tokens such as `var(--primary)`, `var(--surface)`,
`var(--border)`, and `var(--muted-foreground)`. Use `cn()` from
`@/shared/components/ui/utils` to compose class names. Preserve existing tokens
and primitives before introducing new colors or UI libraries. MUI, Recharts,
lucide-react, and sonner are already available.

## Permissions model

`src/shared/lib/permissions.tsx` is a single-admin pass-through: `usePermissions`
returns role `Admin` with `["*"]` and `has()` always `true`. The exports exist so
older imports keep compiling. Do not reintroduce multi-role RBAC unless the user
explicitly asks.

## Source files inspected

- `src/main.tsx`, `src/app/App.tsx`, `src/app/router.tsx`
- `src/app/layout/AdminLayout.tsx`, `Sidebar.tsx`
- `src/features/auth/*`
- `src/shared/components/ui/*`, `src/shared/lib/permissions.tsx`
- `src/styles/*`
