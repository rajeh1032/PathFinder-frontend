import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ApiError } from "@/core/api/api-client"
import { jobMatchesApi } from "../data/jobMatches.api"
import type {
  JobMatchesListParams,
  JobMatchesListResult,
  Pagination,
} from "../domain/jobMatches.types"

const INITIAL_PAGINATION: Pagination = {
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 1,
}

export type JobMatchesState = {
  items: JobMatchesListResult["items"]
  pagination: Pagination
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: JobMatchesState = {
  items: [],
  pagination: INITIAL_PAGINATION,
  status: "idle",
  error: null,
}

export const fetchJobMatches = createAsyncThunk<
  JobMatchesListResult,
  JobMatchesListParams | undefined,
  { rejectValue: string }
>("jobMatches/fetchList", async (params, { rejectWithValue }) => {
  try {
    return await jobMatchesApi.list(params ?? {})
  } catch (error) {
    if (error instanceof ApiError) return rejectWithValue(error.message)
    return rejectWithValue("Failed to load job matches")
  }
})

const jobMatchesSlice = createSlice({
  name: "jobMatches",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobMatches.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchJobMatches.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchJobMatches.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Failed to load job matches"
      })
  },
})

export const jobMatchesReducer = jobMatchesSlice.reducer
