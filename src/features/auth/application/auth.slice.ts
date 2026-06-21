import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { ApiError } from "@/core/api/api-client"
import { authStorage, type StoredAdmin } from "@/core/auth/auth-storage"
import { decodeJwtRole } from "@/core/auth/jwt"
import { authApi } from "../data/auth.api"
import type { LoginCredentials } from "../domain/auth.types"

export type AuthStatus = "idle" | "loading"

export type AuthState = {
  user: StoredAdmin | null
  status: AuthStatus
  error: string | null
}

const initialState: AuthState = {
  user: authStorage.getUser(),
  status: "idle",
  error: null,
}

export type LoginArgs = { credentials: LoginCredentials; remember: boolean }

/** Authenticate, enforce the admin role, persist tokens, and return the admin. */
export const login = createAsyncThunk<StoredAdmin, LoginArgs, { rejectValue: string }>(
  "auth/login",
  async ({ credentials, remember }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials)
      const role = decodeJwtRole(response.accessToken)
      if (role !== "admin") {
        return rejectWithValue("This account does not have admin access.")
      }
      const admin: StoredAdmin = { ...response.user, role }
      authStorage.save(response.accessToken, response.refreshToken, admin, remember)
      return admin
    } catch (error) {
      if (error instanceof ApiError) return rejectWithValue(error.message)
      return rejectWithValue("Sign in failed")
    }
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      authStorage.clear()
      state.user = null
      state.status = "idle"
      state.error = null
    },
    /** Triggered by the API client on HTTP 401. */
    sessionExpired(state) {
      authStorage.clear()
      state.user = null
      state.status = "idle"
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<StoredAdmin>) => {
        state.status = "idle"
        state.user = action.payload
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "idle"
        state.error = action.payload ?? "Sign in failed"
      })
  },
})

export const { logout, sessionExpired, clearError } = authSlice.actions
export const authReducer = authSlice.reducer
