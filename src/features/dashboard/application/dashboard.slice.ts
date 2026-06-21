import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ApiError } from "@/core/api/api-client"
import { dashboardApi } from "../data/dashboard.api"
import type { DashboardOverview } from "../domain/dashboard.types"

export type DashboardState = {
  overview: DashboardOverview | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: DashboardState = {
  overview: null,
  status: "idle",
  error: null,
}

export const fetchDashboardOverview = createAsyncThunk<
  DashboardOverview,
  void,
  { rejectValue: string }
>("dashboard/fetchOverview", async (_, { rejectWithValue }) => {
  try {
    return await dashboardApi.getOverview()
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to load dashboard")
  }
})

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.overview = action.payload
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Failed to load dashboard"
      })
  },
})

export const dashboardReducer = dashboardSlice.reducer
