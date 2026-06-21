export type LoginCredentials = { email: string; password: string }

/**
 * User object returned inside the `/auth/login` data envelope. `role` is not on
 * the user; it lives in the signed JWT and is decoded for UX gating only.
 */
export type BackendUser = {
  id: string
  email: string
  name?: string
  role_id?: string
  is_active?: boolean
  last_login_at?: string | null
  last_active_at?: string | null
  created_at?: string
  updated_at?: string
}

export type LoginResponse = { user: BackendUser; accessToken: string; refreshToken: string }

