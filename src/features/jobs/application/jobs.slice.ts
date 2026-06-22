import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ApiError } from "@/core/api/api-client"
import { jobsApi } from "../data/jobs.api"
import type {
  Pagination,
  JobsListParams,
  JobsListResult,
} from "../domain/jobs.types"

const INITIAL_PAGINATION: Pagination = {
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

export type JobsState = {
  items: JobsListResult["items"]
  pagination: Pagination
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: JobsState = {
  items: [],
  pagination: INITIAL_PAGINATION,
  status: "idle",
  error: null,
}

export const fetchJobs = createAsyncThunk<
  JobsListResult,
  JobsListParams | undefined,
  { rejectValue: string }
>("jobs/fetchList", async (params, { rejectWithValue }) => {
  try {
    return await jobsApi.list(params ?? {})
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to load jobs")
  }
})

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Failed to load jobs"
      })
  },
})

export const jobsReducer = jobsSlice.reducer
