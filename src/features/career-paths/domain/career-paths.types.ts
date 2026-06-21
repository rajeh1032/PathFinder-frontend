/**
 * Types for the career-paths feature.
 *
 * Backend contract source of truth: `GET /api/v1/interviews/career-paths`
 * (PathFinder-Backend `interviews` module). That endpoint requires
 * authentication, returns ONLY active career paths, and exposes just
 * `id`, `title`, `category`, and `difficulty_level`.
 *
 * There is currently no admin CRUD endpoint for career paths in the backend,
 * so create/update/delete are not represented here as data-layer contracts.
 */

/** Raw career-path object returned by the backend list endpoint. */
export type CareerPathDto = {
  id: string
  title: string
  category: string | null
  difficulty_level: string | null
}

/** Flattened view model used by the admin table. */
export type CareerPathListItem = {
  id: string
  title: string
  category: string
  difficulty_level: string
}
