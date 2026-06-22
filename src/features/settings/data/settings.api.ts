import { http } from "@/core/api/api-client"
import { apiEndpoints } from "@/core/api/api-endpoints"
import type { BackendUser } from "@/features/auth/domain/auth.types"
import type {
  SystemSettingsData,
  SystemSettingsUpdate,
} from "../domain/settings.types"

export const settingsApi = {
  /**
   * Fetch the full system settings object (admin only).
   *
   * Verified backend route: `GET /api/v1/settings`
   * (`authenticate` + `authorize('admin')`). Returns `{ settings }`.
   */
  async get(): Promise<SystemSettingsData> {
    const data = await http.get<{ settings: SystemSettingsData }>(apiEndpoints.settings.root)
    return data.settings
  },

  /**
   * Upsert a partial settings object (admin only).
   *
   * Verified backend route: `PUT /api/v1/settings`
   * (`authenticate` + `authorize('admin')`, `validateBody(updateSettingsSchema)`).
   * Returns the full `{ settings }` object.
   */
  async update(payload: SystemSettingsUpdate): Promise<SystemSettingsData> {
    const data = await http.put<{ settings: SystemSettingsData }>(apiEndpoints.settings.root, payload)
    return data.settings
  },

  /**
   * Load the authenticated admin's profile.
   *
   * Verified backend route: `GET /api/v1/users/me` (`authenticate`).
   * Returns `{ user }`.
   */
  async getProfile(): Promise<BackendUser> {
    const data = await http.get<{ user: BackendUser }>(apiEndpoints.users.me)
    return data.user
  },

  /**
   * Update the admin's own name/email.
   *
   * Verified backend route: `PATCH /api/v1/users/:id`
   * (`authenticate` + `authorize('admin')`). Returns `{ user }`.
   */
  async updateProfile(userId: string, payload: { name?: string; email?: string }): Promise<BackendUser> {
    const data = await http.patch<{ user: BackendUser }>(apiEndpoints.users.byId(userId), payload)
    return data.user
  },

  /**
   * Change the admin's password.
   *
   * Verified backend route: `POST /api/v1/auth/change-password`
   * (`authenticate`, `validateBody(changePasswordSchema)`). Body is
   * `{ password, newPassword }`.
   */
  async changePassword(payload: { password: string; newPassword: string }): Promise<void> {
    await http.post(apiEndpoints.auth.changePassword, payload)
  },
}
