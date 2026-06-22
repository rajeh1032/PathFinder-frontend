/**
 * Types for the system settings feature (admin console).
 *
 * Backend contract source of truth: PathFinder-Backend `settings` module
 * (`src/modules/settings`), mounted at `/api/v1/settings`. Both routes require
 * `authenticate` + `authorize('admin')`:
 *   - `GET /api/v1/settings` -> `{ settings }` (full object, registry defaults
 *     applied for any unset key)
 *   - `PUT /api/v1/settings` -> `{ settings }` (accepts a partial object,
 *     validated by `updateSettingsSchema`, returns the full object)
 *
 * Settings are stored in the generic `system_settings` key/value table; the
 * backend exposes them as a flat, typed object using a fixed registry.
 *
 * The Admin Profile tab is not part of this module: name/email use
 * `GET /users/me` + `PATCH /users/:id`, and the password uses
 * `POST /auth/change-password`.
 */

export type AiProvider = "anthropic" | "openai" | "google"
export type AppLanguage = "en" | "ar" | "fr"

/** Full settings object returned by the backend. */
export type SystemSettingsData = {
  app_name: string
  support_email: string
  default_language: AppLanguage | string
  ai_provider: AiProvider | string
  ai_model: string
  max_tokens: number
  temperature: number
  maintenance_enabled: boolean
  maintenance_message: string
}

/** Partial payload accepted by `PUT /api/v1/settings`. */
export type SystemSettingsUpdate = Partial<SystemSettingsData>
