import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { ApiError } from "@/core/api/api-client"
import { usersApi } from "../data/users.api"
import type { Pagination, UsersListParams, UsersListResult } from "../domain/users.types"

export type UsersState = {
  result: UsersListResult | null
  params: UsersListParams
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: UsersState = {
  result: null,
  params: { page: 1, limit: 20, search: "", status: "" },
  status: "idle",
  error: null,
}

export const fetchUsers = createAsyncThunk<
  UsersListResult,
  UsersListParams,
  { rejectValue: string }
>("users/fetchList", async (params, { rejectWithValue }) => {
  try {
    return await usersApi.list(params)
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to load users")
  }
})

export const setUserActive = createAsyncThunk<
  { id: string; isActive: boolean },
  { id: string; isActive: boolean },
  { rejectValue: string }
>("users/setActive", async ({ id, isActive }, { rejectWithValue }) => {
  try {
    if (isActive) await usersApi.activate(id)
    else await usersApi.deactivate(id)
    return { id, isActive }
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to update user status")
  }
})

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<UsersListParams>) {
      state.params = { ...state.params, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.result = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Failed to load users"
      })
      .addCase(setUserActive.fulfilled, (state, action) => {
        const item = state.result?.items.find((u) => u.id === action.payload.id)
        if (item) {
          item.isActive = action.payload.isActive
          item.status = action.payload.isActive ? "Active" : "Inactive"
        }
      })
  },
})

export const { setParams } = usersSlice.actions
export const usersReducer = usersSlice.reducer
export type { Pagination }
